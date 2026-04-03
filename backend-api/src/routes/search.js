import { Router } from 'express'
import { upload } from '../middleware/multer.js'
import { uploadImage } from '../services/storage.js'
import { pushJob } from '../services/queue.js'
import crypto from 'crypto'

const router = Router()

// POST /api/search
// Body: multipart/form-data with field "selfie" + "user_id" + optional "event_id"
router.post('/',requireAuth, upload.single('selfie'), async (req, res, next) => {
  try {
    const { user_id, event_id } = req.body

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' })
    }

    if (!req.file) {
      return res.status(400).json({ error: 'selfie is required' })
    }

    // Store in a separate folder — these are temp search files, not event photos
    const uniqueId = crypto.randomBytes(3).toString('hex')
    const ext = req.file.originalname.split('.').pop()
    const storagePath = `selfies/${user_id}/${Date.now()}-${uniqueId}.${ext}`

    // 1. Save selfie to Supabase Storage
    const selfieUrl = await uploadImage(req.file.buffer, storagePath, req.file.mimetype)

    // 2. Push job — worker will generate embedding from selfie and search
    const messageId = await pushJob({
      type: 'search',
      selfie_url: selfieUrl,
      user_id,
      event_id   // optional — null means search across all events
    })

    res.status(202).json({
      message: 'Selfie received, searching for your photos',
      job_id: messageId   // user polls this to get results later
    })

  } catch (err) {
    next(err)
  }
})

export default router