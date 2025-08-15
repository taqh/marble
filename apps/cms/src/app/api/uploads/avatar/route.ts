import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { db } from "@marble/db";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { generateSlug } from "@/utils/string";
import { ALLOWED_MIME_TYPES } from "@/lib/constants";

const ACCESS_KEY_ID = process.env.CLOUDFLARE_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.CLOUDFLARE_BUCKET_NAME;
const ENDPOINT = process.env.CLOUDFLARE_S3_ENDPOINT;
const PUBLIC_URL = process.env.CLOUDFLARE_PUBLIC_URL;

if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !BUCKET_NAME || !ENDPOINT) {
  throw new Error("Missing Cloudflare R2 environment variables");
}

const bucketName = BUCKET_NAME;
const endpoint = ENDPOINT;
const publicUrl = PUBLIC_URL;

const s3Client = new S3Client({
  region: "auto",
  endpoint,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

export async function POST(request: Request) {
  const sessionInfo = await getServerSession();
  if (!sessionInfo) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = sessionInfo.session.userId;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "File is required." }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      {
        error: `File type ${
          file.type
        } is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
      },
      { status: 400 },
    );
  }

  try {
    const id = nanoid(6);
    const filenameParts = file.name.split(".");
    const extension = filenameParts.pop();
    const baseName = filenameParts.join(".");

    const sluggedName = generateSlug(baseName);
    const sluggedId = id.toLocaleLowerCase();
    const key = `user-avatars/${sluggedName}-${sluggedId}.${extension}`;

    const parallelUploads = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: key,
        Body: file,
        ContentType: file.type,
      },
    });

    await parallelUploads.done();

    const url = `${publicUrl}/${key}`;

    await db.user.update({
      where: { id: userId },
      data: { image: url },
    });

    return NextResponse.json({ avatarUrl: url });
  } catch (error) {
    console.error("Error uploading profile image to R2:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to upload profile image";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
