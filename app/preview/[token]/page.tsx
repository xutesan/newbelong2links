import { notFound } from "next/navigation"
import { Card } from "@heroui/react"
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
        <div style={{position: "relative", height: "100vh", overflowX: "hidden"}}>
            <PixelBg/>
            <div
                className="min-h-screen flex items-center justify-center px-4"
                style={{ backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)" }}
            >
                <Card className="w-full max-w-md px-5 pb-5 pt-8">
                    <h1 className="text-4xl font-bold">{preview.title}</h1>
                    <p className="text-zinc-500 mb-6 text-2xl">{preview.artist}</p>

                    <AudioPlayer src={preview.playbackUrl} />

                    <p className="text-xs text-zinc-400 mt-6">
                        This is a private preview link. Please do not share or redistribute.
                    </p>
                </Card>
            </div>
        </div>
    )
}