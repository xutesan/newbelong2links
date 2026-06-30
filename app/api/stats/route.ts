import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const [releases, users, views] = await Promise.all([
        prisma.release.findMany({
            orderBy: { views: "desc" }
        }),
        prisma.user.findMany({
            where: { status: "pending" }
        }),
        prisma.view.findMany({
            orderBy: { createdAt: "asc" }
        })
    ])

    const totalLinks = releases.length
    const bestLink = releases[0] || null
    const pendingUsers = users.length

    // aggregate views by artist
    const artistViews: Record<string, number> = {}
    releases.forEach(r => {
        artistViews[r.artist] = (artistViews[r.artist] || 0) + r.views
    })
    const bestArtist = Object.entries(artistViews).sort((a, b) => b[1] - a[1])[0] || null

    // group by week starting Sunday
    const weeklyViews: Record<string, number> = {}
    views.forEach(v => {
        const date = new Date(v.createdAt)
        const day = date.getDay()
        const sunday = new Date(date)
        sunday.setDate(date.getDate() - day)
        sunday.setHours(0, 0, 0, 0)
        const key = sunday.toISOString().split("T")[0]
        weeklyViews[key] = (weeklyViews[key] || 0) + 1
    })

    const weeklyData = Object.entries(weeklyViews).map(([week, total]) => ({ week, total }))

    return Response.json({
        totalLinks,
        bestLink,
        bestArtist: bestArtist ? { name: bestArtist[0], views: bestArtist[1] } : null,
        pendingUsers,
        releases,
        weeklyData,
    })
}