import { onRequest } from 'firebase-functions/v2/https'
import { defaultHttpOption } from '@/routings/options'

export const root = onRequest(defaultHttpOption, async (req, res) => {
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
