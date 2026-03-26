import path from 'path'
import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { connectDB } from './config/db.js'
import { errorHandler, notFound } from './middleware/errorMiddleware.js'
import authRoutes from './routes/authRoutes.js'
import charityRoutes from './routes/charityRoutes.js'
import userRoutes from './routes/userRoutes.js'
import subscriptionRoutes from './routes/subscriptionRoutes.js'
import drawRoutes from './routes/drawRoutes.js'
import winnerRoutes from './routes/winnerRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()

app.use(express.json())
app.use(cookieParser())

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  }),
)

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api/charities', charityRoutes)
app.use('/api/user', userRoutes)
app.use('/api/subscription', subscriptionRoutes)
app.use('/api/draws', drawRoutes)
app.use('/api/winners', winnerRoutes)
app.use('/api/admin', adminRoutes)

app.use(notFound)
app.use(errorHandler)

const port = process.env.PORT || 5000

connectDB()
  .then((result) => {
    if (!result.connected) {
      // eslint-disable-next-line no-console
      console.warn(`[server] MongoDB not connected (${result.reason}); using memory store`)
    } else {
      // eslint-disable-next-line no-console
      console.log('[server] MongoDB connected')
    }

    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`[server] listening on port ${port}`)
    })
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[server] failed to start', err)
    process.exit(1)
  })
