import { rootSpec } from '@/spec'
import { onRequest } from 'firebase-functions/v2/https'

export const root = onRequest(rootSpec, async (req, res) => {
  try {
    res.json({
      status: 'Skeet APP is Running!',
    })
  } catch (error) {
    const errorLog = `root - ${error}`
    console.log(errorLog)
    res.status(400).json({ result: 'root error!' })
  }
})
