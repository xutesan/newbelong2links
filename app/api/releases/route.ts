import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const releases = await prisma.release.findMany({
        orderBy: { createdAt: "desc" }
    })

    return Response.json(releases)
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { email: session.user.email! } })
    if (dbUser?.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 })

    const { id } = await req.json()
    await prisma.release.delete({ where: { id } })
    return Response.json({ success: true })
}
export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { email: session.user.email! } })
    if (dbUser?.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 })

    const body = await req.json()

    const release = await prisma.release.update({
        where: { id: body.id },
        data: {
            title: body.title,
            artist: body.artist,
            identifier: body.identifier,
            linkName: body.linkName,
            spotifyLink: body.spotifyLink,
            appleLink: body.appleLink,
            soundcloudLink: body.soundcloudLink,
            youtubeLink: body.youtubeLink,
            isPublic: body.isPublic,
        }
    })

    return Response.json(release)
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()

    try {
        const release = await prisma.release.create({
            data: {
                title: body.title,
                artist: body.artist,
                identifier: body.identifier,
                linkName: body.linkName,
                artwork: body.artwork,
                releaseDate: body.releaseDate,
                spotifyLink: body.spotifyLink,
                appleLink: body.appleLink,
                soundcloudLink: body.soundcloudLink,
                youtubeLink: body.youtubeLink,
                isPublic: body.isPublic,
            }
        })
        return Response.json(release)
    } catch (e: any) {
        if (e.code === "P2002") {
            return Response.json({ error: "A release with this identifier already exists." }, { status: 400 })
        }
        return Response.json({ error: "Something went wrong." }, { status: 500 })
    }
}