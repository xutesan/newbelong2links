"use client"

import { Modal, Button, TextField, Input, Switch } from "@heroui/react"
import { Icon } from "@iconify/react"
import { Label, useOverlayState } from '@heroui/react'
import { useState } from "react"

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

interface Props {
    release: Release
    onSuccess: () => void
}

export default function EditReleasePopup({ release, onSuccess }: Props) {
    const state = useOverlayState({ defaultOpen: false })
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        title: release.title,
        artist: release.artist,
        identifier: release.identifier,
        linkName: release.linkName || "",
        spotifyLink: release.spotifyLink || "",
        appleLink: release.appleLink || "",
        soundcloudLink: release.soundcloudLink || "",
        youtubeLink: release.youtubeLink || "",
        isPublic: release.isPublic,
    })

    function handleChange(field: string, value: string | boolean) {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    async function handleSubmit() {
        setLoading(true)
        try {
            await fetch("/api/releases", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: release.id, ...form }),
            })
            onSuccess()
            state.close()
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal>
            <button onClick={state.open} className="hidden" id={`edit-${release.id}`} />
            <Modal.Backdrop isOpen={state.isOpen} onOpenChange={state.setOpen}>
                <Modal.Container placement="auto" size="cover">
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        <Modal.Header className="pt-12 pl-6">
                            <Modal.Heading className="text-4xl font-bold">Edit Release</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="pt-0 px-6 pb-6">
                            <div className="grid grid-cols-[500px_1fr] gap-12 place-content-center h-full">
                                <div className="flex flex-col gap-2">
                                    <Label>Artwork</Label>
                                    <div className="w-full aspect-square rounded-2xl overflow-hidden border-2 border-zinc-200">
                                        {release.artwork ? (
                                            <img src={release.artwork} alt={release.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-zinc-50 flex items-center justify-center">
                                                <Icon icon="lucide:image" className="text-zinc-300 text-4xl" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <TextField name="title" variant="secondary">
                                        <Label>Title</Label>
                                        <Input placeholder="Song title" value={form.title}
                                               onChange={e => handleChange("title", e.target.value)}/>
                                    </TextField>

                                    <TextField name="artist" variant="secondary">
                                        <Label>Artist</Label>
                                        <Input placeholder="Artist name" value={form.artist}
                                               onChange={e => handleChange("artist", e.target.value)}/>
                                    </TextField>

                                    <div className="grid grid-cols-2 gap-4">
                                        <TextField name="identifier" variant="secondary">
                                            <Label>Identifier</Label>
                                            <Input placeholder="e.g. B2S001" value={form.identifier}
                                                   onChange={e => handleChange("identifier", e.target.value)}/>
                                        </TextField>
                                        <TextField name="linkName" variant="secondary">
                                            <Label>Link Name</Label>
                                            <Input placeholder="e.g. My Song" value={form.linkName}
                                                   onChange={e => handleChange("linkName", e.target.value)}/>
                                        </TextField>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <TextField name="spotifyLink" variant="secondary">
                                            <Label>Spotify Link</Label>
                                            <Input placeholder="https://open.spotify.com/..." value={form.spotifyLink}
                                                   onChange={e => handleChange("spotifyLink", e.target.value)}/>
                                        </TextField>
                                        <TextField name="appleLink" variant="secondary">
                                            <Label>Apple Music Link</Label>
                                            <Input placeholder="https://music.apple.com/..." value={form.appleLink}
                                                   onChange={e => handleChange("appleLink", e.target.value)}/>
                                        </TextField>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <TextField name="soundcloudLink" variant="secondary">
                                            <Label>SoundCloud Link</Label>
                                            <Input placeholder="https://soundcloud.com/..." value={form.soundcloudLink}
                                                   onChange={e => handleChange("soundcloudLink", e.target.value)}/>
                                        </TextField>
                                        <TextField name="youtubeLink" variant="secondary">
                                            <Label>YouTube Link</Label>
                                            <Input placeholder="https://youtube.com/..." value={form.youtubeLink}
                                                   onChange={e => handleChange("youtubeLink", e.target.value)}/>
                                        </TextField>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label>Visibility</Label>
                                        <Switch
                                            name="isPublic"
                                            size="lg"
                                            defaultSelected={release.isPublic}
                                            onChange={(isSelected) => handleChange("isPublic", isSelected)}
                                            aria-label="Visibility"
                                        >
                                            {({isSelected}) => (
                                                <Switch.Content>
                                                    <Switch.Control className={isSelected ? "bg-green-500/80" : "bg-red-500/80"}>
                                                        <Switch.Thumb>
                                                            <Switch.Icon>
                                                                {isSelected ? (
                                                                    <Icon icon="lucide:unlock" className="size-3 text-inherit opacity-100"/>
                                                                ) : (
                                                                    <Icon icon="lucide:lock" className="size-3 text-inherit opacity-70"/>
                                                                )}
                                                            </Switch.Icon>
                                                        </Switch.Thumb>
                                                    </Switch.Control>
                                                </Switch.Content>
                                            )}
                                        </Switch>
                                    </div>
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="primary" onClick={handleSubmit} isDisabled={loading}>
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    )
}