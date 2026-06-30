import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import { prisma } from "@/lib/prisma"


export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user }: { user: any }) {
            const existing = await prisma.user.findUnique({
                where: { email: user.email }
            })

            if (!existing) {
                await prisma.user.create({
                    data: {
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        role: "user",
                        status: "pending",
                    }
                })
            }

            return true
        },
        async session({ session, token }: any) {
            if (session.user?.email) {
                const dbUser = await prisma.user.findUnique({
                    where: { email: session.user.email }
                })
                session.user.role = dbUser?.role
                session.user.status = dbUser?.status
                session.user.name = dbUser?.name || session.user.name
            }
            return session
        },
        async jwt({ token, account }: any) {
            if (account) {
                token.accessToken = account.access_token
            }
            return token
        }
    },
    pages: {
        signIn: "/signin",
        error: "/",
    },
}