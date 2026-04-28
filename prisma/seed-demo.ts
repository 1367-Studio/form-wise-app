// prisma/seed-demo.ts
// Idempotent demo seed: clears any existing tenant with schoolCode DEMO_SCHOOL_CODE
// then rebuilds it with French/English realistic names so the app can be demoed.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Use direct connection (port 5432) for seeding — the pgbouncer pool (6543)
// can produce FK visibility hiccups during burst writes.
const prisma = new PrismaClient({
  datasourceUrl: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});

const DEMO_SCHOOL_CODE = "DEMO-2026";
const DEMO_TENANT_NAME = "École Saint-Exupéry";
const DEMO_PASSWORD = "Demo2026!";

const DIRECTOR_EMAIL = "director@demo.formwise.fr";
const TEACHER_EMAIL = "teacher@demo.formwise.fr";
const PARENT_EMAIL = "parent@demo.formwise.fr";

const FIRST_NAMES_FR_M = [
  "Jean", "Pierre", "Hugo", "Louis", "Antoine", "Julien", "Théo", "Lucas",
  "Adrien", "Maxime", "Romain", "Alexandre", "Jules", "Léo", "Baptiste",
  "Mathis", "Nathan", "Raphaël", "Gabriel", "Arthur", "Tom", "Noah",
];
const FIRST_NAMES_FR_F = [
  "Marie", "Sophie", "Léa", "Emma", "Camille", "Chloé", "Mathilde", "Clara",
  "Inès", "Manon", "Nina", "Charlotte", "Lola", "Élise", "Pauline", "Alice",
  "Louise", "Jade", "Anaïs", "Juliette", "Margaux", "Sarah",
];
const FIRST_NAMES_EN_M = [
  "James", "William", "Oliver", "Henry", "Charles", "Edward", "Max", "Jack",
  "George", "Thomas", "Daniel", "Samuel",
];
const FIRST_NAMES_EN_F = [
  "Anna", "Lucy", "Emily", "Grace", "Olivia", "Sophia", "Lily", "Charlotte",
  "Emma", "Hannah", "Amelia", "Isabella",
];

const LAST_NAMES = [
  "Martin", "Bernard", "Dubois", "Petit", "Robert", "Richard", "Durand",
  "Moreau", "Laurent", "Simon", "Michel", "Lefebvre", "Leroy", "Roux",
  "David", "Bertrand", "Morel", "Fournier", "Girard", "Bonnet", "Dupont",
  "Lambert", "Fontaine", "Rousseau", "Vincent", "Mercier", "Smith",
  "Johnson", "Williams", "Brown", "Wilson", "Taylor", "Anderson",
];

const STREETS = [
  "rue de la République", "avenue Victor Hugo", "boulevard Voltaire",
  "rue des Lilas", "avenue de la Liberté", "rue Pasteur", "rue Jean Jaurès",
  "place de la Mairie", "rue du Général de Gaulle", "boulevard Saint-Michel",
  "rue des Écoles", "avenue Foch", "rue de la Paix", "chemin des Roses",
];

const CITIES = [
  { city: "Paris", zip: "75011" },
  { city: "Lyon", zip: "69006" },
  { city: "Marseille", zip: "13001" },
  { city: "Toulouse", zip: "31000" },
  { city: "Nice", zip: "06000" },
  { city: "Bordeaux", zip: "33000" },
  { city: "Lille", zip: "59000" },
  { city: "Nantes", zip: "44000" },
];

function rand<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function randomPhone(i: number): string {
  // French mobile: 06 XX XX XX XX
  const n = (1000000 + (i * 8675309) % 99999999).toString().padStart(8, "0");
  return `06${n.slice(0, 8)}`.slice(0, 10);
}

function randomAddress(i: number): string {
  const num = ((i * 7) % 90) + 1;
  const street = rand(STREETS, i);
  const c = rand(CITIES, i);
  return `${num} ${street}, ${c.zip} ${c.city}`;
}

function birthDateForClass(className: string, i: number): Date {
  // Approx ages by class (FR system) — class age in years on Sept 1 of school year
  const ageByClass: Record<string, number> = {
    "Petite Section": 3, "Moyenne Section": 4, "Grande Section": 5,
    CP: 6, CE1: 7, CE2: 8,
  };
  const age = ageByClass[className] ?? 6;
  const now = new Date();
  const year = now.getFullYear() - age;
  const month = (i * 5) % 12;
  const day = ((i * 13) % 27) + 1;
  return new Date(Date.UTC(year, month, day));
}

