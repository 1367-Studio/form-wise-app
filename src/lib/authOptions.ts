import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import type { AuthOptions, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

// ----- Strict Enums -----
type UserRole = "PARENT" | "TEACHER" | "DIRECTOR" | "SUPER_ADMIN" | "STAFF";
type SubscriptionStatus = "ACTIVE" | "FREE_TRIAL" | "EXPIRED";

// ----- AppUser Token Shape -----
interface AppUser {
  id: string;
  email: string;
  role: UserRole;
  phone: string;
  tenantId: string | null;
  rememberMe?: boolean;
  firstName?: string;
  lastName?: string;
  civility?: string | null;
  subscriptionStatus?: SubscriptionStatus;
  billingPlan?: string;
  trialEndsAt?: string | null;
  schoolCode?: string | null;
  tokenVersion?: number;
}

// ----- JWT Token Shape -----
interface AppToken extends JWT {
  user?: AppUser;
  role?: UserRole;
  rememberMe?: boolean;
}

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Rester connecté", type: "checkbox" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { tenant: true },
        });

        const allowedRoles: UserRole[] = [
          "PARENT",
          "TEACHER",
          "DIRECTOR",
          "STAFF",
          "SUPER_ADMIN",
        ];

        if (!user || !allowedRoles.includes(user.role) || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) {
          return null;
        }

        const rememberMe =
          credentials.rememberMe === "true" || credentials.rememberMe === "on";

        // Retourner un objet compatible avec le type User
        // Pour les SUPER_ADMIN sans tenant, on peut avoir tenantId null
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId, // Garder la valeur originale (peut être null)
          rememberMe,
        } as User;
      },
    }),
  ],
  callbacks: {
    async signIn() {
      return true;
    },

    async jwt({ token, user }): Promise<JWT> {
      // Spécifier explicitement le type de retour
      const typedToken = token as AppToken;

      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { tenant: true },
        });

        if (!dbUser) {
          return typedToken;
        }

        const allowedStatuses = ["ACTIVE", "FREE_TRIAL", "EXPIRED"] as const;
        const subStatus = dbUser.tenant?.subscriptionStatus;
        const isValidStatus = allowedStatuses.includes(
          subStatus as SubscriptionStatus
        );
        const subscriptionStatus = isValidStatus
          ? (subStatus as SubscriptionStatus)
          : "FREE_TRIAL";

        const userPayload: AppUser = {
          id: dbUser.id,
          email: dbUser.email,
          role: dbUser.role as UserRole,
          phone: dbUser.phone ?? "",
          tenantId: dbUser.tenantId, // Garder null pour les SUPER_ADMIN
          rememberMe:
            (user as User & { rememberMe?: boolean }).rememberMe ?? true,
          firstName: dbUser.firstName ?? "",
          lastName: dbUser.lastName ?? "",
          civility: dbUser.civility ?? null,
          schoolCode: dbUser.tenant?.schoolCode ?? null,
          subscriptionStatus:
            dbUser.role === "SUPER_ADMIN" ? "ACTIVE" : subscriptionStatus,
          billingPlan: dbUser.tenant?.billingPlan ?? "MONTHLY",
          trialEndsAt: dbUser.tenant?.trialEndsAt?.toISOString() ?? null,
          tokenVersion: dbUser.tokenVersion,
        };

        typedToken.user = userPayload;
        typedToken.role = dbUser.role as UserRole;
        typedToken.rememberMe =
          (user as User & { rememberMe?: boolean }).rememberMe ?? true;

        if (!typedToken.rememberMe) {
          typedToken.exp = Math.floor(Date.now() / 1000) + 4 * 60 * 60;
        }
      }

      // On every JWT cycle: revalidate tokenVersion so "Sign out
      // everywhere" actually invalidates other tabs/devices on next request.
      if (typedToken.user?.id && typedToken.user?.tokenVersion !== undefined) {
        const dbCheck = await prisma.user.findUnique({
          where: { id: typedToken.user.id },
          select: { tokenVersion: true },
        });
        if (
          dbCheck &&
          dbCheck.tokenVersion !== typedToken.user.tokenVersion
        ) {
          // Token was issued under an older version → invalidate.
          typedToken.user = undefined;
          typedToken.role = undefined;
        }
      }

      // Réutiliser le token existant si pas de nouvelle connexion
      if (!typedToken.user && (token as AppToken).user) {
        typedToken.user = (token as AppToken).user;
        typedToken.role = (token as AppToken).role ?? typedToken.user?.role;
      }

      return typedToken;
    },

    session({ session, token }) {
      const appToken = token as AppToken;
      const user = appToken.user;

      if (user && session.user) {
        session.user.id = user.id;
        session.user.email = user.email;
        session.user.role = user.role;
        session.user.phone = user.phone;
        session.user.civility = user.civility;
        session.user.firstName = user.firstName;
        session.user.lastName = user.lastName;
        session.user.tenantId = user.tenantId;
        session.user.subscriptionStatus =
          user.subscriptionStatus ?? "FREE_TRIAL";
        session.user.billingPlan = user.billingPlan ?? "MONTHLY";
        session.user.trialEndsAt = user.trialEndsAt ?? null;
        session.user.schoolCode = user.schoolCode ?? null;
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
