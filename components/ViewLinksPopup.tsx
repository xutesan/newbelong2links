"use client"

import { Modal, Button, useOverlayState, Chip } from "@heroui/react"
import { Icon } from "@iconify/react"
import { useState } from "react"

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
    links: PreviewLink[]
}

interface Props {
    track: PreviewTrack
    onUpdated: () => void
}

export default function ViewLinksPopup({ track, onUpdated }: Props) {
    const state = useOverlayState({ defaultOpen: false })
    const [editingId, setEditingId] = useState<string | null>(null)
    const [recipientDraft, setRecipientDraft] = useState("")
    const [loading, setLoading] = useState(false)
    const [copiedId, setCopiedId] = useState<string | null>(null)

    function sortLinks(links: PreviewLink[]) {
        const statusOrder = { Active: 0, Expired: 1, Revoked: 2 }
        return [...links].sort((a, b) => {
            return statusOrder[getStatus(a).label as keyof typeof statusOrder] -
                statusOrder[getStatus(b).label as keyof typeof statusOrder]
        })
    }

    function getStatus(link: PreviewLink) {
        if (link.revoked) return { label: "Revoked", color: "danger" as const }
        if (link.expiresAt && new Date(link.expiresAt) < new Date()) return { label: "Expired", color: "warning" as const }
        return { label: "Active", color: "success" as const }
    }

    function copyLink(token: string, linkId: string) {
        const url = `https://lnk.belong2.club/preview/${token}`
        navigator.clipboard.writeText(url)
        setCopiedId(linkId)
        setTimeout(() => setCopiedId(null), 2000)
    }

    async function updateLink(linkId: string, data: Record<string, unknown>) {
        setLoading(true)
        try {
            await fetch(`/api/preview-links/link/${linkId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            onUpdated()
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal>
            <button onClick={state.open} className="hidden" id={`view-links-${track.id}`} />
            <Modal.Backdrop isOpen={state.isOpen} onOpenChange={state.setOpen}>
                <Modal.Container placement="auto" size="cover">
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        <Modal.Header className="pt-7 pl-6">
                            <Modal.Heading className="text-4xl font-bold pb-6">Links for {track.title}</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="pt-0 px-6 pb-6">
                            {track.links.length === 0 ? (
                                <p className="text-sm text-zinc-400">No links generated yet.</p>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {sortLinks(track.links).map(link => {
                                        const status = getStatus(link)
                                        const isEditing = editingId === link.id
                                        return (
                                            <div key={link.id} className="border border-zinc-200 rounded-2xl p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {link.recipientName || "Public link"}
                                                        </p>
                                                        <Chip size="sm" color={status.color} variant="soft" className="mt-2">
                                                            <Chip.Label>{status.label}</Chip.Label>
                                                        </Chip>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs text-zinc-400">
                                                            {link.playCount} plays
                                                        </p>
                                                        <Button
                                                            size="sm"
                                                            variant="primary"
                                                            onClick={() => copyLink(link.token, link.id)}
                                                        >
                                                            <Icon
                                                                icon={copiedId === link.id ? "lucide:check" : "lucide:copy"}/>
                                                            {copiedId === link.id ? "Copied" : "Copy"}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="tertiary"
                                                            onClick={() => {
                                                                setEditingId(isEditing ? null : link.id)
                                                                setRecipientDraft(link.recipientName || "")
                                                            }}
                                                        >
                                                            <Icon icon="lucide:pencil"/>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="danger"
                                                            isDisabled={loading}
                                                            onClick={() => updateLink(link.id, {revoked: !link.revoked})}
                                                        >
                                                            {link.revoked ? "Unrevoke" : "Revoke"}
                                                        </Button>
                                                    </div>
                                                </div>

                                                {isEditing && (
                                                    <div
                                                        className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-100">
                                                    <input
                                                            className="flex-1 border border-zinc-200 rounded-lg px-3 py-1.5 text-sm"
                                                            value={recipientDraft}
                                                            onChange={(e) => setRecipientDraft(e.target.value)}
                                                            placeholder="Recipient name"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="primary"
                                                            isDisabled={loading}
                                                            onClick={async () => {
                                                                await updateLink(link.id, { recipientName: recipientDraft })
                                                                setEditingId(null)
                                                            }}
                                                        >
                                                            Save
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    )
}