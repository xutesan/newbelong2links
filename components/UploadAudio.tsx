"use client"

import { useState, useRef } from "react"
import { Icon } from "@iconify/react"

interface Props {
    onFileSelect: (file: File | null) => void
    className?: string
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export default function UploadAudio({ onFileSelect, className }: Props) {
    const [dragging, setDragging] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [error, setError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    function handleFile(file: File) {
        setError(null)

        if (!file.type.startsWith("audio/")) {
            setError("File must be an audio file (MP3, WAV, etc).")
            return
        }

        if (file.size > MAX_FILE_SIZE) {
            setError("File must be under 10MB.")
            return
        }

        setSelectedFile(file)
        onFileSelect(file)
    }

    function formatSize(bytes: number) {
        return `${(bytes / 1024 / 1024).toFixed(2)} MB`
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
                    accept="audio/*"
                    className="hidden"
                    onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleFile(file)
                    }}
                />

                {selectedFile ? (
                    <div className="relative flex items-center gap-3 w-full px-4 py-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                            <Icon icon="lucide:file-audio" className="text-blue-500 text-lg" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                            <p className="text-xs text-zinc-400">{formatSize(selectedFile.size)}</p>
                        </div>
                        <button
                            onClick={e => {
                                e.stopPropagation()
                                setSelectedFile(null)
                                onFileSelect(null)
                                if (inputRef.current) inputRef.current.value = ""
                            }}
                            className="w-6 h-6 bg-zinc-200 hover:bg-zinc-300 rounded-full flex items-center justify-center transition-colors shrink-0"
                        >
                            <Icon icon="lucide:x" className="text-zinc-600 text-xs" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-zinc-400 py-6">
                        <Icon icon="lucide:file-audio" className="text-3xl" />
                        <p className="text-xs text-center px-2">Drag audio file here or click to browse</p>
                        <p className="text-[10px] text-center px-2 text-zinc-300">MP3, WAV, up to 10MB</p>
                    </div>
                )}
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    )
}