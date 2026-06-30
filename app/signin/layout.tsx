import type { Metadata } from "next"

export const metadata: Metadata = {
    icons: {
        icon: "https://belong2.lon1.digitaloceanspaces.com/belong%20logo%20black(1).png"
    }
}

export default function SigninLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}