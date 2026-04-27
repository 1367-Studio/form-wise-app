// import { prisma } from "../../../../../lib/prisma";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../../../../../lib/authOptions";
// import { redirect } from "next/navigation";

// import {
//   Breadcrumb,
//   BreadcrumbList,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
// import { Slash } from "lucide-react";
// import TenantDetailCard from "../../../../../components/TenantDetailCard";

// // Updated interface for Next.js 15+
// interface PageProps {
//   params: Promise<{ id: string }>;
// }

// export default async function TenantDetailPage({ params }: PageProps) {
//   // Await the params since it's now a Promise in Next.js 15+
//   const { id } = await params;

//   // 🔐 Récupérer la session
//   const session = await getServerSession(authOptions);

//   console.log("🧠 SESSION DEBUG:", session);

//   // 🔒 Si pas connecté → redirection
//   if (!session) {
//     console.warn("🔒 Aucune session trouvée → redirection login");
//     redirect("/login");
//   }

//   // ❌ Si pas SUPER_ADMIN → redirection
//   if (session.user.role !== "SUPER_ADMIN") {
//     console.warn("⛔ Accès refusé : rôle ≠ SUPER_ADMIN → redirection login");
//     redirect("/login");
//   }

//   const tenant = await prisma.tenant.findUnique({
//     where: { id },
//     include: {
//       users: {
//         where: { role: "DIRECTOR" },
//         select: {
//           firstName: true,
//           lastName: true,
//           email: true,
//           phone: true,
//         },
//       },
//     },
//   });

//   if (!tenant) {
//     return <div className="p-6">❌ École introuvable.</div>;
//   }

//   const schoolName = tenant.name;

//   return (
//     <div className="p-6 space-y-4">
//       <Breadcrumb className="mb-4">
//         <BreadcrumbList>
//           <BreadcrumbItem>
//             <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
//           </BreadcrumbItem>
//           <BreadcrumbSeparator>
//             <Slash className="h-4 w-4 text-muted-foreground" />
//           </BreadcrumbSeparator>
//           <BreadcrumbItem>
//             <BreadcrumbLink href="#" aria-current="page">
//               {schoolName}
//             </BreadcrumbLink>
//           </BreadcrumbItem>
//         </BreadcrumbList>
//       </Breadcrumb>

//       <TenantDetailCard tenant={tenant} />
//     </div>
//   );
// }
import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/authOptions";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Slash } from "lucide-react";
import TenantDetailCard from "../../../../../components/TenantDetailCard";

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

// Helper function to get session with retry
async function getSessionWithRetry(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.role) {
        return session;
      }
      // If no valid session, wait a bit and retry (only in production)
      if (process.env.NODE_ENV === "production" && i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`Session attempt ${i + 1} failed:`, error);
      if (i === maxRetries - 1) throw error;
    }
  }
  return null;
}

export default async function TenantDetailPage({ params }: PageProps) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "TenantDetailPage" });

  // 🔐 Récupérer la session avec retry
  const session = await getSessionWithRetry();

  console.log("🧠 SESSION DEBUG:", {
    exists: !!session,
    hasUser: !!session?.user,
    userRole: session?.user?.role,
    userId: session?.user?.id,
    environment: process.env.NODE_ENV,
  });

  // 🔒 Si pas connecté → redirection
  if (!session || !session.user) {
    console.warn("🔒 Aucune session trouvée → redirection login");
    redirect("/login");
  }

  // More robust role checking
  const userRole = session.user.role;

  // ❌ Si pas SUPER_ADMIN → redirection
  if (!userRole || userRole !== "SUPER_ADMIN") {
    console.warn(
      `⛔ Accès refusé : rôle "${userRole}" ≠ SUPER_ADMIN → redirection login`
    );
    redirect("/login");
  }

  let tenant;
  let stats;
  try {
    const [tenantData, students, teachers, classes, parents, lastStudent] =
      await Promise.all([
        prisma.tenant.findUnique({
          where: { id },
          include: {
            users: {
              where: { role: "DIRECTOR" },
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        }),
        prisma.student.count({ where: { tenantId: id } }),
        prisma.teacher.count({ where: { tenantId: id } }),
        prisma.class.count({ where: { tenantId: id } }),
        prisma.user.count({ where: { tenantId: id, role: "PARENT" } }),
        prisma.student.findFirst({
          where: { tenantId: id },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        }),
      ]);

    tenant = tenantData;
    stats = {
      students,
      teachers,
      classes,
      parents,
      lastActivity: lastStudent?.createdAt?.toISOString() ?? null,
    };
  } catch (error) {
    console.error("Tenant fetch error:", error);
    return <div className="p-6">{t("loadError")}</div>;
  }

  if (!tenant) {
    console.warn(`Tenant not found for id: ${id}`);
    return <div className="p-6">{t("notFound")}</div>;
  }

  const schoolName = tenant.name;

  return (
    <div className="p-6 space-y-4">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard">
              {t("breadcrumbDashboard")}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <Slash className="h-4 w-4 text-muted-foreground" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="#" aria-current="page">
              {schoolName}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <TenantDetailCard tenant={tenant} stats={stats} />
    </div>
  );
}
