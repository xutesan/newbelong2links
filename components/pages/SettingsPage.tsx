"use client"

import { useState } from "react"
import { Surface, Button, TextField, Input, Label, AlertDialog } from "@heroui/react"
import { Icon } from "@iconify/react"
import { useSession, signOut } from "next-auth/react"

export default function SettingsPage() {
    const { data: session } = useSession()
    const [name, setName] = useState(session?.user?.name || "")
    const [loading, setLoading] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [confirmingDelete, setConfirmingDelete] = useState(false)

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
        setDeleteLoading(true)
        try {
            await fetch("/api/users/me", { method: "DELETE" })
            signOut({ callbackUrl: "/" })
        } finally {
            setDeleteLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold">Settings</h1>
                <p className="text-zinc-500">Manage your account.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <Surface className="rounded-3xl p-6 flex flex-col gap-5 flex-1" variant="default">
                    <div className="flex items-center gap-3">
                        {session?.user?.image ? (
                            <img
                                src={session.user.image}
                                alt={session.user.name || "Profile"}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center text-lg font-medium text-zinc-500">
                                {session?.user?.name?.[0] || "?"}
                            </div>
                        )}
                        <div>
                            <h2 className="text-sm font-semibold">{session?.user?.name}</h2>
                            <p className="text-xs text-zinc-400">{session?.user?.email}</p>
                        </div>
                    </div>

                    <TextField name="name" variant="secondary">
                        <Label>Display Name</Label>
                        <Input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Your name"
                        />
                    </TextField>

                    <Button variant="primary" onClick={handleSave} isDisabled={loading} className="self-start">
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </Surface>

                <Surface className="rounded-3xl p-6 flex flex-col gap-4 flex-1 border border-red-100" variant="default">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                            <Icon icon="lucide:triangle-alert" className="text-red-500 text-xl" />
                        </div>
                        <h2 className="text-sm font-semibold text-red-500">Danger Zone</h2>
                    </div>

                    <p className="text-xs text-zinc-400">
                        Deleting your account is permanent and cannot be undone. All your data will be removed immediately.
                    </p>

                    <Button
                        variant="danger"
                        onClick={() => setConfirmingDelete(true)}
                        isDisabled={deleteLoading}
                        className="self-start"
                    >
                        {deleteLoading ? "Deleting..." : "Delete Account"}
                    </Button>
                </Surface>
            </div>

            {confirmingDelete && (
                <AlertDialog>
                    <AlertDialog.Backdrop
                        variant="blur"
                        isOpen={confirmingDelete}
                        onOpenChange={(open) => !open && setConfirmingDelete(false)}
                    >
                        <AlertDialog.Container placement="auto" size="md">
                            <AlertDialog.Dialog>
                                <AlertDialog.CloseTrigger />
                                <AlertDialog.Header>
                                    <AlertDialog.Icon status="danger" />
                                    <AlertDialog.Heading>Delete your account?</AlertDialog.Heading>
                                </AlertDialog.Header>
                                <AlertDialog.Body>
                                    <p>
                                        This will permanently delete your account and remove all your access.
                                        This action is irreversible.
                                    </p>
                                </AlertDialog.Body>
                                <AlertDialog.Footer>
                                    <Button
                                        variant="tertiary"
                                        isDisabled={deleteLoading}
                                        onClick={() => setConfirmingDelete(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="danger"
                                        isDisabled={deleteLoading}
                                        onClick={async () => {
                                            await handleDelete()
                                        }}
                                    >
                                        {deleteLoading ? "Deleting..." : "Delete Account"}
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