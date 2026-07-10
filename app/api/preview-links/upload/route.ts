import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        const res = await fetch(`${process.env.RELL_API}/api/previews/upload`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.RELL_SECRET_KEY}`,
            },
            body: formData,
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            return NextResponse.json({ error: body.error || "Upload failed" }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("Upload proxy error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}