import firebaseConfig from '@lib/firebaseConfig'
import { getAnalytics } from 'firebase/analytics'
import { initializeApp, getApp, getApps } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { Platform } from 'react-native'

export const firebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp()

const getFirebaseAuth = () => {
  const firebaseAuth = getAuth(firebaseApp)
  if (process.env.NODE_ENV !== 'production' && Platform.OS === 'web') {
    connectAuthEmulator(firebaseAuth, 'http://127.0.0.1:9099', {
      disableWarnings: true,
    })
  }
  if (process.env.NODE_ENV !== 'production' && Platform.OS === 'android') {
    connectAuthEmulator(firebaseAuth, 'http://10.0.2.2:9099', {
      disableWarnings: true,
    })
  }
  if (process.env.NODE_ENV !== 'production' && Platform.OS === 'ios') {
    connectAuthEmulator(firebaseAuth, 'http://0.0.0.0:9099', {
      disableWarnings: true,
    })
  }
  return firebaseAuth
}

export const auth = firebaseApp ? getFirebaseAuth() : undefined

const getFirebaseStorage = () => {
  const firebaseStorage = getStorage(firebaseApp)
  if (process.env.NODE_ENV !== 'production' && Platform.OS === 'web') {
    connectStorageEmulator(firebaseStorage, '127.0.0.1', 9199)
  }
  if (process.env.NODE_ENV !== 'production' && Platform.OS === 'android') {
    connectStorageEmulator(firebaseStorage, '10.0.2.2', 9199)
  }
  if (process.env.NODE_ENV !== 'production' && Platform.OS === 'ios') {
    connectStorageEmulator(firebaseStorage, '0.0.0.0', 9199)
  }
  return firebaseStorage
}

export const storage = firebaseApp ? getFirebaseStorage() : undefined

const getFirebaseFirestore = () => {
  const firestoreDb = getFirestore(firebaseApp)
  if (process.env.NODE_ENV !== 'production' && Platform.OS === 'web') {
    connectFirestoreEmulator(firestoreDb, '127.0.0.1', 8080)
  }
  if (process.env.NODE_ENV !== 'production' && Platform.OS === 'android') {
    connectFirestoreEmulator(firestoreDb, '10.0.2.2', 8080)
  }
  if (process.env.NODE_ENV !== 'production' && Platform.OS === 'ios') {
    connectFirestoreEmulator(firestoreDb, '0.0.0.0', 8080)
  }
  return firestoreDb
}

export const db = firebaseApp ? getFirebaseFirestore() : undefined

export const analytics =
  typeof window !== 'undefined' &&
  process.env.NODE_ENV === 'production' &&
  firebaseApp
    ? getAnalytics(firebaseApp)
    : undefined
