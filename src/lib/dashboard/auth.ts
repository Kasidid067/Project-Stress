import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

class AccountSuspendedError extends CredentialsSignin {
  code = "account_suspended";
}

function isAuthBypassEnabled() {
  return (
    process.env.NEXT_PUBLIC_AUTH_BYPASS === "true" ||
    process.env.AUTH_BYPASS === "true"
  );
}

const fakeSession = {
  user: {
    id: "1",
    name: "ผู้ดูแลระบบสำหรับพัฒนา",
    fullname: "ผู้ดูแลระบบสำหรับพัฒนา",
    email: "dev@example.com",
    role: "ADMIN",
    isSuperAdmin: true,
  },
};

const nextAuth = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/auth/login",
  },

  providers: [
    Credentials({
      name: "Credentials",

      credentials: {
        studentId: {
          label: "รหัสผู้ใช้งาน",
          type: "text",
        },
        password: {
          label: "รหัสผ่าน",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.studentId || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            studentId: credentials.studentId as string,
          },
        });

        if (!user) {
          return null;
        }

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!valid) {
          return null;
        }

        // ตรวจรหัสผ่านก่อน เพื่อไม่เปิดเผยสถานะบัญชีแก่ผู้ที่ไม่ใช่เจ้าของบัญชี
        if (user.status === "INACTIVE") {
          throw new AccountSuspendedError();
        }

        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            lastLogin: new Date(),
          },
        });

        return {
          id: String(user.id),
          name: user.fullname,
          fullname: user.fullname,
          email: user.email,
          role: user.role,
          isSuperAdmin: user.isSuperAdmin,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.fullname = (user as any).fullname;
        token.isSuperAdmin = (user as any).isSuperAdmin;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;

        session.user.name = token.name as string;

        (session.user as any).fullname =
          token.fullname as string;

        (session.user as any).isSuperAdmin =
          Boolean(token.isSuperAdmin);
      }

      return session;
    },

    async redirect({ baseUrl }) {
      return baseUrl;
    },
  },
});

export const {
  handlers,
  signIn,
  signOut,
} = nextAuth;

export async function auth() {
  if (isAuthBypassEnabled()) {
    return fakeSession;
  }

  return nextAuth.auth();
}
