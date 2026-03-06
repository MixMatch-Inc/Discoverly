import { randomUUID } from "node:crypto"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { env } from "../config/env.js"

function ensureS3Config() {
  if (!env.AWS_REGION || !env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY || !env.AWS_S3_BUCKET) {
    throw new Error("S3 config missing. Set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET.")
  }
}

function getS3Client() {
  ensureS3Config()
  return new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
    },
  })
}

function getPublicUrl(key: string): string {
  if (env.AWS_S3_PUBLIC_BASE_URL) {
    return `${env.AWS_S3_PUBLIC_BASE_URL.replace(/\/$/, "")}/${key}`
  }
  return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`
}

export async function uploadImageToS3(file: Express.Multer.File): Promise<{ url: string; key: string }> {
  const extension = file.originalname.includes(".") ? file.originalname.split(".").pop() : "bin"
  const key = `uploads/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`

  const client = getS3Client()
  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  })

  await client.send(command)

  return {
    url: getPublicUrl(key),
    key,
  }
}
