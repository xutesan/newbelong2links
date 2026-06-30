"use client"

import { useEffect, useState } from "react"
import { Surface, Button, Dropdown, Label, Skeleton } from "@heroui/react"
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

    const SkeletonRows = ({ cols }: { cols: number }) => (
        <>
            {Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-zinc-100">
                    <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                            <Skeleton className="w-7 h-7 rounded-full" />
                            <Skeleton className="w-24 h-4 rounded-lg" />
                        </div>
                    </td>
                    {Array.from({ length: cols - 1 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                            <Skeleton className="w-32 h-4 rounded-lg" />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    )

    return (
        <div className="flex flex-col gap-8">
            <div className="gap-2">
                <h1 className="text-4xl font-bold">Access</h1>
                <p>Manage user permissions.</p>
            </div>

            <div className="flex flex-col gap-3">
                <h2 className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">
                    Pending Requests {pending.length > 0 &&
                    <span className="ml-2 bg-amber-100 text-amber-600 rounded-full px-2 py-0.5">{pending.length}</span>}
                </h2>
                <Surface className="w-full h-fit rounded-3xl overflow-hidden" variant="default">
                    <table className="w-full">
                        <thead className="bg-zinc-100 border-b border-zinc-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest">User</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest">Requested</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <SkeletonRows cols={4}/>
                        ) : pending.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-6 text-center text-sm text-zinc-400">No pending
                                    requests.
                                </td>
                            </tr>
                        ) : (
                            pending.map(user => (
                                <tr key={user.id} className="border-b border-zinc-100">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {user.image ? (
                                                <img src={user.image} className="w-7 h-7 rounded-full" alt=""/>
                                            ) : (
                                                <div
                                                    className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-xs">
                                                    {user.name?.[0]}
                                                </div>
                                            )}
                                            <span className="text-sm font-medium">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-zinc-500">{user.email}</td>
                                    <td className="px-4 py-3 text-sm text-zinc-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
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
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </Surface>
            </div>

            <div className="flex flex-col gap-3">
                <h2 className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">Approved Users</h2>
                <Surface className="w-full h-fit rounded-3xl overflow-hidden" variant="default">
                    <table className="w-full">
                        <thead className="bg-zinc-100 border-b border-zinc-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest">User</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest">Role</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <SkeletonRows cols={4}/>
                        ) : approved.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-6 text-center text-sm text-zinc-400">No approved
                                    users.
                                </td>
                            </tr>
                        ) : (
                            approved.map(user => (
                                <tr key={user.id} className="border-b border-zinc-100">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {user.image ? (
                                                <img src={user.image} className="w-7 h-7 rounded-full" alt=""/>
                                            ) : (
                                                <div
                                                    className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-xs">
                                                    {user.name?.[0]}
                                                </div>
                                            )}
                                            <span className="text-sm font-medium">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-zinc-500">{user.email}</td>
                                    <td className="px-4 py-3">
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
                                    </td>
                                    <td className="px-4 py-3">
                                        <Button size="sm" variant="danger" onClick={() => deleteUser(user.id)}>
                                            Remove
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </Surface>
            </div>
        </div>
    )
}