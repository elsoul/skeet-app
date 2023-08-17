import { onRequest } from 'firebase-functions/v2/https'
import { publicHttpOption } from '@/routings/options'
import { addVertexMessageSeed } from '@/scripts/addVertexMessageSeed'
import { db } from '@/index'
import { SeedParams } from '@/types/http'

export const seed = onRequest(publicHttpOption, async (req, res) => {
  if (process.env.NODE_ENV !== 'development')
    throw new Error('This endpoint is only available in development mode.')

  // Use type assertion for req.query
  const query = req.query as SeedParams

  try {
    const uid = query.uid || 'YLwXr3HZ4JLsNZKSNN4n7wA1pPQu'
    await addVertexMessageSeed(uid, db)
    res.json({
      status: 'success',
      message: 'Skeet Backend is running!',
      uid,
    })
  } catch (error) {
    res.status(500).json({ status: 'error', message: String(error) })
  }
})
