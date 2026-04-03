import express from 'express'
import dotenv from 'dotenv'
import uploadRouter from './routes/upload.js'
import searchRouter from './routes/search.js'

dotenv.config()

const app = express()

app.use(express.json())

// Routes
app.use('/api/upload', uploadRouter)
app.use('/api/search', searchRouter)

// Health check - useful for deployment platforms to know your server is alive
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Global error handler - must have 4 params, Express detects it by signature
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong'
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Gateway running on port ${PORT}`))