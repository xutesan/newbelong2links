"use client"

import { Modal, Button, TextField, Input, Label, useOverlayState } from "@heroui/react"
import { useState } from "react"

interface PreviewTrack {
    id: string
    title: string
    artist: string
}

interface Props {
    track: PreviewTrack
    onGenerated: (url: string) => void
}

export default function GenerateLinkPopup({ track, onGenerated }: Props) {
    const state = useOverlayState({ defaultOpen: false })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [form, setForm] = useState({ recipientName: "", expiresInDays: "" })

    function handleChange(field: string, value: string) {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    async function handleSubmit() {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`/api/preview-links/${track.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipientName: form.recipientName || null,
                    expiresInDays: form.expiresInDays ? Number(form.expiresInDays) : null,
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || "Failed to generate link")
                return
            }

            const url = `https://lnk.belong2.club/preview/${data.link.token}`
            onGenerated(url)
            state.close()
            setForm({ recipientName: "", expiresInDays: "" })
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal>
            <button onClick={state.open} className="hidden" id={`generate-${track.id}`}/>
            <Modal.Backdrop isOpen={state.isOpen} onOpenChange={state.setOpen}>
                <Modal.Container placement="auto" size="lg">
                    <Modal.Dialog>
                        <Modal.CloseTrigger/>
                        <Modal.Header className="pt-7 pl-4">
                            <Modal.Heading className="text-3xl font-bold">Generating link for {track.title} </Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="pt-0 px-6 pb-6 pt-4">
                            <div className="flex flex-col gap-4 max-w-md">
                                <TextField name="recipientName" variant="secondary">
                                    <Label>Recipient name (optional)</Label>
                                    <Input placeholder="Leave blank for a public link"
                                           onChange={e => handleChange("recipientName", e.target.value)}/>
                                </TextField>

                                <TextField name="expiresInDays" variant="secondary">
                                    <Label>Expires in (days)</Label>
                                    <Input type="number" placeholder="Leave blank for no expiry"
                                           onChange={e => handleChange("expiresInDays", e.target.value)}/>
                                </TextField>

                                {error && <p className="text-xs text-red-500">{error}</p>}
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="primary" onClick={handleSubmit} isDisabled={loading}>
                                {loading ? "Generating..." : "Generate"}
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    )
}