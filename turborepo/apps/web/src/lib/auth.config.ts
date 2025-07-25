import type { NextAuthConfig } from "next-auth";
import type { GoogleProfile } from "next-auth/providers/google";
import { prismaClient } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";


export const authConfig = <NextAuthConfig>{
  adapter: PrismaAdapter(prismaClient),
  providers: [
    Google<GoogleProfile>({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          response_type: "code"
        }
      }
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60
  },
  trustHost: true,
  debug: process.env.NODE_ENV !== "production"
};
