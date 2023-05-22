import { onRequest } from 'firebase-functions/v2/https'
import { defaultHttpOption } from '@/routings/options'
import { TypedRequestBody } from '@/index'
import { RootParams } from '@/types/http/rootParams'

export const root = onRequest(
  defaultHttpOption,
  async (req: TypedRequestBody<RootParams>, res) => {
    try {
      const body = req.body
      res.json({
        status: 'success',
        message: 'Skeet Backend is running!',
        body,
      })
    } catch (error) {
      res.status(500).json({ status: 'error', message: String(error) })
    }
  }
)
