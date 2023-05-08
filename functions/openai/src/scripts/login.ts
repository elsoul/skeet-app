import { initializeApp } from 'firebase/app'
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import dotenv from 'dotenv'
import { User } from '@/models'
dotenv.config()

const apiKey = process.env.API_KEY_DEV || ''
const authDomain = process.env.AUTH_DOMAIN_DEV || ''
const projectId = process.env.PROJECT_ID_DEV || ''
const storageBucket = process.env.STORAGE_BUCKET_DEV || ''
const messagingSenderId = process.env.MESSAGING_SENDER_ID_DEV || ''
const appId = process.env.APP_ID_DEV || ''
const measurementId = process.env.MEASUREMENT_ID_DEV || ''

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId,
}
const firebaseApp = initializeApp(firebaseConfig)
const auth = getAuth(firebaseApp)
const SkeetEnv = process.env.NODE_ENV || 'development'
if (SkeetEnv === 'development')
  connectAuthEmulator(auth, 'http://127.0.0.1:9099')

const email = 'elsoul-labo@example.com'
const password = 'password'

export const loginSeed = async () => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  )
  const user = userCredential.user
  const loginUserCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  )
  const loginUser = loginUserCredential.user
  console.log(loginUser)
  const fbUser: User = {
    uid: user.uid,
    username: user.displayName || '',
    email: user.email || '',
    iconUrl: user.photoURL || '',
  }
  return fbUser
}

const run = async () => {
  const fbUser = await loginSeed()
  console.log(`Created User: ${JSON.stringify(fbUser)}`)
}

run()
