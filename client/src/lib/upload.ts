import { supabase } from './supabase';

const BUCKET = 'recordings';

/** 把口语录音上传到 Supabase Storage，返回可访问的公开 URL */
export async function uploadRecordingFile(file: File): Promise<string> {
  const filePath = `${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from(BUCKET).upload(filePath, file, {
    contentType: file.type,
    cacheControl: '3600',
    upsert: false,
  });
  if (error) {
    throw new Error(error.message);
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}
