import { format } from 'date-fns'
import { collection, set } from 'typesaurus'
import { User } from '@/models'

const collectionName = 'users'

export const addUser = async (
  uid: string,
  username: string,
  email: string,
  iconUrl: string
) => {
  try {
    const users = collection<User>(collectionName)
    const today = format(new Date(), 'yyyy-MM-dd-HH:mm:ss')
    set(users, uid, {
      uid,
      username,
      email,
      iconUrl,
      createdAt: today,
      updatedAt: today,
    })
  } catch (error) {
    throw new Error(`addUser: ${error}`)
  }
}
