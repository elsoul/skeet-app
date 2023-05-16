import { initializeApp } from 'firebase/app'
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import dotenv from 'dotenv'
import { User } from '@/models'
import firebaseConfig from '@/lib/firebaseConfig'
dotenv.config()

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
