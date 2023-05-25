import firebaseConfig from '@lib/firebaseConfig'
import { getAnalytics } from 'firebase/analytics'
import { initializeApp, getApp, getApps } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'

export const firebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp()

const getFirebaseAuth = () => {
  const auth = getAuth(firebaseApp)
  if (process.env.NODE_ENV !== 'production') {
    connectAuthEmulator(auth, 'http://localhost:9099')
  }
  return auth
}

export const firebaseAuth = firebaseApp ? getFirebaseAuth() : undefined

export const analytics =
  typeof window !== 'undefined' &&
  process.env.NODE_ENV === 'production' &&
  firebaseApp
    ? getAnalytics(firebaseApp)
    : undefined
