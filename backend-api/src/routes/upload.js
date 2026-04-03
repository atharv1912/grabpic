import { Router } from 'express'
import { upload } from '../middleware/multer.js'
import { uploadImage } from '../services/storage.js'
import { pushJob } from '../services/queue.js'
import crypto from 'crypto'

const router = Router()

// POST /api/upload
// Body: multipart/form-data with field "photo" + field "event_id"
router.post('/',requireAuth, upload.single('photo'), async (req, res, next) => {
  try {
    const { event_id } = req.body

    if (!event_id) {
      return res.status(400).json({ error: 'event_id is required' })
    }

    if (!req.file) {
      return res.status(400).json({ error: 'photo is required' })
    }

    // Build a unique path so files never collide in storage
    // events/abc123/1701234567-a3f9b2.jpg
    const uniqueId = crypto.randomBytes(3).toString('hex')
    const ext = req.file.originalname.split('.').pop()
    const storagePath = `events/${event_id}/${Date.now()}-${uniqueId}.${ext}`

    // 1. Save to Supabase Storage
    const imageUrl = await uploadImage(req.file.buffer, storagePath, req.file.mimetype)

    // 2. Push job to QStash → Python worker will process this
    const messageId = await pushJob({
      type: 'index',
      image_url: imageUrl,
      event_id
    })

    // 3. Return immediately — don't wait for the worker
    res.status(202).json({
      message: 'Photo uploaded and queued for processing',
      job_id: messageId,
      image_url: imageUrl
    })

  } catch (err) {
    next(err)   // passes to global error handler in app.js
  }
})

export default router