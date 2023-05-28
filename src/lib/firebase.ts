import firebaseConfig from '@lib/firebaseConfig'
import { getAnalytics } from 'firebase/analytics'
import { initializeApp, getApp, getApps } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

export const firebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp()

const getFirebaseAuth = () => {
  const auth = getAuth(firebaseApp)
  if (process.env.NODE_ENV !== 'production') {
    connectAuthEmulator(auth, 'http://localhost:9099', {
      disableWarnings: true,
    })
  }
  return auth
}

export const firebaseAuth = firebaseApp ? getFirebaseAuth() : undefined

const getFirebaseStorage = () => {
  const storage = getStorage(firebaseApp)
  if (process.env.NODE_ENV !== 'production') {
    connectStorageEmulator(storage, 'http://localhost', 9199)
  }
  return storage
}

export const firebaseStorage = firebaseApp ? getFirebaseStorage() : undefined

const getFirebaseFirestore = () => {
  const firestore = getFirestore(firebaseApp)
  if (process.env.NODE_ENV !== 'production') {
    connectFirestoreEmulator(firestore, 'http://localhost', 8080)
  }
  return firestore
}

export const firebaseFirestore = firebaseApp
  ? getFirebaseFirestore()
  : undefined

export const analytics =
  typeof window !== 'undefined' &&
  process.env.NODE_ENV === 'production' &&
  firebaseApp
    ? getAnalytics(firebaseApp)
    : undefined
