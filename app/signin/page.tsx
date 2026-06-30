"use client"

import { signIn } from "next-auth/react"
import { Archivo_Black } from "next/font/google"
import { Button } from "@heroui/react"
import { Icon } from "@iconify/react"

const ArchivoBlack = Archivo_Black({ weight: "400" })

export default function SignIn() {
    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            <div className="hidden md:flex md:w-1/2 bg-black items-center justify-center">
                <h1 className="text-white text-6xl font-bold">Hello!</h1>
            </div>

            <div className="flex flex-1 items-center justify-center px-6">
                <div className="flex flex-col items-center gap-8 w-full max-w-sm">
                    <div className="flex flex-col items-center gap-8 w-full max-w-sm">
                        <div className="flex flex-col items-center gap-2">
                            <p className={`${ArchivoBlack.className} text-8xl`}>belong²</p>
                            <p className="text-zinc-400 text-lg text-center">Sign in to access the admin console</p>
                        </div>

                        <div className="flex flex-col gap-4 w-full">
                            <Button className="w-full" size="lg" variant="tertiary" onClick={() => signIn("google", { callbackUrl: "/admin" })}>
                                <Icon icon="devicon:google" className="text-2xl"/>
                                Sign in with Google
                            </Button>
                            <Button className="w-full" size="lg" variant="tertiary" onClick={() => signIn("github", { callbackUrl: "/admin" })}>
                                <Icon icon="mdi:github" className="text-2xl"/>
                                Sign in with GitHub
                            </Button>
                        </div>

                        <p className="text-zinc-400 text-xs text-center">
                            Access is by approval only. You'll be notified once your request is reviewed.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}