import { NextResponse } from "next/server";
import { rellApiFetch } from "@/lib/rellApi";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ linkId: string }> }
) {
    try {
        const { linkId } = await params;
        const body = await request.json();

        const data = await rellApiFetch(`/api/previews/link-admin/${linkId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error("Link update proxy error:", error); // <-- add this
        return NextResponse.json({ error: "Failed to update link" }, { status: 500 });
    }
}