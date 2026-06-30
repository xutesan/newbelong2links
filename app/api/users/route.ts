import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" }
    })

    return Response.json(users)
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()

    const user = await prisma.user.update({
        where: { id: body.id },
        data: {
            status: body.status,
            role: body.role,
        }
    })

    return Response.json(user)
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await req.json()

    await prisma.user.delete({ where: { id } })

    return Response.json({ success: true })
}