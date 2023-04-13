import { format } from 'date-fns'
import { collection, set } from 'typesaurus'
import { User } from '@/models'

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
