import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

const s3 = new S3Client({
    endpoint: process.env.DO_SPACES_ENDPOINT,
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.DO_SPACES_KEY!,
        secretAccessKey: process.env.DO_SPACES_SECRET!,
    },
    forcePathStyle: false,
})

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) return Response.json({ error: "No file" }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `artwork/${Date.now()}-${file.name}`

    await s3.send(new PutObjectCommand({
        Bucket: process.env.DO_SPACES_BUCKET!,
        Key: filename,
        Body: buffer,
        ContentType: file.type,
        ACL: "public-read",
    }))

    const url = `https://${process.env.DO_SPACES_BUCKET}.lon1.digitaloceanspaces.com/${filename}`

    return Response.json({ url })
}