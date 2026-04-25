import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export type AuditAction =
  | "auth.password_changed"
  | "auth.signed_out_everywhere"
  | "tenant.status_changed"
  | "broadcast.sent"
  | "impersonation.started"
  | "impersonation.ended";

export async function writeAudit(args: {
  actorUserId: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  action: AuditAction;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorUserId: args.actorUserId,
        actorEmail: args.actorEmail ?? null,
        actorRole: args.actorRole ?? null,
        action: args.action,
        targetType: args.targetType ?? null,
        targetId: args.targetId ?? null,
        metadata: (args.metadata as Prisma.InputJsonValue | undefined) ?? Prisma.JsonNull,
      },
    });
  } catch (e) {
    // Never fail the calling request because of an audit-write failure.
    console.error("audit write failed:", e);
  }
}
