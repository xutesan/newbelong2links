"use client"

import React, { use, useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSoundcloud, faSpotify } from "@fortawesome/free-brands-svg-icons"
import { SiApplemusic, SiYoutubemusic } from "react-icons/si"
import Link from "next/link"
import { Archivo_Black } from "next/font/google"

const ArchivoBlack = Archivo_Black({ weight: "400" })

export default function ReleasePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const [release, setRelease] = useState<any>(null)

    useEffect(() => {
        fetch(`/api/release/${slug}`)
            .then(res => res.json())
            .then(data => setRelease(data))
    }, [slug])

    if (!release) return null

    return (
        <div className="h-screen overflow-hidden bg-black flex flex-col">

            {/* Full bleed blurred background */}
            <div className="fixed inset-0 z-0">
                <img
                    src={release.artwork}
                    className="w-full h-full object-cover scale-110"
                    alt=""
                    aria-hidden
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl"/>
            </div>

            {/* Content */}
            <main className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 py-8">

                {/* Artwork */}
                <div className="w-70 h-70 md:w-110 md:h-110 rounded-3xl overflow-hidden shadow-2xl mb-8">
                    <img
                        src={release.artwork}
                        alt={`${release.artist} - ${release.title}`}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Title */}
                <div className="text-center mb-10">
                    <p className="text-white/60 text-sm uppercase tracking-widest mb-1">{release.artist}</p>
                    <h1 className="text-white text-4xl md:text-5xl font-semibold tracking-tight">{release.title}</h1>
                    <p className="text-white/40 text-xs uppercase tracking-widest mt-2">{release.identifier}</p>
                </div>

                {/* DSP Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xs md:max-w-lg">
                    {release.spotifyLink && (
                        <button
                            onClick={() => window.open(release.spotifyLink, "_blank")}
                            className="flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl px-5 py-4 transition-all duration-200 w-full"
                        >
                            <FontAwesomeIcon icon={faSpotify} className="text-[#1DB954]" style={{ width: 22, height: 22 }} />
                            <span className="text-md font-bold">Listen on Spotify</span>
                        </button>
                    )}
                    {release.appleLink && (
                        <button
                            onClick={() => window.open(release.appleLink, "_blank")}
                            className="flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl px-5 py-4 transition-all duration-200 w-full"
                        >
                            <SiApplemusic size={22} className="text-[#fc3c44]" />
                            <span className="text-md font-bold">Listen on Apple Music</span>
                        </button>
                    )}
                    {release.soundcloudLink && (
                        <button
                            onClick={() => window.open(release.soundcloudLink, "_blank")}
                            className="flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl px-5 py-4 transition-all duration-200 w-full"
                        >
                            <FontAwesomeIcon icon={faSoundcloud} className="text-[#ff5500]" style={{ width: 22, height: 22 }} />
                            <span className="text-md font-bold">Listen on SoundCloud</span>
                        </button>
                    )}
                    {release.youtubeLink && (
                        <button
                            onClick={() => window.open(release.youtubeLink, "_blank")}
                            className="flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl px-5 py-4 transition-all duration-200 w-full"
                        >
                            <SiYoutubemusic size={22} className="text-[#ff0000]" />
                            <span className="text-md font-bold">Listen on YouTube Music</span>
                        </button>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 flex justify-center py-6">
                <p className={`${ArchivoBlack.className} text-white/30 text-xs`}>
                    <Link href="https://belong2.club" className="hover:text-white/60 transition-colors">belong²</Link>
                </p>
            </footer>
        </div>
    )
}