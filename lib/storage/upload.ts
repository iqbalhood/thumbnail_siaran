import { supabase } from '@/lib/supabase/client';

/**
 * Uploads a file to a Supabase storage bucket and returns the public URL.
 * 
 * @param bucket - The name of the bucket (logos, presenters, speakers)
 * @param path - The internal path/filename
 * @param file - The file object to upload
 * @returns Object containing the public URL and the storage path
 */
export async function uploadFile(
  bucket: 'logos' | 'presenters' | 'speakers',
  path: string,
  file: File
) {
  // 1. Upload the file
  const { data, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: true,
      cacheControl: '3600',
    });

  if (uploadError) {
    throw uploadError;
  }

  // 2. Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return {
    publicUrl,
    storagePath: data.path,
  };
}

/**
 * Deletes a file from a Supabase storage bucket.
 * 
 * @param bucket - The name of the bucket
 * @param path - The internal path/filename to delete
 */
export async function deleteFile(
  bucket: 'logos' | 'presenters' | 'speakers',
  path: string
) {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    console.error(`Error deleting file from ${bucket}/${path}:`, error.message);
  }
}
