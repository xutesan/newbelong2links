"use client"
import { useSession, signOut } from "next-auth/react"
import { Icon } from "@iconify/react"
import { Archivo_Black } from "next/font/google"
const ArchivoBlack = Archivo_Black({ weight: "400" })
import { Button } from '@heroui/react'


const NAV_SECTIONS = [
    {
        label: "OVERVIEW",
        items: [
            { name: "Dashboard", icon: "lucide:layout-dashboard", view: "dashboard" },
            { name: "Releases", icon: "lucide:link", view: "releases" },
            { name: "Analytics", icon: "lucide:bar-chart-2", view: "analytics", adminOnly: true },
        ]
    },
    {
        label: "WORKSPACE",
        items: [
            { name: "Access", icon: "lucide:users", view: "access", adminOnly: true },
            { name: "Settings", icon: "lucide:settings", view: "settings" },
        ]
    }
]

type Props = {
    activeView: string
    onNavigate: (view: string) => void
    releaseCount?: number
}

export default function Sidebar({ activeView, onNavigate, releaseCount = 0 }: Props) {
    const { data: session } = useSession()
    const isAdmin = session?.user?.role === "admin"

    return (
        <aside className="flex flex-col h-screen w-70 bg-white border-r border-zinc-100 px-5 py-8 shrink-0">

            <div className="flex items-center gap-3 px-2 mb-8">
                <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
                    <img src="https://belong2.lon1.digitaloceanspaces.com/belong%20logo%20black(1).png" alt="belong2"
                         className="w-full h-full object-contain"/>
                </div>
                <div>
                    <p className={`${ArchivoBlack.className} text-lg leading-none`}>{`belong²`}</p>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Links Admin Console</p>
                </div>
            </div>


            <nav className="flex flex-col gap-6 flex-1">
                {NAV_SECTIONS.map(section => (
                    <div key={section.label}>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-widest px-2 mb-1">
                            {section.label}
                        </p>
                        <ul className="flex flex-col gap-2">
                            {section.items
                                .filter(item => !item.adminOnly || isAdmin)
                                .map(item => {
                                    const isActive = activeView === item.view
                                    const isReleases = item.name === "Releases"
                                    return (
                                        <li key={item.name}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`w-full justify-between ${
                                                    isActive
                                                        ? "bg-blue-50 text-blue-600"
                                                        : "text-zinc-600"
                                                }`}
                                                onClick={() => onNavigate(item.view)}
                                            >
                                            <span className="flex items-center gap-2">
                                                <Icon icon={item.icon} className="text-base"/>
                                                {item.name}
                                            </span>
                                                {isReleases && (
                                                    <span
                                                        className="text-xs bg-blue-100 text-blue-600 rounded-full px-2 py-0.5 font-medium">
                                                    {releaseCount}
                                                </span>
                                                )}
                                            </Button>
                                        </li>
                                    )
                                })}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-zinc-50 cursor-pointer group">
                <div className="flex items-center gap-2">
                    {session?.user?.image ? (
                        <img src={session.user.image} className="w-10 h-10 rounded-full" alt="avatar" />
                    ) : (
                        <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-medium">
                            {session?.user?.name?.[0]}
                        </div>
                    )}
                    <div>
                        <p className="text-lg font-medium leading-none">{session?.user?.name}</p>
                        <p className="text-[12px] text-zinc-400 capitalize">{session?.user?.role}</p>
                    </div>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Icon icon="lucide:log-out" className="text-zinc-400 text-lg" />
                </button>
            </div>

        </aside>
    )
}