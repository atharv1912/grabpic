import multer from 'multer'

// memoryStorage means files live as Buffer in req.file.buffer
// no temp files on disk, clean and fast for our use case
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  
  if (allowed.includes(file.mimetype)) {
    cb(null, true)   // accept the file
  } else {
    cb({ status: 400, message: 'Only JPEG, PNG, and WebP images are allowed' }, false)
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024  // 10MB max
  }
})