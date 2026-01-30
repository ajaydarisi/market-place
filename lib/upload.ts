import { createClient } from "@/lib/supabase/client";

export const AVATAR_BUCKET = "avatars";
export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface UploadAvatarResult {
  publicUrl: string;
}

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "File must be a JPEG, PNG, or WebP image.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "File size must be under 2MB.";
  }
  return null;
}

async function getAccessToken(): Promise<string> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");
  return session.access_token;
}

export async function uploadAvatar(
  userId: string,
  file: File
): Promise<UploadAvatarResult> {
  const token = await getAccessToken();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filePath = `${userId}/avatar.${ext}`;

  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${AVATAR_BUCKET}/${filePath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": file.type,
        "x-upsert": "true",
        "cache-control": "3600",
      },
      body: file,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Upload failed" }));
    throw new Error(`Upload failed: ${err.message || err.error}`);
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${AVATAR_BUCKET}/${filePath}?t=${Date.now()}`;
  return { publicUrl };
}

export async function deleteAvatar(userId: string): Promise<void> {
  const token = await getAccessToken();

  const listRes = await fetch(
    `${SUPABASE_URL}/storage/v1/object/list/${AVATAR_BUCKET}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefix: `${userId}/` }),
    }
  );

  if (!listRes.ok) return;
  const files: { name: string }[] = await listRes.json();

  if (files.length > 0) {
    const prefixes = files.map((f) => `${userId}/${f.name}`);
    await fetch(`${SUPABASE_URL}/storage/v1/object/${AVATAR_BUCKET}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefixes }),
    });
  }
}
