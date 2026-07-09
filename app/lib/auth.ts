import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "doctor@aethermed.com" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findFirst({
          where: { email: { equals: credentials.email, mode: 'insensitive' } }
        });

        console.log(`[NextAuth] Authorize check for email ${credentials.email}: User ${user ? "FOUND" : "NOT FOUND"}`);

        if (user) {
          const passwordMatch = user.password === credentials.password;
          console.log(`[NextAuth] Password match for email ${credentials.email}: ${passwordMatch}`);

          if (passwordMatch) {
            if (credentials.role && user.role !== credentials.role) {
               console.log(`[NextAuth] Role mismatch for email ${credentials.email}: expected ${credentials.role}, found ${user.role}`);
               return null;
            }
            return { id: user.id, name: user.name, email: user.email, role: user.role, clinicId: user.clinicId };
          }
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.clinicId = (user as any).clinicId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).clinicId = token.clinicId;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_local_dev",
};
