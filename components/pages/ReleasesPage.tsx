"use client"

import { useEffect, useState } from "react"
import { Skeleton, SearchField, Button, Dropdown, Label, Table, Chip, EmptyState, AlertDialog } from "@heroui/react"
import { Icon } from "@iconify/react"
import AddReleasePopup from "@/components/popups/AddReleasePopup"
import EditReleasePopup from "@/components/popups/EditReleasePopup"
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
    const [deleteTarget, setDeleteTarget] = useState<Release | null>(null)
    const [deleting, setDeleting] = useState(false)
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
            <div className="flex flex-col gap-2">
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
                {loading ? (
                    <div className="w-full rounded-2xl border border-zinc-200 overflow-hidden">
                        <div className="bg-surface-secondary px-4 py-3 flex gap-6">
                            <div className="w-24"><Skeleton className="w-10 h-3 rounded" /></div>
                            <div className="w-64"><Skeleton className="w-20 h-3 rounded" /></div>
                            <div className="w-40"><Skeleton className="w-16 h-3 rounded" /></div>
                            <div className="w-24"><Skeleton className="w-14 h-3 rounded" /></div>
                            <div className="w-24"><Skeleton className="w-12 h-3 rounded" /></div>
                            <div className="w-24"><Skeleton className="w-14 h-3 rounded" /></div>
                            <div className="flex-1"><Skeleton className="w-14 h-3 rounded" /></div>
                        </div>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="px-4 py-3 flex items-center gap-6 border-t border-zinc-100">
                                <div className="w-24"><Skeleton className="w-16 h-16 rounded-lg" /></div>
                                <div className="w-64"><Skeleton className="w-40 h-4 rounded-lg" /></div>
                                <div className="w-40"><Skeleton className="w-24 h-4 rounded-lg" /></div>
                                <div className="w-24"><Skeleton className="w-12 h-4 rounded-lg" /></div>
                                <div className="w-24"><Skeleton className="w-16 h-4 rounded-lg" /></div>
                                <div className="w-24"><Skeleton className="w-16 h-6 rounded-full" /></div>
                                <div className="flex-1 flex justify-end"><Skeleton className="w-8 h-8 rounded-lg" /></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Table>
                        <Table.ScrollContainer className="max-h-[600px] overflow-y-auto">
                            <Table.Content aria-label="Releases" className="min-w-[900px]">
                                <Table.Header className="sticky top-0 z-10 bg-surface-secondary">
                                    <Table.Column isRowHeader className="w-24 text-lg text-zinc-600 font-bold">Cover</Table.Column>
                                    <Table.Column className="w-64 text-lg text-zinc-600 font-bold">Release</Table.Column>
                                    <Table.Column className="w-40 text-lg text-zinc-600 font-bold">Artist</Table.Column>
                                    <Table.Column className="w-24 text-lg text-zinc-600 font-bold">Page Views</Table.Column>
                                    <Table.Column className="w-24 text-lg text-zinc-600 font-bold">Access</Table.Column>
                                    <Table.Column className="w-1 text-end text-lg text-zinc-600 font-bold">Actions</Table.Column>
                                </Table.Header>
                                <Table.Body
                                    renderEmptyState={() => (
                                        <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                                            <Icon className="size-6 text-muted" icon="gravity-ui:tray" />
                                            <span className="text-sm text-muted">No releases yet.</span>
                                        </EmptyState>
                                    )}
                                >
                                    <Table.Collection items={filtered}>
                                        {(release) => (
                                            <Table.Row id={release.id}>
                                                <Table.Cell>
                                                    {release.artwork ? (
                                                        <img src={release.artwork} alt={release.title} className="w-16 h-16 rounded-lg object-cover"/>
                                                    ) : (
                                                        <div className="w-16 h-16 rounded-lg bg-zinc-200 flex items-center justify-center">
                                                            <Icon icon="lucide:music" className="text-zinc-400 text-lg"/>
                                                        </div>
                                                    )}
                                                </Table.Cell>
                                                <Table.Cell className="text-sm font-medium text-foreground">{release.title}</Table.Cell>
                                                <Table.Cell className="text-sm text-zinc-500">{release.artist}</Table.Cell>
                                                <Table.Cell className="text-sm text-zinc-500">{release.views.toLocaleString()}</Table.Cell>
                                                <Table.Cell>
                                                    <Chip color={release.isPublic ? "success" : "danger"} variant="soft" size="md">
                                                        <Chip.Label>{release.isPublic ? "Public" : "Private"}</Chip.Label>
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
                                                                    if (key === "edit-release") {
                                                                        document.getElementById(`edit-${release.id}`)?.click()
                                                                    }
                                                                    if (key === "copy-link") {
                                                                        const url = `${window.location.origin}/${release.linkName}`
                                                                        navigator.clipboard.writeText(url)
                                                                    }
                                                                    if (key === "delete-release") {
                                                                        setDeleteTarget(release)
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
                                                </Table.Cell>
                                            </Table.Row>
                                        )}
                                    </Table.Collection>
                                </Table.Body>
                            </Table.Content>
                        </Table.ScrollContainer>
                    </Table>
                )}
            </div>

            {filtered.map(release => (
                <EditReleasePopup
                    key={`edit-modal-${release.id}`}
                    release={release}
                    onSuccess={refetch}
                />
            ))}

            {deleteTarget && (
                <AlertDialog>
                    <AlertDialog.Backdrop
                        variant="blur"
                        isOpen={!!deleteTarget}
                        onOpenChange={(open) => !open && setDeleteTarget(null)}
                    >
                        <AlertDialog.Container placement="auto" size="md">
                            <AlertDialog.Dialog>
                                <AlertDialog.CloseTrigger />
                                <AlertDialog.Header>
                                    <AlertDialog.Icon status="danger" />
                                    <AlertDialog.Heading>Delete Release</AlertDialog.Heading>
                                </AlertDialog.Header>
                                <AlertDialog.Body>
                                    <p>
                                        Are you sure you want to delete{" "}
                                        <span className="font-medium text-foreground">{deleteTarget.title}</span> by{" "}
                                        {deleteTarget.artist}?
                                    </p>
                                    <p className="text-sm text-muted mt-2">
                                        This will permanently remove the release and its link. This cannot be undone.
                                    </p>
                                </AlertDialog.Body>
                                <AlertDialog.Footer>
                                    <Button
                                        variant="tertiary"
                                        isDisabled={deleting}
                                        onClick={() => setDeleteTarget(null)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="danger"
                                        isDisabled={deleting}
                                        onClick={async () => {
                                            setDeleting(true)
                                            try {
                                                await fetch("/api/releases", {
                                                    method: "DELETE",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ id: deleteTarget.id }),
                                                })
                                                setDeleteTarget(null)
                                                refetch()
                                            } catch (e) {
                                                console.error(e)
                                            } finally {
                                                setDeleting(false)
                                            }
                                        }}
                                    >
                                        {deleting ? "Deleting..." : "Delete Release"}
                                    </Button>
                                </AlertDialog.Footer>
                            </AlertDialog.Dialog>
                        </AlertDialog.Container>
                    </AlertDialog.Backdrop>
                </AlertDialog>
            )}
        </div>
    )
}