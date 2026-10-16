
import { supabase } from '$lib/supabase';

function extensionForType(type) {
    type = type.split(';')[0].trim().toLowerCase();
  if (type === 'image/webp') return 'webp';
  if (type === 'image/png') return 'png';
  if (type === 'image/jpeg') return 'jpg';
  if (type === 'audio/webm') return 'webm';
  if (type === 'audio/mp4') return 'm4a';
  if (type === 'audio/ogg') return 'ogg';

  throw new Error(`Unsupported diary media type: ${type}`);
}

export async function uploadDiaryMedia(userId, diaryId, dataUrl) {
  if (!dataUrl?.startsWith('data:')) {
    return dataUrl || null;
  }

  const response = await fetch(dataUrl);
  const blob = await response.blob();

  if (blob.size > 20 * 1024 * 1024) {
    throw new Error('Diary media must be under 20 MB per file.');
  }

  const extension = extensionForType(blob.type);

  const fileId = crypto.randomUUID();

  const path = `${userId}/${diaryId}/${fileId}.${extension}`;

  const { error } = await supabase.storage
    .from('diary-media')
    .upload(path, blob, {
      contentType: blob.type,
      upsert: false
    });

  if (error) {
    throw new Error(`Media upload failed: ${error.message}`);
  }

  return path;
}

export async function getDiaryMediaUrl(path) {
  if (!path) return '';

  const { data, error } = await supabase.storage
    .from('diary-media')
    .createSignedUrl(path, 60 * 60);

  if (error) throw new Error(error.message);

  return data.signedUrl;
}
