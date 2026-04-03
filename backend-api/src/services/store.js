import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const BUCKET = 'grab-pic'

/**
 * Uploads a file buffer to Supabase Storage
 * @param {Buffer} buffer - raw file bytes from multer
 * @param {string} path   - e.g. "events/abc123/photo.jpg"
 * @param {string} mimetype - e.g. "image/jpeg"
 * @returns {string} public URL of the uploaded file
 */
export async function uploadImage(buffer, path, mimetype) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: mimetype,
      upsert: false   // fail if file already exists — prevents silent overwrites
    })

  if (error) throw { status: 500, message: `Storage upload failed: ${error.message}` }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}