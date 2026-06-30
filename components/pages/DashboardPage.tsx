"use client"

import { useEffect, useState } from "react"
import { Surface, Skeleton } from "@heroui/react"
import { useSession } from "next-auth/react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { Icon } from "@iconify/react"

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const { data: session } = useSession()
    const isAdmin = session?.user?.role === "admin"

    useEffect(() => {
        fetch("/api/stats")
            .then(res => res.json())
            .then(data => {
                setStats(data)
                setLoading(false)
            })
    }, [])

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-4xl font-bold">Dashboard</h1>
                <p className="text-zinc-500 text-sm">Overview of your releases and activity.</p>
            </div>

            {/* Stat cards */}
            <div className={`grid gap-4 ${isAdmin ? "grid-cols-4" : "grid-cols-3"}`}>
                {/* Total Links */}
                <Surface className="rounded-3xl p-6" variant="default">
                    <div className="flex flex-col gap-1">
                        <p className="text-xs uppercase tracking-widest text-zinc-400">Total Links</p>
                        {loading ? (
                            <Skeleton className="w-16 h-8 rounded-lg mt-1" />
                        ) : (
                            <p className="text-4xl font-bold">{stats?.totalLinks ?? 0}</p>
                        )}
                    </div>
                </Surface>

                {/* Best Link */}
                <Surface className="rounded-3xl p-6" variant="default">
                    <div className="flex flex-col gap-1">
                        <p className="text-xs uppercase tracking-widest text-zinc-400">Best Link</p>
                        {loading ? (
                            <Skeleton className="w-32 h-8 rounded-lg mt-1" />
                        ) : stats?.bestLink ? (
                            <div className="flex items-center gap-3 mt-1">
                                {stats.bestLink.artwork && (
                                    <img src={stats.bestLink.artwork} className="w-10 h-10 rounded-lg object-cover" alt="" />
                                )}
                                <div>
                                    <p className="font-semibold text-sm">{stats.bestLink.title}</p>
                                    <p className="text-xs text-zinc-400">{stats.bestLink.views.toLocaleString()} views</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-zinc-400 text-sm mt-1">No data yet</p>
                        )}
                    </div>
                </Surface>

                {/* Best Artist */}
                <Surface className="rounded-3xl p-6" variant="default">
                    <div className="flex flex-col gap-1">
                        <p className="text-xs uppercase tracking-widest text-zinc-400">Best Artist</p>
                        {loading ? (
                            <Skeleton className="w-32 h-8 rounded-lg mt-1" />
                        ) : stats?.bestArtist ? (
                            <div className="mt-1">
                                <p className="font-semibold text-sm">{stats.bestArtist.name}</p>
                                <p className="text-xs text-zinc-400">{stats.bestArtist.views.toLocaleString()} views</p>
                            </div>
                        ) : (
                            <p className="text-zinc-400 text-sm mt-1">No data yet</p>
                        )}
                    </div>
                </Surface>

                {/* Pending Users — admin only */}
                {isAdmin && (
                    <Surface className="rounded-3xl p-6" variant="default">
                        <div className="flex flex-col gap-1">
                            <p className="text-xs uppercase tracking-widest text-zinc-400">Pending Requests</p>
                            {loading ? (
                                <Skeleton className="w-16 h-8 rounded-lg mt-1" />
                            ) : (
                                <p className="text-4xl font-bold">{stats?.pendingUsers ?? 0}</p>
                            )}
                        </div>
                    </Surface>
                )}
            </div>

            {/* Views chart */}
            <div className="flex flex-col gap-3">
                <h2 className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">Total Views</h2>
                <Surface className="rounded-3xl p-6" variant="default">
                    {loading ? (
                        <Skeleton className="w-full h-48 rounded-xl" />
                    ) : stats?.releases?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={stats.weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ fill: "#3b82f6", r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-zinc-400 text-sm text-center py-12">No release data yet.</p>
                    )}
                </Surface>
            </div>
        </div>
    )
}