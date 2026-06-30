"use client"

import { useState } from "react"
import { Surface, Button, TextField, Input, Label } from "@heroui/react"
import { useSession, signOut } from "next-auth/react"

export default function SettingsPage() {
    const { data: session, update } = useSession()
    const [name, setName] = useState(session?.user?.name || "")
    const [loading, setLoading] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)

    async function handleSave() {
        setLoading(true)
        await fetch("/api/users/me", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        })
        setLoading(false)
        window.location.reload()
    }

    async function handleDelete() {
        if (!confirm("Are you sure? This cannot be undone.")) return
        setDeleteLoading(true)
        await fetch("/api/users/me", {
            method: "DELETE",
        })
        signOut({ callbackUrl: "/" })
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="gap-2">
                <h1 className="text-4xl font-bold">Settings</h1>
                <p>Manage your account.</p>
            </div>

            <div className="flex gap-4">
                <Surface className="rounded-3xl p-6 flex flex-col gap-4 flex-1" variant="default">
                    <h2 className="text-sm font-semibold">Profile</h2>
                    <TextField name="name" variant="secondary">
                        <Label>Display Name</Label>
                        <Input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Your name"
                        />
                    </TextField>
                    <Button variant="primary" onClick={handleSave} isDisabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </Surface>

                <Surface className="rounded-3xl p-6 flex flex-col gap-4 flex-1 border border-red-100" variant="default">
                    <h2 className="text-sm font-semibold text-red-500">Danger Zone</h2>
                    <p className="text-xs text-zinc-400">Deleting your account is permanent and cannot be undone.</p>
                    <Button variant="danger" onClick={handleDelete} isDisabled={deleteLoading}>
                        {deleteLoading ? "Deleting..." : "Delete Account"}
                    </Button>
                </Surface>
            </div>
        </div>
    )
}