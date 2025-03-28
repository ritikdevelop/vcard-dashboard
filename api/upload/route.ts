import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import crypto from "crypto"

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { filename, contentType } = await request.json()

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Filename and content type are required" }, { status: 400 })
    }

    // Generate a unique key for the file
    const fileExtension = filename.split(".").pop()
    const randomId = crypto.randomBytes(16).toString("hex")
    const key = `uploads/${session.user.id}/${randomId}.${fileExtension}`

    // Create a presigned URL for uploading
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
      ContentType: contentType,
    })

    const presignedUrl = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 3600, // URL expires in 1 hour
    })

    // Return the presigned URL and the file URL
    return NextResponse.json({
      uploadUrl: presignedUrl,
      fileUrl: `${process.env.NEXT_PUBLIC_S3_URL}/${key}`,
    })
  } catch (error) {
    console.error("Error generating presigned URL:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

