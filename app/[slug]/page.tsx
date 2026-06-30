import { prisma } from "@/lib/prisma"
import { Metadata } from "next"
import ClientPage from "./client"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const release = await prisma.release.findFirst({
        where: { linkName: slug, isPublic: true }
    })

    if (!release) return { title: "Not Found" }

    return {
        title: `${release.title} by ${release.artist}`,
        description: `Listen to ${release.title} by ${release.artist}`,
        icons: { icon: `${release.artwork}?v=${Date.now()}` },
        openGraph: {
            title: `${release.title} by ${release.artist}`,
            images: [release.artwork],
        }
    }
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
    return <ClientPage params={params} />
}