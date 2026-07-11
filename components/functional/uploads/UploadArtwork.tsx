"use client"

import { useState, useRef } from "react"
import { Icon } from "@iconify/react"

interface Props {
    onFileSelect: (file: File | null) => void
    className?: string
}

export default function UploadArtwork({ onFileSelect, className }: Props) {
    const [dragging, setDragging] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    async function handleFile(file: File) {
        setError(null)

        if (file.type !== "image/png") {
            setError("Artwork must be a PNG file.")
            return
        }

        const img = new Image()
        img.src = URL.createObjectURL(file)
        await new Promise(resolve => img.onload = resolve)

        const validSize = (img.width === 2000 && img.height === 2000) || (img.width === 3000 && img.height === 3000)

        if (!validSize) {
            setError("Artwork must be exactly 2000×2000 or 3000×3000px.")
            return
        }

        setPreview(img.src)
        onFileSelect(file)
    }

    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => {
                    e.preventDefault()
                    setDragging(false)
                    const file = e.dataTransfer.files[0]
                    if (file) handleFile(file)
                }}
                className={`relative flex items-center justify-center w-full h-full rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${
                    dragging ? "border-blue-400 bg-blue-50" : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100"
                }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/png"
                    className="hidden"
                    onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleFile(file)
                    }}
                />

                {preview ? (
                    <div className="relative h-full w-full">
                        <img src={preview} alt="preview" className="h-full w-full object-cover rounded-2xl" />
                        <button
                            onClick={e => {
                                e.stopPropagation()
                                setPreview(null)
                                onFileSelect(null)
                            }}
                            className="absolute top-2 right-2 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors"
                        >
                            <Icon icon="lucide:x" className="text-white text-xs" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-zinc-400">
                        <Icon icon="lucide:image-plus" className="text-3xl" />
                        <p className="text-xs text-center px-2">PNG only, 2000×2000 or 3000×3000</p>
                    </div>
                )}
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    )
}