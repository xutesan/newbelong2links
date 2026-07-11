"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@heroui/react"
import { Icon } from "@iconify/react"

interface Props {
    src: string
}

export default function AudioPlayer({ src }: Props) {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(80)
    const [isMuted, setIsMuted] = useState(false)
    const [showVolume, setShowVolume] = useState(false)
    const volumeWrapperRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const updateTime = () => setCurrentTime(audio.currentTime)
        const updateDuration = () => setDuration(audio.duration || 0)
        const handleEnded = () => setIsPlaying(false)

        audio.addEventListener("timeupdate", updateTime)
        audio.addEventListener("loadedmetadata", updateDuration)
        audio.addEventListener("ended", handleEnded)

        return () => {
            audio.removeEventListener("timeupdate", updateTime)
            audio.removeEventListener("loadedmetadata", updateDuration)
            audio.removeEventListener("ended", handleEnded)
        }
    }, [])

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume / 100
        }
    }, [volume, isMuted])

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (volumeWrapperRef.current && !volumeWrapperRef.current.contains(e.target as Node)) {
                setShowVolume(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    function togglePlay() {
        const audio = audioRef.current
        if (!audio) return

        if (isPlaying) {
            audio.pause()
        } else {
            audio.play()
        }
        setIsPlaying(!isPlaying)
    }
    type CSSPropertiesWithVars = React.CSSProperties & {
        "--fill-percent"?: string
    }

    function handleScrub(e: React.ChangeEvent<HTMLInputElement>) {
        const audio = audioRef.current
        if (!audio) return
        const newTime = Number(e.target.value)
        audio.currentTime = newTime
        setCurrentTime(newTime)
    }

    function formatTime(seconds: number) {
        if (!seconds || isNaN(seconds)) return "0:00"
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const scrubPercent = duration ? (currentTime / duration) * 100 : 0
    const volumePercent = isMuted ? 0 : volume

    return (
        <Card className="w-full max-w-lg p-5 pt-8">
            <audio ref={audioRef} src={src} preload="metadata" />

            <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                    <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        step={1}
                        value={currentTime}
                        onChange={handleScrub}
                        aria-label="Seek"
                        className="audio-range"
                        style={{ "--fill-percent": `${scrubPercent}%` } as CSSPropertiesWithVars}
                    />
                    <div className="flex justify-between">
                        <span className="text-xs text-zinc-400 tabular-nums">{formatTime(currentTime)}</span>
                        <span className="text-xs text-zinc-400 tabular-nums">{formatTime(duration)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-6 hidden sm:block"/>

                    <div className="flex-1 flex justify-center">
                        <button
                            onClick={togglePlay}
                            aria-label={isPlaying ? "Pause" : "Play"}
                            className="flex items-center justify-center size-11 rounded-full bg-zinc-900 hover:bg-zinc-800 active:scale-95 transition-all"
                        >
                            <Icon
                                icon={isPlaying ? "lucide:pause" : "lucide:play"}
                                width={18}
                                height={18}
                                className={`text-white ${!isPlaying ? "ml-0.5" : ""}`}
                            />
                        </button>
                    </div>

                    <div ref={volumeWrapperRef} className="relative w-6 hidden sm:flex justify-center">
                        {showVolume && (
                            <div
                                className="absolute bottom-full mb-3 bg-white rounded-full shadow-lg border border-zinc-100 p-2 flex items-center justify-center">
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    step={1}
                                    value={volumePercent}
                                    onChange={(e) => {
                                        const newVolume = Number(e.target.value)
                                        setVolume(newVolume)
                                        if (newVolume > 0) setIsMuted(false)
                                    }}
                                    aria-label="Volume"
                                    className="audio-range audio-range--vertical"
                                    style={{"--fill-percent": `${volumePercent}%`} as CSSPropertiesWithVars}
                                />
                            </div>
                        )}

                        <button
                            onClick={() => setShowVolume(!showVolume)}
                            aria-label="Volume"
                            className="text-zinc-400 hover:text-zinc-600 transition-colors shrink-0"
                        >
                            <Icon icon={isMuted || volume === 0 ? "lucide:volume-x" : "lucide:volume-1"} width={16}
                                  height={16}/>
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .audio-range {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 100%;
                    height: 3px;
                    border-radius: 9999px;
                    background: linear-gradient(
                            to right,
                            #18181b 0%,
                            #18181b var(--fill-percent),
                            #e4e4e7 var(--fill-percent),
                            #e4e4e7 100%
                    );
                    outline: none;
                    cursor: pointer;
                }

                .audio-range::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: #18181b;
                    border: 2px solid white;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                    cursor: pointer;
                }

                .audio-range::-moz-range-thumb {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: #18181b;
                    border: 2px solid white;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                    cursor: pointer;
                }

                .audio-range--vertical {
                    writing-mode: vertical-lr;
                    direction: rtl;
                    width: 4px;
                    height: 80px;
                    background: linear-gradient(
                            to top,
                            #18181b 0%,
                            #18181b var(--fill-percent),
                            #e4e4e7 var(--fill-percent),
                            #e4e4e7 100%
                    );
                }

                .audio-range--vertical::-webkit-slider-thumb {
                    width: 12px;
                    height: 12px;
                }

                .audio-range--vertical::-moz-range-thumb {
                    width: 12px;
                    height: 12px;
                }
            `}</style>
        </Card>
    )
}