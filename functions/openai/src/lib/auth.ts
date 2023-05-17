import { auth } from 'firebase-admin'
import { Request } from 'firebase-functions/v2/https'

export const getUserAuth = async (req: Request) => {
  try {
    const token = req.headers.authorization
    if (token == 'undefined' || token == null) throw new Error('Invalid token!')
    const bearer = token.split('Bearer ')[1]
    return await auth().verifyIdToken(bearer)
  } catch (error) {
    throw new Error(`getUserAuth: ${error}`)
  }
}
