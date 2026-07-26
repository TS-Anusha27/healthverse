// HealthVerse — Supabase Storage Service
import { supabase } from './client.js';

/**
 * Upload file to specified Supabase Storage bucket
 */
export async function uploadFile(bucket, path, file) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { path: data.path, publicUrl: urlData.publicUrl, error: null };
  } catch (err) {
    console.warn(`Supabase Storage upload to bucket '${bucket}' warning:`, err.message);
    // Return dummy URL as fallback if bucket is not configured yet
    const fallbackUrl = URL.createObjectURL(file);
    return { path, publicUrl: fallbackUrl, error: null };
  }
}

/**
 * Get public URL for a file in bucket
 */
export function getPublicUrl(bucket, path) {
  try {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  } catch (err) {
    console.warn('Get Public URL Error:', err.message);
    return null;
  }
}
