"use client";

import { createClient } from "@/lib/supabase/client";

const MAX_IMAGES = 5;
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB per image
const BUCKET = "kudo-images";

/**
 * Upload up to 5 images to the kudo-images storage bucket.
 * Returns an array of public URLs. Throws on auth failure or upload error.
 * Call this client-side before invoking the createKudo server action.
 */
export async function uploadKudoImages(files: File[]): Promise<string[]> {
  if (files.length > MAX_IMAGES) {
    throw new Error(`Cannot upload more than ${MAX_IMAGES} images`);
  }
  // Defense-in-depth beyond the <input accept="image/*">: reject non-images
  // and oversized files before they reach Storage.
  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      throw new Error(`${file.name} is not an image`);
    }
    if (file.size > MAX_BYTES) {
      throw new Error(`${file.name} exceeds the 5 MB limit`);
    }
  }

  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Not authenticated");

  const urls: string[] = [];

  for (const file of files.slice(0, MAX_IMAGES)) {
    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: false });

    if (uploadError) {
      throw new Error(`Upload failed for ${file.name}: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return urls;
}
