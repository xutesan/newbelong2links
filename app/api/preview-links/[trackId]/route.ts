import { NextResponse } from "next/server";
import { rellApiFetch } from "@/lib/rellApi";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ trackId: string }> }
) {
    try {
        const { trackId } = await params;
        const body = await request.json();

        const data = await rellApiFetch(`/api/previews/${trackId}/links`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("Link creation error:", error);
        return NextResponse.json({ error: "Failed to create link" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ trackId: string }> }
) {
    try {
        const { trackId } = await params;

        const data = await rellApiFetch(`/api/previews/${trackId}`, {
            method: "DELETE",
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error("Delete tracks error:", error);
        return NextResponse.json({ error: "Failed to delete track" }, { status: 500 });
    }
}