import { PrismaClient, Prisma } from "@prisma/client";
import { encrypt, decryptDeep } from "./encryption";

// Fields encrypted at rest, per model. Adding a field here makes future
// writes encrypt it; existing rows stay plaintext until the backfill runs
// (see prisma/scripts/encrypt-pii.ts). decrypt() tolerates plaintext, so
// reads keep working through the transition.
const ENCRYPTED_FIELDS: Partial<Record<Prisma.ModelName, readonly string[]>> = {
  User: ["iban", "bic", "bankName"],
  Student: ["healthDetails"],
};

const MUTATING_OPS = new Set([
  "create",
  "createMany",
  "createManyAndReturn",
  "update",
  "updateMany",
  "upsert",
]);

function encryptValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return encrypt(value);
  // Prisma update syntax: { field: { set: "..." } }
  if (typeof value === "object" && "set" in (value as Record<string, unknown>)) {
    const v = (value as { set: unknown }).set;
    if (typeof v === "string") return { ...(value as object), set: encrypt(v) };
  }
  return value;
}

function encryptFields(
  data: Record<string, unknown>,
  fields: readonly string[]
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...data };
  for (const f of fields) {
    if (f in out) out[f] = encryptValue(out[f]);
  }
  return out;
}

function applyEncryption(
  modelFields: readonly string[],
  rawArgs: unknown
): void {
  if (!rawArgs || typeof rawArgs !== "object") return;
  const args = rawArgs as Record<string, unknown>;

  const data = args.data;
  if (Array.isArray(data)) {
    args.data = data.map((row) =>
      row && typeof row === "object"
        ? encryptFields(row as Record<string, unknown>, modelFields)
        : row
    );
  } else if (data && typeof data === "object") {
    args.data = encryptFields(data as Record<string, unknown>, modelFields);
  }

  // upsert: args.create + args.update
  if (args.create && typeof args.create === "object") {
    args.create = encryptFields(args.create as Record<string, unknown>, modelFields);
  }
  if (args.update && typeof args.update === "object") {
    args.update = encryptFields(args.update as Record<string, unknown>, modelFields);
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrisma> | undefined;
};

function createPrisma() {
  const base = new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error", "warn"] : ["error", "warn"],
  });

  return base.$extends({
    name: "field-encryption",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const fields = ENCRYPTED_FIELDS[model as Prisma.ModelName];
          if (fields && MUTATING_OPS.has(operation)) {
            applyEncryption(fields, args);
          }
          const result = await query(args);
          // Decrypt any encrypted strings anywhere in the result tree —
          // this handles nested includes (e.g. Student.parent.iban) without
          // having to know the relation graph here.
          return decryptDeep(result);
        },
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
