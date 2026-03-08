import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Veuillez entrer vos identifiants");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || !user.password) {
                    throw new Error("Utilisateur non trouvé");
                }

                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordCorrect) {
                    throw new Error("Mot de passe incorrect");
                }

                if (user.status === "SUSPENDED") {
                    throw new Error("Votre compte est suspendu. Veuillez contacter l'administrateur.");
                }

                const company = await (prisma.company as any).findUnique({
                    where: { userId: user.adminId || user.id },
                    select: { rolePermissions: true }
                });

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    status: user.status,
                    subscriptionType: user.subscriptionType,
                    adminId: user.adminId,
                    rolePermissions: company?.rolePermissions,
                };
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.status = token.status as string;
                session.user.subscriptionType = token.subscriptionType as string;
                (session.user as any).adminId = token.adminId as string | null;
                (session.user as any).rolePermissions = token.rolePermissions;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.status = (user as any).status;
                token.subscriptionType = (user as any).subscriptionType;
                token.adminId = (user as any).adminId;
                token.rolePermissions = (user as any).rolePermissions;
            }
            return token;
        },
    },
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
