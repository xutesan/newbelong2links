"use client"

import { useEffect, useState } from "react"
import { Surface, Skeleton } from "@heroui/react"
import { useSession } from "next-auth/react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

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
        <div className="gap-2">
            <div>
                <h1 className="text-4xl font-bold">Dashboard</h1>
                <p>Overview of releases and activity.</p>
            </div>

            <div className={`grid gap-4 ${isAdmin ? "grid-cols-4 pt-8" : "grid-cols-3 pt-8"}`}>
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

                {isAdmin && (
                    <Surface className="rounded-3xl p-6" variant="default">
                        <div className="flex flex-col gap-1">
                            <p className="text-xs uppercase tracking-widest text-zinc-400">Pending Users</p>
                            {loading ? (
                                <Skeleton className="w-16 h-8 rounded-lg mt-1" />
                            ) : (
                                <p className="text-4xl font-bold">{stats?.pendingUsers ?? 0}</p>
                            )}
                        </div>
                    </Surface>
                )}
            </div>

            <div className="flex flex-col gap-4 pt-6">
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