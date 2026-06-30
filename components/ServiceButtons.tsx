"use client"

interface Props {
    spotifyLink: string | null
    appleLink: string | null
    soundcloudLink: string | null
    youtubeLink: string | null
}

export default function DSPButtons({ spotifyLink, appleLink, soundcloudLink, youtubeLink }: Props) {
    return (
        <div className="flex gap-2">
            {soundcloudLink && (
                <button
                    onClick={() => window.open(soundcloudLink, "_blank")}
                    className="w-10 h-10 flex items-center justify-center text-white hover:opacity-70 transition-opacity"
                    aria-label="SoundCloud"
                >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Antu_soundcloud.svg" className="w-8 h-8" />
                </button>
            )}
            {spotifyLink && (
                <button
                    onClick={() => window.open(spotifyLink, "_blank")}
                    className="w-10 h-10 flex items-center justify-center text-white hover:opacity-70 transition-opacity"
                    aria-label="Spotify"
                >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg" className="w-8 h-8" />
                </button>
            )}
            {appleLink && (
                <button
                    onClick={() => window.open(appleLink, "_blank")}
                    className="w-10 h-10 flex items-center justify-center text-white hover:opacity-70 transition-opacity"
                    aria-label="Apple Music"
                >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5f/Apple_Music_icon.svg" className="w-8 h-8" />
                </button>
            )}
            {youtubeLink && (
                <button
                    onClick={() => window.open(youtubeLink, "_blank")}
                    className="w-10 h-10 flex items-center justify-center text-white hover:opacity-70 transition-opacity"
                    aria-label="YouTube"
                >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg" className="w-8 h-8" />
                </button>
            )}
        </div>
    )
}