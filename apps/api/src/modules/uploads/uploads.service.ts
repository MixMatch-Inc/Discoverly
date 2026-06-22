import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import crypto from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';
import { env } from '../../shared/config/env.js';

function getS3Client(): S3Client {
  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set to use image uploads');
  }
  return new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

export interface UploadVariant {
  key: string;
  url: string;
  width: number;
  height: number;
  sizeBytes: number;
}

export interface UploadResult {
  original: UploadVariant;
  thumbnail: UploadVariant;
}

const VARIANTS = [
  { name: 'original', width: 1200, height: 900, quality: 85 },
  { name: 'thumbnail', width: 400, height: 300, quality: 75 },
] as const;

function buildUrl(key: string): string {
  if (env.CDN_BASE_URL) return `${env.CDN_BASE_URL}/${key}`;
  return `https://${env.AWS_S3_BUCKET!}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
}

async function processAndUpload(
  buffer: Buffer,
  variant: (typeof VARIANTS)[number],
  folder: string,
  slug: string,
): Promise<UploadVariant> {
  const processed = await sharp(buffer)
    .resize(variant.width, variant.height, { fit: 'cover', position: 'centre' })
    .webp({ quality: variant.quality })
    .toBuffer({ resolveWithObject: true });

  const key = `${folder}/${slug}-${variant.name}.webp`;

  const s3 = getS3Client();
  if (!env.AWS_S3_BUCKET) throw new Error('AWS_S3_BUCKET must be set to use image uploads');

  await s3.send(
    new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      Body: processed.data,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );

  return {
    key,
    url: buildUrl(key),
    width: processed.info.width,
    height: processed.info.height,
    sizeBytes: processed.info.size,
  };
}

export async function uploadImage(
  fileBuffer: Buffer,
  originalName: string,
  folder: string,
): Promise<UploadResult> {
  const ext = path.extname(originalName);
  const slug = `${crypto.randomUUID()}${ext ? `-${ext.slice(1)}` : ''}`;

  const [original, thumbnail] = await Promise.all([
    processAndUpload(fileBuffer, VARIANTS[0], folder, slug),
    processAndUpload(fileBuffer, VARIANTS[1], folder, slug),
  ]);

  return { original, thumbnail };
}