async function clearExistingDemoTenant() {
  const existing = await prisma.tenant.findUnique({
    where: { schoolCode: DEMO_SCHOOL_CODE },
  });
  if (!existing) return;

  console.log(`🧹 Clearing existing demo tenant ${existing.id}…`);
  const tenantId = existing.id;

  // Order matters — delete leaves first (respect FK).
  await prisma.$transaction([
    prisma.pickupEvent.deleteMany({ where: { tenantId } }),
    prisma.pickupAuthorization.deleteMany({ where: { tenantId } }),
    prisma.attendance.deleteMany({ where: { tenantId } }),
    prisma.journalRead.deleteMany({
      where: { journal: { tenantId } },
    }),
    prisma.dailyJournal.deleteMany({ where: { tenantId } }),
    prisma.notificationReadTeacher.deleteMany({
      where: { notification: { tenantId } },
    }),
    prisma.notificationRead.deleteMany({
      where: { notification: { tenantId } },
    }),
    prisma.notification.deleteMany({ where: { tenantId } }),
    prisma.document.deleteMany({
      where: { student: { tenantId } },
    }),
    prisma.pushSubscription.deleteMany({
      where: { user: { tenantId } },
    }),
    prisma.student.deleteMany({ where: { tenantId } }),
    prisma.teacher.deleteMany({ where: { tenantId } }),
    prisma.subject.deleteMany({ where: { tenantId } }),
    prisma.class.deleteMany({ where: { tenantId } }),
    prisma.schoolYear.deleteMany({ where: { tenantId } }),
    prisma.staff.deleteMany({ where: { tenantId } }),
    prisma.invitedParent.deleteMany({ where: { tenantId } }),
    prisma.preRegistrationParent.deleteMany({ where: { tenantId } }),
    prisma.user.deleteMany({ where: { tenantId } }),
    prisma.tenant.delete({ where: { id: tenantId } }),
  ]);
  console.log("✅ Cleared.");
}

