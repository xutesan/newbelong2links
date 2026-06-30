"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Sidebar from "@/components/Sidebar"
import DashboardPage from "@/components/pages/DashboardPage"
import ReleasesPage from "@/components/pages/ReleasesPage"
import AnalyticsPage from "@/components/pages/AnalyticsPage"
import AccessPage from "@/components/pages/AccessPage"
import SettingsPage from "@/components/pages/SettingsPage"

export default function Admin() {
    const [activeView, setActiveView] = useState("dashboard")
    const [releaseCount, setReleaseCount] = useState(0)
    const { data: session, status } = useSession()

    useEffect(() => {
        fetch("/api/releases")
            .then(res => res.json())
            .then(data => setReleaseCount(data.length))
    }, [])

    if (status === "loading") return null
    if (!session) redirect("/")

    if (session?.user?.status === "pending") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center flex flex-col gap-2">
                    <h1 className="text-8xl font-bold">Access Pending</h1>
                    <p className="text-zinc-400 text-lg">Your request is being reviewed. Check back soon.</p>
                </div>
            </div>
        )
    }

    if (session?.user?.status === "denied") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center flex flex-col gap-2">
                    <h1 className="text-8xl font-bold">Access Denied</h1>
                    <p className="text-zinc-400 text-lg">Your request was not approved.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen">
            <Sidebar activeView={activeView} onNavigate={setActiveView} releaseCount={releaseCount} />
            <main className="flex-1 overflow-auto bg-zinc-50 p-8">
                {activeView === "dashboard" && <DashboardPage />}
                {activeView === "releases" && <ReleasesPage />}
                {activeView === "analytics" && <AnalyticsPage />}
                {activeView === "access" && <AccessPage />}
                {activeView === "settings" && <SettingsPage />}
            </main>
        </div>
    )
}