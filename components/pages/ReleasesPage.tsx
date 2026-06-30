"use client"

import { useEffect, useState } from "react"
import { Surface, Skeleton } from "@heroui/react";
import { SearchField } from '@heroui/react';
import { Icon } from "@iconify/react"
import { Button, Dropdown, Label } from "@heroui/react";
import AddReleasePopup from "@/components/AddReleasePopup";
import EditReleasePopup from "@/components/EditReleasePopup";
import { useSession } from "next-auth/react"

interface Release {
    id: string
    title: string
    artist: string
    artwork: string
    views: number
    identifier: string
    linkName: string | null
    releaseDate: string
    spotifyLink: string | null
    appleLink: string | null
    soundcloudLink: string | null
    youtubeLink: string | null
    isPublic: boolean
}

export default function ReleasesPage() {
    const [releases, setReleases] = useState<Release[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const { data: session } = useSession()
    const isAdmin = session?.user?.role === "admin"

    const filtered = releases.filter(release =>
        release.title.toLowerCase().includes(search.toLowerCase()) ||
        release.artist.toLowerCase().includes(search.toLowerCase())
    )

    const refetch = () => {
        fetch("/api/releases")
            .then(res => res.json())
            .then(data => setReleases(data))
    }

    useEffect(() => {
        fetch("/api/releases")
            .then(res => res.json())
            .then(data => {
                setReleases(data)
                setLoading(false)
            })
    }, [])

    return (
        <div>
            <div className="gap-2">
                <h1 className="text-4xl font-bold">Releases</h1>
                <p>Manage access and data for each release link.</p>
            </div>

            <div className="flex items-center justify-between pt-8">
                <SearchField name="search" onChange={(value) => setSearch(value)}>
                    <SearchField.Group>
                        <SearchField.SearchIcon/>
                        <SearchField.Input className="w-[280px]" placeholder="Search..."/>
                        <SearchField.ClearButton/>
                    </SearchField.Group>
                </SearchField>
                {isAdmin && <AddReleasePopup onSuccess={refetch} />}
            </div>

            <div className="flex pt-4">
                <Surface className="flex w-full h-fit flex-col rounded-3xl overflow-hidden" variant="default">
                    <table className="w-full">
                        <thead className="bg-zinc-100 border-b border-zinc-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-24">Cover</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-64">Release</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest">Artist</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest">Page Views</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest">Access</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="border-b border-zinc-100">
                                        <td className="px-4 py-3"><Skeleton className="w-12 h-12 rounded-lg" /></td>
                                        <td className="px-4 py-3"><Skeleton className="w-40 h-4 rounded-lg" /></td>
                                        <td className="px-4 py-3"><Skeleton className="w-24 h-4 rounded-lg" /></td>
                                        <td className="px-4 py-3"><Skeleton className="w-12 h-4 rounded-lg" /></td>
                                        <td className="px-4 py-3"><Skeleton className="w-16 h-4 rounded-lg" /></td>
                                        <td className="px-4 py-3"><Skeleton className="w-16 h-4 rounded-lg" /></td>
                                        <td className="px-4 py-3"><Skeleton className="w-8 h-8 rounded-lg" /></td>
                                    </tr>
                                ))}
                            </>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-6 text-center text-sm text-zinc-400">No releases yet.</td>
                            </tr>
                        ) : (
                            filtered.map(release => (
                                <tr key={release.id} className="hover:bg-zinc-50 transition-colors border-b border-zinc-100">
                                    <td className="px-4 py-3">
                                        {release.artwork ? (
                                            <img src={release.artwork} alt={release.title} className="w-15 h-15 rounded-lg object-cover"/>
                                        ) : (
                                            <div className="w-8 h-8 rounded-lg bg-zinc-200 flex items-center justify-center">
                                                <Icon icon="lucide:music" className="text-zinc-400 text-sm"/>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-foreground">{release.title}</td>
                                    <td className="px-4 py-3 text-sm text-zinc-500">{release.artist}</td>
                                    <td className="px-4 py-3 text-sm text-zinc-500">{release.views.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-sm text-zinc-500">{release.isPublic ? "Public" : "Private"}</td>
                                    <td className="px-4 py-3 text-sm text-zinc-500">Active</td>
                                    <td className="px-4 py-3 align-middle">
                                        <div className="flex gap-2 items-center">
                                            <Dropdown>
                                                <Button isIconOnly aria-label="Menu" variant="secondary">
                                                    <Icon icon="lucide:ellipsis-vertical" className="outline-none"/>
                                                </Button>
                                                <Dropdown.Popover>
                                                    <Dropdown.Menu onAction={(key) => {
                                                        if (key === "edit-release") {
                                                            document.getElementById(`edit-${release.id}`)?.click()
                                                        }
                                                        if (key === "copy-link") {
                                                            const url = `${window.location.origin}/${release.linkName}`
                                                            navigator.clipboard.writeText(url)
                                                        }
                                                        if (key === "delete-release") {
                                                            fetch("/api/releases", {
                                                                method: "DELETE",
                                                                headers: { "Content-Type": "application/json" },
                                                                body: JSON.stringify({ id: release.id }),
                                                            }).then(() => refetch())
                                                        }
                                                    }}>
                                                        <Dropdown.Item id="copy-link" textValue="Copy link">
                                                            <Label>Copy link</Label>
                                                        </Dropdown.Item>
                                                        {isAdmin && (
                                                            <Dropdown.Item id="edit-release" textValue="Edit Release">
                                                                <Label>Edit Release</Label>
                                                            </Dropdown.Item>
                                                        )}
                                                        {isAdmin && (
                                                            <Dropdown.Item id="delete-release" textValue="Delete Release" variant="danger">
                                                                <Label>Delete Release</Label>
                                                            </Dropdown.Item>
                                                        )}
                                                    </Dropdown.Menu>
                                                </Dropdown.Popover>
                                            </Dropdown>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </Surface>
            </div>

            {filtered.map(release => (
                <EditReleasePopup
                    key={`edit-modal-${release.id}`}
                    release={release}
                    onSuccess={refetch}
                />
            ))}
        </div>
    )
}