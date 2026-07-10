import { NextResponse } from "next/server";
import { rellApiFetch } from "@/lib/rellApi";

export async function GET() {
    try {
        const data = await rellApiFetch("/api/previews");
        return NextResponse.json(data);
    } catch (error) {
        console.error("Fetch tracks error:", error);
        return NextResponse.json({ error: "Failed to load tracks" }, { status: 500 });
    }
}