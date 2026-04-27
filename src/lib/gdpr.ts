import { prisma } from "./prisma";

type Role = "PARENT" | "TEACHER" | "DIRECTOR" | "SUPER_ADMIN" | "STAFF";

// ---------------------------------------------------------------------------
// GDPR Article 15 — Right of access (data export)
// ---------------------------------------------------------------------------
// Returns a structured snapshot of every personal data record we hold for
// this user. Encrypted columns (iban/bic/bankName/healthDetails) are
// transparently decrypted by the prisma extension.

export async function buildUserExport(userId: string, role: Role) {
  const profile = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      phone: true,
      civility: true,
      address: true,
      iban: true,
      bic: true,
      bankName: true,
      tenantId: true,
      createdAt: true,
    },
  });

  if (!profile) return null;

  const generatedAt = new Date().toISOString();

  if (role === "PARENT") {
    const [students, journalReads, notificationReads] = await Promise.all([
      prisma.student.findMany({
        where: { parentId: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          birthDate: true,
          address: true,
          hasHealthIssues: true,
          healthDetails: true,
          canLeaveAlone: true,
          status: true,
          createdAt: true,
          class: { select: { name: true } },
          documents: {
            select: {
              id: true,
              fileName: true,
              fileType: true,
              url: true,
              createdAt: true,
            },
          },
          attendance: {
            select: {
              id: true,
              date: true,
              status: true,
              notes: true,
              justificationNotes: true,
              justifiedAt: true,
            },
          },
        },
      }),
      prisma.journalRead.findMany({
        where: { parentId: userId },
        select: { journalId: true, readAt: true },
      }),
      prisma.notificationRead.findMany({
        where: { parentId: userId },
        select: { notificationId: true, readAt: true },
      }),
    ]);

    return {
      generatedAt,
      profile,
      children: students,
      journalReads,
      notificationReads,
    };
  }

  if (role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({
      where: { userId },
      select: {
        id: true,
        classId: true,
        subjectId: true,
        tenantId: true,
      },
    });

    const [journals, notificationReads] = await Promise.all([
      teacher
        ? prisma.dailyJournal.findMany({
            where: { teacherId: teacher.id },
            select: {
              id: true,
              date: true,
              classSummary: true,
              homework: true,
              createdAt: true,
            },
          })
        : Promise.resolve([]),
      teacher
        ? prisma.notificationReadTeacher.findMany({
            where: { teacherId: teacher.id },
            select: { notificationId: true, readAt: true },
          })
        : Promise.resolve([]),
    ]);

    return {
      generatedAt,
      profile,
      teacher,
      journalEntries: journals,
      notificationReads,
    };
  }

  if (role === "STAFF") {
    const staff = await prisma.staff.findMany({
      where: { userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        roleLabel: true,
        createdAt: true,
        validatedAt: true,
      },
    });
    return { generatedAt, profile, staff };
  }

  // DIRECTOR / SUPER_ADMIN: only personal profile is exported here. Tenant
  // data belongs to the school as a separate controller.
  return { generatedAt, profile };
}

// ---------------------------------------------------------------------------
// GDPR Article 17 — Right to erasure
// ---------------------------------------------------------------------------
// We anonymize rather than hard-delete. Reasons:
//   - Foreign-key integrity: dropping a User row breaks Student.parentId,
//     Notification, JournalRead, etc.
//   - Legal-retention obligations: financial transactions (Stripe), audit
//     logs, and academic records may have retention requirements that
//     override the right to erasure (GDPR Art. 17(3)(b)(e)).
// Anonymization replaces all PII with non-identifying placeholders and
// bumps tokenVersion so any active session is invalidated.

const ANON_DOMAIN = "deleted.invalid";

function anonEmailFor(userId: string): string {
  return `deleted-${userId}@${ANON_DOMAIN}`;
}

const ANON_USER_FIELDS = {
  firstName: "[deleted]",
  lastName: "[deleted]",
  phone: "",
  civility: null,
  address: null,
  iban: null,
  bic: null,
  bankName: null,
  password: null,
  inviteToken: null,
} as const;

export async function eraseParent(userId: string) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!user || user.role !== "PARENT") {
      throw new Error("Not a parent account");
    }

    // Anonymize children's PII. We keep the row so the school's academic
    // records (attendance, class assignment) stay referentially intact.
    await tx.student.updateMany({
      where: { parentId: userId },
      data: {
        firstName: "[deleted]",
        lastName: "[deleted]",
        address: "",
        healthDetails: null,
        hasHealthIssues: false,
        canLeaveAlone: false,
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: {
        ...ANON_USER_FIELDS,
        email: anonEmailFor(userId),
        tokenVersion: { increment: 1 },
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: userId,
        action: "GDPR_ERASURE",
        targetType: "User",
        targetId: userId,
        metadata: { role: "PARENT" },
      },
    });
  });
}

export async function eraseTeacher(userId: string) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!user || user.role !== "TEACHER") {
      throw new Error("Not a teacher account");
    }

    // Detach the teacher record from the user but keep daily journal entries
    // (they're part of the school's academic record).
    await tx.teacher.updateMany({
      where: { userId },
      data: { userId: null },
    });

    await tx.user.update({
      where: { id: userId },
      data: {
        ...ANON_USER_FIELDS,
        email: anonEmailFor(userId),
        tokenVersion: { increment: 1 },
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: userId,
        action: "GDPR_ERASURE",
        targetType: "User",
        targetId: userId,
        metadata: { role: "TEACHER" },
      },
    });
  });
}

export async function eraseStaff(userId: string) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!user || user.role !== "STAFF") {
      throw new Error("Not a staff account");
    }

    await tx.staff.updateMany({
      where: { userId },
      data: { userId: null },
    });

    await tx.user.update({
      where: { id: userId },
      data: {
        ...ANON_USER_FIELDS,
        email: anonEmailFor(userId),
        tokenVersion: { increment: 1 },
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: userId,
        action: "GDPR_ERASURE",
        targetType: "User",
        targetId: userId,
        metadata: { role: "STAFF" },
      },
    });
  });
}
