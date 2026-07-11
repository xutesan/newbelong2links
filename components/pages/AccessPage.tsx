"use client"

import { useEffect, useState } from "react"
import { Table, Button, Dropdown, Label, Skeleton, EmptyState, AlertDialog } from "@heroui/react"
import { Icon } from "@iconify/react"

interface User {
    id: string
    name: string | null
    email: string
    image: string | null
    role: string
    status: string
    createdAt: string
}

export default function AccessPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
    const [deleting, setDeleting] = useState(false)

    const refetch = () => {
        fetch("/api/users")
            .then(res => res.json())
            .then(data => setUsers(data))
    }

    useEffect(() => {
        fetch("/api/users")
            .then(res => res.json())
            .then(data => {
                setUsers(data)
                setLoading(false)
            })
    }, [])

    async function updateUser(id: string, data: { status?: string, role?: string }) {
        await fetch("/api/users", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, ...data }),
        })
        refetch()
    }

    async function deleteUser(id: string) {
        await fetch("/api/users", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        })
        refetch()
    }

    const pending = users.filter(u => u.status === "pending")
    const approved = users.filter(u => u.status === "approved")

    const SkeletonTable = ({ colWidths }: { colWidths: string[] }) => (
        <div className="w-full rounded-2xl border border-zinc-200 overflow-hidden">
            <div className="bg-surface-secondary px-4 py-3 flex gap-6">
                {colWidths.map((w, i) => (
                    <div key={i} className={w}><Skeleton className="w-16 h-3 rounded" /></div>
                ))}
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-6 border-t border-zinc-100">
                    <div className={colWidths[0]}>
                        <div className="flex items-center gap-2">
                            <Skeleton className="w-7 h-7 rounded-full" />
                            <Skeleton className="w-24 h-4 rounded-lg" />
                        </div>
                    </div>
                    {colWidths.slice(1).map((w, j) => (
                        <div key={j} className={w}><Skeleton className="w-24 h-4 rounded-lg" /></div>
                    ))}
                </div>
            ))}
        </div>
    )

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold">Access</h1>
                <p>Manage user permissions.</p>
            </div>

            <div className="flex flex-col gap-3">
                <h2 className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">
                    Pending Requests {pending.length > 0 &&
                    <span className="ml-2 bg-amber-100 text-amber-600 rounded-full px-2 py-0.5">{pending.length}</span>}
                </h2>
                {loading ? (
                    <SkeletonTable colWidths={["w-64", "w-64", "w-32", "flex-1"]} />
                ) : (
                    <Table>
                        <Table.ScrollContainer className="max-h-[600px] overflow-y-auto">
                            <Table.Content aria-label="Pending requests" className="min-w-[700px]">
                                <Table.Header className="sticky top-0 z-10 bg-surface-secondary">
                                    <Table.Column isRowHeader className="w-64 text-lg text-zinc-600 font-bold">User</Table.Column>
                                    <Table.Column className="w-64 text-lg text-zinc-600 font-bold">Email</Table.Column>
                                    <Table.Column className="w-32 text-lg text-zinc-600 font-bold">Requested</Table.Column>
                                    <Table.Column className="w-1 text-lg text-zinc-600 font-bold">Actions</Table.Column>
                                </Table.Header>
                                <Table.Body
                                    renderEmptyState={() => (
                                        <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                                            <Icon className="size-6 text-muted" icon="gravity-ui:tray" />
                                            <span className="text-sm text-muted">No pending requests.</span>
                                        </EmptyState>
                                    )}
                                >
                                    <Table.Collection items={pending}>
                                        {(user) => (
                                            <Table.Row id={user.id}>
                                                <Table.Cell>
                                                    <div className="flex items-center gap-2">
                                                        {user.image ? (
                                                            <img src={user.image} className="w-7 h-7 rounded-full" alt=""/>
                                                        ) : (
                                                            <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-xs">
                                                                {user.name?.[0]}
                                                            </div>
                                                        )}
                                                        <span className="text-sm font-medium">{user.name}</span>
                                                    </div>
                                                </Table.Cell>
                                                <Table.Cell className="text-sm text-zinc-500">{user.email}</Table.Cell>
                                                <Table.Cell className="text-sm text-zinc-500">{new Date(user.createdAt).toLocaleDateString()}</Table.Cell>
                                                <Table.Cell>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="secondary"
                                                                onClick={() => updateUser(user.id, {status: "approved"})}>
                                                            Approve
                                                        </Button>
                                                        <Button size="sm" variant="danger"
                                                                onClick={() => updateUser(user.id, {status: "denied"})}>
                                                            Deny
                                                        </Button>
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

            <div className="flex flex-col gap-3">
                <h2 className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">Approved Users</h2>
                {loading ? (
                    <SkeletonTable colWidths={["w-64", "w-64", "w-32", "flex-1"]} />
                ) : (
                    <Table>
                        <Table.ScrollContainer className="max-h-[600px] overflow-y-auto">
                            <Table.Content aria-label="Approved users" className="min-w-[700px]">
                                <Table.Header className="sticky top-0 z-10 bg-surface-secondary">
                                    <Table.Column isRowHeader className="w-64 text-lg text-zinc-600 font-bold">User</Table.Column>
                                    <Table.Column className="w-64 text-lg text-zinc-600 font-bold">Email</Table.Column>
                                    <Table.Column className="w-32 text-lg text-zinc-600 font-bold">Role</Table.Column>
                                    <Table.Column className="w-1 text-lg text-zinc-600 font-bold">Actions</Table.Column>
                                </Table.Header>
                                <Table.Body
                                    renderEmptyState={() => (
                                        <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                                            <Icon className="size-6 text-muted" icon="gravity-ui:tray" />
                                            <span className="text-sm text-muted">No approved users.</span>
                                        </EmptyState>
                                    )}
                                >
                                    <Table.Collection items={approved}>
                                        {(user) => (
                                            <Table.Row id={user.id}>
                                                <Table.Cell>
                                                    <div className="flex items-center gap-2">
                                                        {user.image ? (
                                                            <img src={user.image} className="w-7 h-7 rounded-full" alt=""/>
                                                        ) : (
                                                            <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-xs">
                                                                {user.name?.[0]}
                                                            </div>
                                                        )}
                                                        <span className="text-sm font-medium">{user.name}</span>
                                                    </div>
                                                </Table.Cell>
                                                <Table.Cell className="text-sm text-zinc-500">{user.email}</Table.Cell>
                                                <Table.Cell>
                                                    <Dropdown>
                                                        <Button size="sm" variant="secondary">
                                                            {user.role === "admin" ? "Admin" : "User"}
                                                            <Icon icon="lucide:chevron-down"/>
                                                        </Button>
                                                        <Dropdown.Popover>
                                                            <Dropdown.Menu
                                                                onAction={(key) => updateUser(user.id, {role: key as string})}>
                                                                <Dropdown.Item id="admin" textValue="Admin">
                                                                    <Label>Admin</Label>
                                                                </Dropdown.Item>
                                                                <Dropdown.Item id="user" textValue="User">
                                                                    <Label>User</Label>
                                                                </Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown.Popover>
                                                    </Dropdown>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <Button size="sm" variant="danger" onClick={() => setDeleteTarget(user)}>
                                                        Remove
                                                    </Button>
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
                                    <AlertDialog.Heading>Remove User</AlertDialog.Heading>
                                </AlertDialog.Header>
                                <AlertDialog.Body>
                                    <p>
                                        Are you sure you want to remove{" "}
                                        <span className="font-medium text-foreground">{deleteTarget.name || deleteTarget.email}</span>?
                                    </p>
                                    <p className="text-sm text-muted mt-2">
                                        They will lose access immediately. This cannot be undone.
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
                                                await deleteUser(deleteTarget.id)
                                                setDeleteTarget(null)
                                            } catch (e) {
                                                console.error(e)
                                            } finally {
                                                setDeleting(false)
                                            }
                                        }}
                                    >
                                        {deleting ? "Removing..." : "Remove User"}
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