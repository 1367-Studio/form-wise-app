/**
 * One-shot backfill: encrypt plaintext PII columns in-place.
 *
 *   tsx --env-file=.env prisma/scripts/encrypt-pii.ts          # dry run
 *   tsx --env-file=.env prisma/scripts/encrypt-pii.ts --apply  # commit
 *
 * Idempotent — already-encrypted values (prefix "enc:v1:") are skipped.
 * Uses a RAW PrismaClient (no extension), so writes here don't double-encrypt.
 */
import { PrismaClient } from "@prisma/client";
import { encrypt, isEncrypted } from "../../src/lib/encryption";

const prisma = new PrismaClient();
const apply = process.argv.includes("--apply");

async function backfillUsers() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { iban: { not: null } },
        { bic: { not: null } },
        { bankName: { not: null } },
      ],
    },
    select: { id: true, iban: true, bic: true, bankName: true },
  });

  let touched = 0;
  for (const u of users) {
    const data: { iban?: string; bic?: string; bankName?: string } = {};
    if (u.iban && !isEncrypted(u.iban)) data.iban = encrypt(u.iban);
    if (u.bic && !isEncrypted(u.bic)) data.bic = encrypt(u.bic);
    if (u.bankName && !isEncrypted(u.bankName)) data.bankName = encrypt(u.bankName);
    if (Object.keys(data).length === 0) continue;
    touched++;
    if (apply) await prisma.user.update({ where: { id: u.id }, data });
  }
  console.log(`User: ${touched} row(s) ${apply ? "encrypted" : "would be encrypted"}`);
}

async function backfillStudents() {
  const students = await prisma.student.findMany({
    where: { healthDetails: { not: null } },
    select: { id: true, healthDetails: true },
  });

  let touched = 0;
  for (const s of students) {
    if (!s.healthDetails || isEncrypted(s.healthDetails)) continue;
    touched++;
    if (apply) {
      await prisma.student.update({
        where: { id: s.id },
        data: { healthDetails: encrypt(s.healthDetails) },
      });
    }
  }
  console.log(`Student: ${touched} row(s) ${apply ? "encrypted" : "would be encrypted"}`);
}

async function main() {
  console.log(apply ? "Mode: APPLY (writes)" : "Mode: dry-run (no writes)");
  await backfillUsers();
  await backfillStudents();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
