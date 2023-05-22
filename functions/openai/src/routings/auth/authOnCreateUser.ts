import { User } from '@/models'
import { addCollectionItem } from '@skeet-framework/firestore'
import functions from 'firebase-functions'
import { authDefaultOption } from '@/routings'
import dotenv from 'dotenv'
dotenv.config()

const region = process.env.REGION || 'europe-west6'

export const authOnCreateUser = functions
  .runWith(authDefaultOption)
  .region(region)
  .auth.user()
  .onCreate(async (user) => {
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
      console.log(`error - ${String(error)}`)
    }
  })
