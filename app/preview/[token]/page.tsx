import { notFound } from "next/navigation"
import { Card } from "@heroui/react"
import type { Metadata } from "next"
import AudioPlayer from "@/components/functional/AudioPlayer"
import PixelBg from "@/components/functional/PixelBack";


interface PreviewData {
    title: string
    artist: string
    duration: number | null
    playbackUrl: string
    recipientName: string | null
}

async function getPreview(token: string): Promise<PreviewData | null> {
    const res = await fetch(`${process.env.RELL_API}/api/previews/link/${token}`, {
        cache: "no-store",
    })

    if (!res.ok) return null
    return res.json()
}

export async function generateMetadata({
                                           params,
                                       }: {
    params: Promise<{ token: string }>
}): Promise<Metadata> {
    const { token } = await params
    const preview = await getPreview(token)

    if (!preview) {
        return {
            title: "Preview not found",
            description: "This preview link is invalid or has expired.",
        }
    }

    const title = `${preview.title} - ${preview.artist}`
    const description = "A private track preview."

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            siteName: "belong²",
            type: "music.song",
            images: [
                {
                    url: "https://belong2.lon1.digitaloceanspaces.com/315156666.png",
                    width: 1200,
                    height: 630,
                    alt: "belong²",
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ["https://belong2.lon1.digitaloceanspaces.com/b2bg.png"],
        },
        robots: {
            index: false,
            follow: false,
        },
    }
}

export default async function PreviewPage({
                                              params,
                                          }: {
    params: Promise<{ token: string }>
}) {
    const { token } = await params
    const preview = await getPreview(token)

    if (!preview) {
        notFound()
    }

    return (
        <div className="relative min-h-dvh overflow-x-hidden">
            <PixelBg/>
            <div
                className="min-h-dvh flex items-center justify-center px-4 py-8 sm:px-6"
                style={{ backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)" }}
            >
                <Card className="w-full max-w-md px-4 pb-4 pt-6 sm:px-5 sm:pb-5 sm:pt-8">
                    <h1 className="text-2xl sm:text-4xl font-bold break-words">{preview.title}</h1>
                    <p className="text-zinc-500 mb-4 sm:mb-6 text-lg sm:text-2xl break-words">{preview.artist}</p>

                    <AudioPlayer src={preview.playbackUrl} />

                    <p className="text-xs text-zinc-400 mt-4 sm:mt-6">
                        This is a private preview link. Please do not share or redistribute.
                    </p>
                </Card>
            </div>
        </div>
    )
}