async function main() {
  console.log("🌱 Demo seed starting…");

  await clearExistingDemoTenant();

  const password = await bcrypt.hash(DEMO_PASSWORD, 10);

  // Tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: DEMO_TENANT_NAME,
      email: "contact@demo.formwise.fr",
      schoolCode: DEMO_SCHOOL_CODE,
      uniqueNumber: 100001,
      billingPlan: "MONTHLY",
      subscriptionStatus: "ACTIVE",
      status: "ACTIVE",
      phone: "0145678900",
      address: "10 rue des Écoles, 75005 Paris",
    },
  });
  console.log(`🏫 Tenant: ${tenant.name} (${tenant.schoolCode})`);

  // School year
  const now = new Date();
  const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 8, 1)); // Sept 1
  const yearEnd = new Date(Date.UTC(now.getUTCFullYear() + 1, 6, 5)); // Jul 5
  const schoolYear = await prisma.schoolYear.create({
    data: {
      name: `${yearStart.getUTCFullYear()}-${yearEnd.getUTCFullYear()}`,
      startDate: yearStart,
      endDate: yearEnd,
      tenantId: tenant.id,
    },
  });

  // Classes
  const classDefs = [
    { name: "Petite Section", monthlyFee: 320 },
    { name: "Moyenne Section", monthlyFee: 320 },
    { name: "Grande Section", monthlyFee: 350 },
    { name: "CP", monthlyFee: 380 },
    { name: "CE1", monthlyFee: 380 },
    { name: "CE2", monthlyFee: 400 },
  ];
  const classes = [];
  for (const c of classDefs) {
    classes.push(
      await prisma.class.create({
        data: {
          name: c.name,
          monthlyFee: c.monthlyFee,
          schoolYearId: schoolYear.id,
          tenantId: tenant.id,
        },
      })
    );
  }

  // Subjects per class
  const subjectsByClass = new Map<string, { id: string; name: string }[]>();
  const subjectNames = ["Français", "Mathématiques", "Découverte du monde", "Anglais", "Arts plastiques", "EPS"];
  for (const cls of classes) {
    const list = [];
    for (const name of subjectNames) {
      const s = await prisma.subject.create({
        data: { name, classId: cls.id, tenantId: tenant.id },
      });
      list.push({ id: s.id, name });
    }
    subjectsByClass.set(cls.id, list);
  }

  // Director
  const director = await prisma.user.create({
    data: {
      email: DIRECTOR_EMAIL,
      password,
      role: "DIRECTOR",
      firstName: "Sophie",
      lastName: "Lambert",
      phone: "0612345678",
      civility: "Mme",
      address: "10 rue des Écoles, 75005 Paris",
      tenantId: tenant.id,
    },
  });

  // Staff
  const staffDefs = [
    { firstName: "Isabelle", lastName: "Garnier", roleLabel: "Secrétaire" },
    { firstName: "Marc", lastName: "Roussel", roleLabel: "Assistant administratif" },
    { firstName: "Anne", lastName: "Lefèvre", roleLabel: "Comptable" },
  ];
  for (let i = 0; i < staffDefs.length; i++) {
    const s = staffDefs[i];
    const u = await prisma.user.create({
      data: {
        email: `staff${i + 1}@demo.formwise.fr`,
        password,
        role: "STAFF",
        firstName: s.firstName,
        lastName: s.lastName,
        phone: randomPhone(i + 100),
        civility: i % 2 === 0 ? "Mme" : "M",
        tenantId: tenant.id,
      },
    });
    await prisma.staff.create({
      data: {
        email: u.email,
        firstName: s.firstName,
        lastName: s.lastName,
        phone: u.phone,
        roleLabel: s.roleLabel,
        used: true,
        accepted: true,
        validatedAt: new Date(),
        userId: u.id,
        tenantId: tenant.id,
        schoolCode: DEMO_SCHOOL_CODE,
      },
    });
  }

  // Teachers — 10 users + Teacher records, mapped to classes/subjects
  // First teacher uses TEACHER_EMAIL; will be assigned to CP / Français.
  const teacherDefs = [
    { first: "Camille", last: "Moreau" },
    { first: "Julien", last: "Dubois" },
    { first: "Marie", last: "Bernard" },
    { first: "Pierre", last: "Petit" },
    { first: "Emily", last: "Smith" },
    { first: "Antoine", last: "Laurent" },
    { first: "James", last: "Williams" },
    { first: "Charlotte", last: "Vincent" },
    { first: "Olivia", last: "Brown" },
    { first: "Hugo", last: "Roux" },
  ];
  const teachers: { teacherId: string; userId: string; classId: string }[] = [];
  for (let i = 0; i < teacherDefs.length; i++) {
    const def = teacherDefs[i];
    const email = i === 0 ? TEACHER_EMAIL : `teacher${i + 1}@demo.formwise.fr`;
    const u = await prisma.user.create({
      data: {
        email,
        password,
        role: "TEACHER",
        firstName: def.first,
        lastName: def.last,
        phone: randomPhone(i + 200),
        civility: i % 2 === 0 ? "Mme" : "M",
        tenantId: tenant.id,
      },
    });
    // First teacher → CP. Others spread across classes.
    const cls = i === 0 ? classes.find((c) => c.name === "CP")! : classes[i % classes.length];
    const subjects = subjectsByClass.get(cls.id)!;
    const subj = i === 0 ? subjects.find((s) => s.name === "Français")! : subjects[i % subjects.length];

    const t = await prisma.teacher.create({
      data: {
        userId: u.id,
        classId: cls.id,
        subjectId: subj.id,
        tenantId: tenant.id,
      },
    });
    teachers.push({ teacherId: t.id, userId: u.id, classId: cls.id });
  }

  // Parents (50). Index 0 = login parent with 2 children.
  const parents: { id: string; firstName: string; lastName: string }[] = [];
  for (let i = 0; i < 50; i++) {
    // Mix FR and EN names; ~25% English
    const isEnglish = i % 4 === 0;
    const isFemale = i % 2 === 0;
    const firstNames = isEnglish
      ? (isFemale ? FIRST_NAMES_EN_F : FIRST_NAMES_EN_M)
      : (isFemale ? FIRST_NAMES_FR_F : FIRST_NAMES_FR_M);
    const firstName = rand(firstNames, i);
    const lastName = rand(LAST_NAMES, i + 7);
    const email = i === 0 ? PARENT_EMAIL : `parent${i + 1}@demo.formwise.fr`;
    const u = await prisma.user.create({
      data: {
        email,
        password,
        role: "PARENT",
        firstName,
        lastName,
        phone: randomPhone(i + 1000),
        civility: isFemale ? "Mme" : "M",
        address: randomAddress(i),
        tenantId: tenant.id,
        iban: `FR76 3000 1000 ${(1000 + i).toString().padStart(4, "0")} 0000 0000 ${(100 + i).toString().padStart(3, "0")}`,
        bic: "BNPAFRPP",
        bankName: "BNP Paribas",
      },
    });
    parents.push({ id: u.id, firstName, lastName });
  }

  // Students — login parent (index 0) gets 2 children, parents 1-29 get 1, 30-44 get 2, 45-49 get 3
  function childCount(parentIdx: number): number {
    if (parentIdx === 0) return 2;
    if (parentIdx < 30) return 1;
    if (parentIdx < 45) return 2;
    return 3;
  }
  const students: { id: string; classId: string }[] = [];
  let studentSeed = 0;
  for (let p = 0; p < parents.length; p++) {
    const parent = parents[p];
    const n = childCount(p);
    for (let c = 0; c < n; c++) {
      const isFemale = (studentSeed + c) % 2 === 0;
      const firstNames = (studentSeed % 5 === 0)
        ? (isFemale ? FIRST_NAMES_EN_F : FIRST_NAMES_EN_M)
        : (isFemale ? FIRST_NAMES_FR_F : FIRST_NAMES_FR_M);
      const firstName = rand(firstNames, studentSeed + c);
      const cls = classes[studentSeed % classes.length];
      const s = await prisma.student.create({
        data: {
          firstName,
          lastName: parent.lastName, // child shares parent's surname for realism
          birthDate: birthDateForClass(cls.name, studentSeed),
          address: randomAddress(p),
          hasHealthIssues: studentSeed % 11 === 0,
          healthDetails: studentSeed % 11 === 0 ? "Asthme léger, ventoline en cas d'effort" : null,
          canLeaveAlone: studentSeed % 7 === 0 && cls.name === "CE2",
          status: "APPROVED",
          parentId: parent.id,
          classId: cls.id,
          tenantId: tenant.id,
        },
      });
      students.push({ id: s.id, classId: cls.id });
      studentSeed++;
    }
  }
  console.log(`👨‍👩‍👧 ${parents.length} parents, ${students.length} students`);

  // Notifications (mixed categories, some global)
  const categories = [
    "GENERAL", "ANNOUNCEMENT", "ACADEMIC", "ATTENDANCE", "BILLING", "EVENT", "HEALTH",
  ] as const;
  const globalNotifs = [
    { title: "Réunion parents-professeurs", message: "La réunion aura lieu le vendredi 14 mai à 18h00 dans le hall principal.", category: "EVENT" as const },
    { title: "Rentrée scolaire 2025-2026", message: "Bienvenue à toutes les familles pour cette nouvelle année !", category: "ANNOUNCEMENT" as const },
    { title: "Mise à jour des frais de scolarité", message: "Veuillez consulter votre espace facturation.", category: "BILLING" as const },
    { title: "Sortie scolaire au Louvre", message: "Inscription ouverte jusqu'au 30 mai. Tarif : 15€.", category: "EVENT" as const },
    { title: "Vaccination : campagne de rappel", message: "L'infirmerie scolaire propose les rappels DTP du 12 au 16 mai.", category: "HEALTH" as const },
  ];
  for (const n of globalNotifs) {
    await prisma.notification.create({
      data: {
        title: n.title,
        message: n.message,
        category: n.category,
        isGlobal: true,
        tenantId: tenant.id,
        createdAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 14),
      },
    });
  }
  // Per-student notifications — 25 random
  for (let i = 0; i < 25; i++) {
    const stu = students[i % students.length];
    const t = teachers[i % teachers.length];
    const cat = categories[i % categories.length];
    await prisma.notification.create({
      data: {
        title: cat === "ACADEMIC"
          ? "Excellent travail cette semaine"
          : cat === "ATTENDANCE"
          ? "Absence non justifiée"
          : cat === "HEALTH"
          ? "Petit malaise en récréation"
          : "Mot de l'enseignant",
        message: cat === "ACADEMIC"
          ? "Votre enfant a fait de très bons progrès en lecture cette semaine."
          : cat === "ATTENDANCE"
          ? "Votre enfant était absent ce matin. Merci de justifier."
          : cat === "HEALTH"
          ? "Votre enfant s'est légèrement cogné en récréation. Tout va bien."
          : "Petite information de l'équipe pédagogique.",
        category: cat,
        isGlobal: false,
        studentId: stu.id,
        teacherId: t.teacherId,
        tenantId: tenant.id,
        createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 8),
      },
    });
  }

  // Daily journals — last 10 weekdays, 1 per class per teacher
  const weekdays: Date[] = [];
  {
    const d = new Date();
    while (weekdays.length < 10) {
      d.setUTCDate(d.getUTCDate() - 1);
      const dow = d.getUTCDay();
      if (dow !== 0 && dow !== 6) {
        weekdays.push(new Date(d));
      }
    }
  }
  for (const cls of classes) {
    const teacher = teachers.find((t) => t.classId === cls.id);
    if (!teacher) continue;
    for (const date of weekdays) {
      const subjects = subjectsByClass.get(cls.id)!;
      await prisma.dailyJournal.create({
        data: {
          tenantId: tenant.id,
          classId: cls.id,
          subjectId: subjects[0].id,
          teacherId: teacher.teacherId,
          date,
          classSummary: `Aujourd'hui en ${cls.name}, nous avons travaillé sur la lecture et les mathématiques. Les élèves étaient très attentifs.`,
          homework: "Relire la leçon page 24 et faire l'exercice 3.",
        },
      });
    }
  }

  // Attendance — last 5 weekdays, all students PRESENT except a few ABSENT/LATE
  const last5 = weekdays.slice(0, 5);
  for (let si = 0; si < students.length; si++) {
    const stu = students[si];
    const teacher = teachers.find((t) => t.classId === stu.classId);
    if (!teacher) continue;
    for (let di = 0; di < last5.length; di++) {
      const seed = si * 7 + di * 3;
      const status = seed % 23 === 0 ? "ABSENT" : seed % 31 === 0 ? "LATE" : "PRESENT";
      await prisma.attendance.create({
        data: {
          tenantId: tenant.id,
          classId: stu.classId,
          studentId: stu.id,
          date: last5[di],
          status,
          markedByTeacherId: teacher.teacherId,
          notes: status === "LATE" ? "Arrivé avec 15 minutes de retard." : null,
        },
      });
    }
  }

  // Pickup authorizations — 1 per student (a relative); director is created-by
  const relationships = ["Grand-mère", "Grand-père", "Tante", "Oncle", "Nounou", "Ami(e) de la famille"];
  for (let i = 0; i < students.length; i++) {
    const stu = students[i];
    const isFemale = i % 2 === 0;
    const firstName = rand(isFemale ? FIRST_NAMES_FR_F : FIRST_NAMES_FR_M, i + 33);
    const lastName = rand(LAST_NAMES, i + 17);
    await prisma.pickupAuthorization.create({
      data: {
        studentId: stu.id,
        tenantId: tenant.id,
        firstName,
        lastName,
        relationship: rand(relationships, i),
        phone: randomPhone(i + 5000),
        notes: i % 4 === 0 ? "Récupère les mardis et jeudis." : null,
        createdByUserId: director.id,
      },
    });
  }

  console.log("\n✅ Demo seed complete!\n");
  console.log("─────────────────────────────────────────────");
  console.log(`🏫 School:    ${tenant.name}`);
  console.log(`🔑 Code:      ${tenant.schoolCode}`);
  console.log("─────────────────────────────────────────────");
  console.log("🔐 Login credentials (password for all: " + DEMO_PASSWORD + ")");
  console.log(`   Director: ${DIRECTOR_EMAIL}`);
  console.log(`   Teacher:  ${TEACHER_EMAIL}`);
  console.log(`   Parent:   ${PARENT_EMAIL}  (has 2 children)`);
  console.log("─────────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
