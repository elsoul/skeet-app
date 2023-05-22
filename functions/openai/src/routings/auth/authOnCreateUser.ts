import { User } from '@/models'
import { addCollectionItem } from '@skeet-framework/firestore'
import { auth } from 'firebase-functions/v1'

export const authOnCreateUser = auth.user().onCreate(async (user) => {
  try {
    const { uid, email, displayName, photoURL } = user
    const userParams = {
      uid,
      email: email || '',
      username: displayName || '',
      iconUrl: photoURL || '',
    }
    const userRef = await addCollectionItem<User>('User', userParams, uid)
    console.log({ status: 'success', userRef })
  } catch (error) {
    console.log(`authOnCreateUser - ${String(error)}`)
  }
})
