"use client"

import { Modal, Button, TextField, Input, Label, useOverlayState } from "@heroui/react"
import { Icon } from "@iconify/react"
import { useState } from "react"
import UploadAudio from "@/components/UploadAudio";

interface Props {
    onSuccess: () => void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes

export default function UploadTrackPopup({ onSuccess }: Props) {
    const state = useOverlayState({ defaultOpen: false })
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [form, setForm] = useState({ title: "", artist: "" })

    function handleChange(field: string, value: string) {
        setForm(prev => ({ ...prev, [field]: value }))
        setErrors(prev => ({ ...prev, [field]: "" }))
    }

    function validate() {
        const newErrors: Record<string, string> = {}
        if (!form.title) newErrors.title = "Title is required"
        if (!form.artist) newErrors.artist = "Artist is required"
        if (!file) newErrors.file = "Audio file is required"
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    async function handleSubmit() {
        if (!validate()) return
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("file", file as File)
            formData.append("title", form.title)
            formData.append("artist", form.artist)
            formData.append("uploadedBy", "belong2")

            const res = await fetch("/api/preview-links/upload", {
                method: "POST",
                body: formData,
            })
            const data = await res.json()
            if (!res.ok) {
                setErrors({ file: data.error || "Upload failed" })
                return
            }

            onSuccess()
            state.close()
            setForm({ title: "", artist: "" })
            setFile(null)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal>
            <Button variant="secondary" onClick={state.open}>
                <Icon icon="lucide:upload" />
                Upload Track
            </Button>
            <Modal.Backdrop isOpen={state.isOpen} onOpenChange={state.setOpen}>
                <Modal.Container placement="auto" size="lg">
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        <Modal.Header className="pt-12 pl-6">
                            <Modal.Heading className="text-4xl font-bold pb-6">Upload Preview Track</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="pt-0 px-6 pb-6">
                            <div className="flex flex-col gap-4 max-w-md">
                                <div className="flex flex-col gap-1">
                                    <TextField name="title" variant="secondary">
                                        <Label className="text-lg">Title</Label>
                                        <Input placeholder="Track title"
                                               onChange={e => handleChange("title", e.target.value)}/>
                                    </TextField>
                                    {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <TextField name="artist" variant="secondary">
                                        <Label className="text-lg">Artist</Label>
                                        <Input placeholder="Artist name"
                                               onChange={e => handleChange("artist", e.target.value)}/>
                                    </TextField>
                                    {errors.artist && <p className="text-xs text-red-500">{errors.artist}</p>}
                                </div>
                                    <div className="flex flex-col gap-1">
                                    <Label className="text-lg">Audio file</Label>
                                    <UploadAudio
                                        onFileSelect={(selected) => setFile(selected)}
                                        className="w-full h-32"
                                    />
                                        {errors.file && <p className="text-xs text-red-500">{errors.file}</p>}
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={handleSubmit} isDisabled={loading}>
                            {loading ? "Uploading..." : "Upload"}
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    )
}