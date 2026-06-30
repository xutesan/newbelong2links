import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const { name } = await req.json()

    await prisma.user.update({
        where: { email: session.user.email },
        data: { name }
    })

    return Response.json({ success: true })
}

export async function DELETE() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 })

    await prisma.user.delete({
        where: { email: session.user.email }
    })

    return Response.json({ success: true })
}