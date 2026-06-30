import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const release = await prisma.release.findFirst({
        where: { linkName: slug, isPublic: true }
    })

    if (!release) return Response.json({ error: "Not found" }, { status: 404 })

    await prisma.view.create({
        data: { releaseId: release.id }
    })

    await prisma.release.update({
        where: { id: release.id },
        data: { views: { increment: 1 } }
    })

    return Response.json(release)
}