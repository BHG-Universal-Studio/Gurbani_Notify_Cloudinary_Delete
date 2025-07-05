import { Hono } from 'hono'
import { env } from 'hono/adapter'
import cloudinary from 'cloudinary'

const app = new Hono()

app.post('/', async (c) => {
  const body = await c.req.json()
  const publicId = body.public_id
  if (!publicId) return c.json({ success: false, error: 'Missing public_id' }, 400)

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = env<{ CLOUDINARY_CLOUD_NAME: string, CLOUDINARY_API_KEY: string, CLOUDINARY_API_SECRET: string }>(c)

  cloudinary.v2.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
  })

  try {
    const result = await cloudinary.v2.uploader.destroy(publicId)
    return c.json({ success: true, result })
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500)
  }
})

export default app
