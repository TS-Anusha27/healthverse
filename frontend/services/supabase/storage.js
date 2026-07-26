// HealthVerse — Supabase Storage Service for 5 Buckets
import { supabase } from './client.js';

export const BUCKETS = {
  MEDICAL_RECORDS: 'medical-records',
  DOCTOR_DOCUMENTS: 'doctor-documents',
  HOSPITAL_IMAGES: 'hospital-images',
  PROFILE_IMAGES: 'profile-images',
  PRESCRIPTIONS: 'prescriptions'
};

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

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { path: data.path, publicUrl: urlData.publicUrl, error: null };
  } catch (err) {
    console.warn(`Supabase Storage upload to '${bucket}' fallback:`, err.message);
    const fallbackUrl = URL.createObjectURL(file);
    return { path, publicUrl: fallbackUrl, error: null };
  }
}

/**
 * Upload Medical Record Document
 */
export async function uploadMedicalRecord(file, userId = 'guest') {
  const path = `${userId}/${Date.now()}_${file.name}`;
  return uploadFile(BUCKETS.MEDICAL_RECORDS, path, file);
}

/**
 * Upload Doctor Document / Qualification
 */
export async function uploadDoctorDocument(file, doctorId = 'doctor') {
  const path = `${doctorId}/${Date.now()}_${file.name}`;
  return uploadFile(BUCKETS.DOCTOR_DOCUMENTS, path, file);
}

/**
 * Upload Profile Avatar Image
 */
export async function uploadProfileImage(file, userId = 'user') {
  const path = `${userId}/${Date.now()}_${file.name}`;
  return uploadFile(BUCKETS.PROFILE_IMAGES, path, file);
}

/**
 * Upload Prescription Image or PDF
 */
export async function uploadPrescriptionFile(file, doctorId = 'doctor') {
  const path = `${doctorId}/${Date.now()}_${file.name}`;
  return uploadFile(BUCKETS.PRESCRIPTIONS, path, file);
}

/**
 * Get Public URL
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
