const RELL_API = process.env.RELL_API!;
const RELL_SECRET_KEY = process.env.RELL_SECRET_KEY!;

export async function rellApiFetch(path: string, options: RequestInit = {}) {
    const res = await fetch(`${RELL_API}${path}`, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${RELL_SECRET_KEY}`,
        },
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Rell API error: ${res.status}`);
    }

    return res.json();
}