"use client"

import { Modal, Button, TextField, Input, Switch } from "@heroui/react"
import { Icon } from "@iconify/react"
import { DatePicker, DateField, Calendar, Label } from '@heroui/react';
import UploadArtwork from "@/components/UploadArtwork"
import { useState, useRef } from "react"
import { useOverlayState } from "@heroui/react"

interface Props {
    onSuccess: () => void
}

export default function AddReleasePopup({ onSuccess }: Props) {
    const [artworkFile, setArtworkFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const closeRef = useRef<HTMLDivElement>(null)
    const state = useOverlayState({ defaultOpen: false })
    const [form, setForm] = useState({
        title: "",
        artist: "",
        identifier: "",
        linkName: "",
        releaseDate: "",
        spotifyLink: "",
        appleLink: "",
        soundcloudLink: "",
        youtubeLink: "",
        isPublic: false,
    })

    function handleChange(field: string, value: string | boolean) {
        setForm(prev => ({ ...prev, [field]: value }))
        setErrors(prev => ({ ...prev, [field]: "" }))
    }

    function validate() {
        const newErrors: Record<string, string> = {}
        if (!form.title) newErrors.title = "Title is required"
        if (!form.artist) newErrors.artist = "Artist is required"
        if (!form.identifier) newErrors.identifier = "Identifier is required"
        if (!form.linkName) newErrors.linkName = "Link name is required"
        if (!form.releaseDate) newErrors.releaseDate = "Release date is required"
        if (!form.spotifyLink) newErrors.spotifyLink = "Spotify link is required"
        if (!form.appleLink) newErrors.appleLink = "Apple Music link is required"
        if (!form.soundcloudLink) newErrors.soundcloudLink = "SoundCloud link is required"
        if (!form.youtubeLink) newErrors.youtubeLink = "YouTube link is required"
        if (!artworkFile) newErrors.artwork = "Artwork is required"
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    async function handleSubmit() {
        if (!validate()) return
        setLoading(true)
        try {
            let artworkUrl = ""

            if (artworkFile) {
                const formData = new FormData()
                formData.append("file", artworkFile)
                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                })
                const data = await res.json()
                artworkUrl = data.url
            }

            const slugifiedLinkName = form.linkName.toLowerCase().replace(/\s+/g, "-")

            const res = await fetch("/api/releases", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    linkName: slugifiedLinkName,
                    artwork: artworkUrl,
                    releaseDate: new Date(form.releaseDate).toISOString(),
                }),
            })

            const data = await res.json()
            if (data.error) {
                setErrors({ identifier: data.error })
                return
            }

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
            <Button variant="secondary" onClick={state.open}>
                <Icon icon="lucide:plus" />
                Add Release
            </Button>
            <Modal.Backdrop isOpen={state.isOpen} onOpenChange={state.setOpen}>
                <Modal.Container placement="auto" size="cover">
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        <Modal.Header className="pt-12 pl-6">
                            <Modal.Heading className="text-4xl font-bold">Add Release</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="pt-0 px-6 pb-6">
                            <div className="grid grid-cols-[500px_1fr] gap-12 place-content-center h-full">
                                {/* Left — artwork */}
                                <div className="flex flex-col gap-2">
                                    <Label>Artwork</Label>
                                    <UploadArtwork
                                        onFileSelect={(file: File | null) => setArtworkFile(file)}
                                        className="w-full aspect-square"
                                    />
                                    {errors.artwork && <p className="text-xs text-red-500">{errors.artwork}</p>}
                                </div>

                                {/* Right — fields */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-1">
                                        <TextField name="title" variant="secondary">
                                            <Label>Title</Label>
                                            <Input placeholder="Song title"
                                                   onChange={e => handleChange("title", e.target.value)}/>
                                        </TextField>
                                        {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <TextField name="artist" variant="secondary">
                                            <Label>Artist</Label>
                                            <Input placeholder="Artist name"
                                                   onChange={e => handleChange("artist", e.target.value)}/>
                                        </TextField>
                                        {errors.artist && <p className="text-xs text-red-500">{errors.artist}</p>}
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <TextField name="identifier" variant="secondary">
                                                <Label>Identifier</Label>
                                                <Input placeholder="e.g. B2S001"
                                                       onChange={e => handleChange("identifier", e.target.value)}/>
                                            </TextField>
                                            {errors.identifier &&
                                                <p className="text-xs text-red-500">{errors.identifier}</p>}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <TextField name="linkName" variant="secondary">
                                                <Label>Link Name</Label>
                                                <Input placeholder="e.g. My Song"
                                                       onChange={e => handleChange("linkName", e.target.value)}/>
                                            </TextField>
                                            {errors.linkName &&
                                                <p className="text-xs text-red-500">{errors.linkName}</p>}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <DatePicker className="w-full" name="releaseDate"
                                                        onChange={(date) => date && handleChange("releaseDate", date.toString())}>
                                                <Label>Release Date</Label>
                                                <DateField.Group fullWidth>
                                                    <DateField.Input>{(segment) => <DateField.Segment
                                                        segment={segment}/>}</DateField.Input>
                                                    <DateField.Suffix>
                                                        <DatePicker.Trigger>
                                                            <DatePicker.TriggerIndicator/>
                                                        </DatePicker.Trigger>
                                                    </DateField.Suffix>
                                                </DateField.Group>
                                                <DatePicker.Popover style={{width: "280px"}}>
                                                    <div className="w-[280px]">
                                                        <Calendar aria-label="Release date">
                                                            <Calendar.Header>
                                                                <Calendar.YearPickerTrigger>
                                                                    <Calendar.YearPickerTriggerHeading/>
                                                                    <Calendar.YearPickerTriggerIndicator/>
                                                                </Calendar.YearPickerTrigger>
                                                                <Calendar.NavButton slot="previous"/>
                                                                <Calendar.NavButton slot="next"/>
                                                            </Calendar.Header>
                                                            <Calendar.Grid>
                                                                <Calendar.GridHeader>
                                                                    {(day) =>
                                                                        <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                                                                </Calendar.GridHeader>
                                                                <Calendar.GridBody>{(date) => <Calendar.Cell
                                                                    date={date}/>}</Calendar.GridBody>
                                                            </Calendar.Grid>
                                                            <Calendar.YearPickerGrid>
                                                                <Calendar.YearPickerGridBody>
                                                                    {({year}) => <Calendar.YearPickerCell year={year}/>}
                                                                </Calendar.YearPickerGridBody>
                                                            </Calendar.YearPickerGrid>
                                                        </Calendar>
                                                    </div>
                                                </DatePicker.Popover>
                                            </DatePicker>
                                            {errors.releaseDate &&
                                                <p className="text-xs text-red-500">{errors.releaseDate}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <TextField name="spotifyLink" variant="secondary">
                                                <Label>Spotify Link</Label>
                                                <Input placeholder="https://open.spotify.com/..."
                                                       onChange={e => handleChange("spotifyLink", e.target.value)}/>
                                            </TextField>
                                            {errors.spotifyLink &&
                                                <p className="text-xs text-red-500">{errors.spotifyLink}</p>}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <TextField name="appleLink" variant="secondary">
                                                <Label>Apple Music Link</Label>
                                                <Input placeholder="https://music.apple.com/..."
                                                       onChange={e => handleChange("appleLink", e.target.value)}/>
                                            </TextField>
                                            {errors.appleLink &&
                                                <p className="text-xs text-red-500">{errors.appleLink}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <TextField name="soundcloudLink" variant="secondary">
                                                <Label>SoundCloud Link</Label>
                                                <Input placeholder="https://soundcloud.com/..."
                                                       onChange={e => handleChange("soundcloudLink", e.target.value)}/>
                                            </TextField>
                                            {errors.soundcloudLink &&
                                                <p className="text-xs text-red-500">{errors.soundcloudLink}</p>}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <TextField name="youtubeLink" variant="secondary">
                                                <Label>YouTube Link</Label>
                                                <Input placeholder="https://youtube.com/..."
                                                       onChange={e => handleChange("youtubeLink", e.target.value)}/>
                                            </TextField>
                                            {errors.youtubeLink &&
                                                <p className="text-xs text-red-500">{errors.youtubeLink}</p>}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label>Visibility</Label>
                                        <Switch
                                            name="isPublic"
                                            size="lg"
                                            onChange={(isSelected) => handleChange("isPublic", isSelected)}
                                            aria-label="Visibility"
                                        >
                                            {({isSelected}) => (
                                                <Switch.Content>
                                                    <Switch.Control
                                                        className={isSelected ? "bg-green-500/80" : "bg-red-500/80"}>
                                                        <Switch.Thumb>
                                                            <Switch.Icon>
                                                                {isSelected ? (
                                                                    <Icon icon="lucide:unlock"
                                                                          className="size-3 text-inherit opacity-100"/>
                                                                ) : (
                                                                    <Icon icon="lucide:lock"
                                                                          className="size-3 text-inherit opacity-70"/>
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
                                {loading ? "Creating..." : "Create Release"}
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    )
}