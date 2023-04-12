import { format } from 'date-fns'
import { auth } from 'firebase-admin'
import { Request } from 'firebase-functions/v2/https'
import { collection, set } from 'typesaurus'

export type User = {
  uid: string
  username: string
  email: string
  iconUrl: string
  createdAt: string
  updatedAt: string
}

export const getUser = async (req: Request) => {
  try {
    const token = req.headers.authorization
    if (token == 'undefined' || token == null) throw new Error('Invalid token!')
    const bearer = token.split('Bearer ')[1]
    return await auth().verifyIdToken(bearer)
  } catch (error) {
    throw new Error(`getUser: ${error}`)
  }
}

export const addUser = async (
  uid: string,
  username: string,
  email: string,
  iconUrl: string
) => {
  const users = collection<User>('users')
  const today = format(new Date(), 'yyyy-MM-dd-HH:mm:ss')
  set(users, uid, {
    uid,
    username,
    email,
    iconUrl,
    createdAt: today,
    updatedAt: today,
  })
}
