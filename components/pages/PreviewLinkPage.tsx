"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Button, Dropdown, Label, Modal, Chip, SearchField, Table, Spinner, EmptyState } from "@heroui/react"
import { Icon } from "@iconify/react"
import { useSession } from "next-auth/react"
import UploadTrackPopup from "@/components/UploadTrackPopup"
import GenerateLinkPopup from "@/components/GenerateLinkPopup"
import ViewLinksPopup from "@/components/ViewLinksPopup";

interface PreviewLink {
    id: string
    token: string
    recipientName: string | null
    createdAt: string
    expiresAt: string | null
    revoked: boolean
    playCount: number
}

interface PreviewTrack {
    id: string
    title: string
    artist: string
    duration: number | null
    uploadedAt: string
    links: PreviewLink[]
}

const ITEMS_PER_PAGE = 6

export default function PreviewLinksPage() {
    const [tracks, setTracks] = useState<PreviewTrack[]>([])
    const [loading, setLoading] = useState(true)
    const [lastGeneratedUrl, setLastGeneratedUrl] = useState<string | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<PreviewTrack | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [search, setSearch] = useState("")
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const isLoadingRef = useRef(false)
    const { data: session } = useSession()
    const isAdmin = session?.user?.role === "admin"

    const refetch = () => {
        fetch("/api/preview-links/tracks")
            .then(res => res.json())
            .then(data => {
                setTracks(data.tracks || [])
                setVisibleCount(ITEMS_PER_PAGE)
            })
    }

    useEffect(() => {
        fetch("/api/preview-links/tracks")
            .then(res => res.json())
            .then(data => {
                setTracks(data.tracks || [])
                setLoading(false)
            })
    }, [])

    const formatDuration = (seconds: number | null) => {
        if (!seconds) return "—"
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const filtered = tracks.filter(track =>
        track.title.toLowerCase().includes(search.toLowerCase()) ||
        track.artist.toLowerCase().includes(search.toLowerCase())
    )

    const visibleTracks = filtered.slice(0, visibleCount)
    const hasMore = visibleCount < filtered.length

    const loadMore = useCallback(() => {
        if (!hasMore || isLoadingRef.current) return
        isLoadingRef.current = true
        setIsLoadingMore(true)
        setTimeout(() => {
            setVisibleCount(prev => prev + ITEMS_PER_PAGE)
            setIsLoadingMore(false)
            requestAnimationFrame(() => {
                isLoadingRef.current = false
            })
        }, 500)
    }, [hasMore])

    const isTrackActive = (track: PreviewTrack) => {
        return track.links?.some(link => {
            if (link.revoked) return false
            return !(link.expiresAt && new Date(link.expiresAt) < new Date());
        }) ?? false
    }

    if (!isAdmin) {
        return <p className="text-sm text-zinc-400">You don&apos;t have access to this section.</p>
    }

    return (
        <div>
            <div className="gap-2">
                <h1 className="text-4xl font-bold">Preview Links</h1>
                <p>Upload private preview tracks and generate shareable links.</p>
            </div>

            <div className="flex items-center justify-between pt-8">
                <SearchField name="search" onChange={(value) => {
                    setSearch(value)
                    setVisibleCount(ITEMS_PER_PAGE)
                }}>
                    <SearchField.Group>
                        <SearchField.SearchIcon/>
                        <SearchField.Input className="w-[280px]" placeholder="Search..."/>
                        <SearchField.ClearButton/>
                    </SearchField.Group>
                </SearchField>
                <UploadTrackPopup onSuccess={refetch}/>
            </div>

            <div className="flex pt-4">
                <Table>
                    <Table.ScrollContainer className="max-h-[600px] overflow-y-auto">
                        <Table.Content aria-label="Preview tracks" className="min-w-[900px]">
                            <Table.Header className="sticky top-0 z-10 bg-surface-secondary">
                                <Table.Column isRowHeader className="w-64 text-lg text-zinc-600 font-bold">Track</Table.Column>
                                <Table.Column className="w-48 text-lg text-zinc-600 font-bold">Artist</Table.Column>
                                <Table.Column className="w-24 text-lg text-zinc-600 font-bold">Duration</Table.Column>
                                <Table.Column className="w-20 text-lg text-zinc-600 font-bold">Links</Table.Column>
                                <Table.Column className="w-1 text-lg text-zinc-600 font-bold">Status</Table.Column>
                                <Table.Column className="w-1 text-end text-lg text-zinc-600 font-bold">Actions</Table.Column>
                            </Table.Header>
                            <Table.Body
                                renderEmptyState={() => (
                                    <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                                        <Icon className="size-6 text-muted" icon="gravity-ui:tray" />
                                        <span className="text-sm text-muted">No results found</span>
                                    </EmptyState>
                                )}
                            >
                                <Table.Collection items={visibleTracks}>
                                    {(track) => (
                                        <Table.Row id={track.id}>
                                            <Table.Cell className="text-sm font-medium text-foreground">{track.title}</Table.Cell>
                                            <Table.Cell className="text-sm text-zinc-500">{track.artist}</Table.Cell>
                                            <Table.Cell className="text-sm text-zinc-500">{formatDuration(track.duration)}</Table.Cell>
                                            <Table.Cell className="text-sm text-zinc-500">{track.links?.length || 0}</Table.Cell>
                                            <Table.Cell>
                                                <Chip color={isTrackActive(track) ? "success" : "danger"} variant="soft" size="sm">
                                                    <Chip.Label>{isTrackActive(track) ? "Active" : "Inactive"}</Chip.Label>
                                                </Chip>
                                            </Table.Cell>
                                            <Table.Cell className="text-end">
                                                <div className="flex justify-end">
                                                    <Dropdown>
                                                        <Button isIconOnly aria-label="Menu" variant="secondary">
                                                            <Icon icon="lucide:ellipsis-vertical" className="outline-none"/>
                                                        </Button>
                                                        <Dropdown.Popover>
                                                            <Dropdown.Menu onAction={(key) => {
                                                                if (key === "generate-link") {
                                                                    document.getElementById(`generate-${track.id}`)?.click()
                                                                }
                                                                if (key === "view-links") {
                                                                    document.getElementById(`view-links-${track.id}`)?.click()
                                                                }
                                                                if (key === "delete-track") {
                                                                    setDeleteTarget(track)
                                                                }
                                                            }}>
                                                                <Dropdown.Item id="generate-link" textValue="Generate Link">
                                                                    <Label>Generate Link</Label>
                                                                </Dropdown.Item>
                                                                <Dropdown.Item id="view-links" textValue="View Links">
                                                                    <Label>View Links ({track.links?.length || 0})</Label>
                                                                </Dropdown.Item>
                                                                <Dropdown.Item id="delete-track" textValue="Delete Track" variant="danger">
                                                                    <Label>Delete Track</Label>
                                                                </Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown.Popover>
                                                    </Dropdown>
                                                </div>
                                            </Table.Cell>
                                        </Table.Row>
                                    )}
                                </Table.Collection>
                                {hasMore && (
                                    <Table.LoadMore isLoading={isLoadingMore} scrollOffset={0} onLoadMore={loadMore}>
                                        <Table.LoadMoreContent>
                                            <Spinner size="md" />
                                        </Table.LoadMoreContent>
                                    </Table.LoadMore>
                                )}
                            </Table.Body>
                        </Table.Content>
                    </Table.ScrollContainer>
                </Table>
            </div>

            {lastGeneratedUrl && (
                <div
                    className="fixed bottom-6 right-6 bg-white border border-zinc-200 rounded-2xl shadow-lg p-4 flex items-center gap-3 max-w-md z-50">
                    <Icon icon="lucide:check-circle" className="text-green-500 text-xl shrink-0"/>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Link generated</p>
                        <p className="text-xs text-zinc-500 truncate">{lastGeneratedUrl}</p>
                    </div>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigator.clipboard.writeText(lastGeneratedUrl)}
                    >
                        Copy
                    </Button>
                    <button onClick={() => setLastGeneratedUrl(null)} aria-label="Dismiss" className="text-zinc-400">
                        <Icon icon="lucide:x"/>
                    </button>
                </div>
            )}

            {tracks.map(track => (
                <GenerateLinkPopup
                    key={`generate-modal-${track.id}`}
                    track={track}
                    onGenerated={(url) => {
                        setLastGeneratedUrl(url)
                        refetch()
                    }}
                />
            ))}

            {tracks.map(track => (
                <ViewLinksPopup
                    key={`view-links-modal-${track.id}`}
                    track={track}
                    onUpdated={refetch}
                />
            ))}

            {deleteTarget && (
                <Modal>
                    <Modal.Backdrop variant="blur" isOpen={!!deleteTarget}
                                    onOpenChange={(open) => !open && setDeleteTarget(null)}>
                        <Modal.Container placement="auto" size="md">
                            <Modal.Dialog>
                                <Modal.CloseTrigger/>
                                <Modal.Body>
                                    <p className="text-xl text-zinc-800 mt-4">
                                        Are you sure you want to delete <span
                                        className="font-medium text-foreground">{deleteTarget.title}</span> by {deleteTarget.artist}?
                                    </p>
                                    <p className="text-sm font-semibold text-zinc-500 mt-6">
                                        This will permanently delete the audio file and
                                        all {deleteTarget.links?.length || 0} associated
                                        link{deleteTarget.links?.length === 1 ? "" : "s"}. This cannot be undone.
                                    </p>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button
                                        variant="danger"
                                        isDisabled={deleting}
                                        onClick={async () => {
                                            setDeleting(true)
                                            try {
                                                await fetch(`/api/preview-links/${deleteTarget.id}`, {method: "DELETE"})
                                                setDeleteTarget(null)
                                                refetch()
                                            } catch (e) {
                                                console.error(e)
                                            } finally {
                                                setDeleting(false)
                                            }
                                        }}
                                    >
                                        {deleting ? "Deleting..." : "Delete Track"}
                                    </Button>
                                </Modal.Footer>
                            </Modal.Dialog>
                        </Modal.Container>
                    </Modal.Backdrop>
                </Modal>
            )}
        </div>
    )
}