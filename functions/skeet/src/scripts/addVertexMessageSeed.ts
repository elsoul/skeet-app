import {
  VertexChatRoom,
  VertexExample,
  VertexChatRoomCN,
  UserCN,
  VertexExampleCN,
} from '@/models'
import { add, serverTimestamp } from '@skeet-framework/firestore'
import admin from 'firebase-admin'
import dotenv from 'dotenv'
import { loginSeed } from '@/lib/login'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
dotenv.config()

admin.initializeApp()
const SkeetEnv = process.env.NODE_ENV || 'development'
const db = getFirestore()
if (SkeetEnv === 'development') connectFirestoreEmulator(db, '127.0.0.1', 8080)

export const addVertexMessageSeed = async (
  uid: string,
  db: admin.firestore.Firestore,
) => {
  const vertexChatRoomParams: VertexChatRoom = {
    userId: uid,
    title: 'Test Room',
    context:
      'You are a developer who is knowledgeable about the Skeet framework, a framework for building web applications.',
    model: 'chat-bison@001',
    maxTokens: 256,
    temperature: 0.2,
    topP: 0.95,
    topK: 40,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  console.log({ uid, vertexChatRoomParams })

  const vertexChatRoomPath = `${UserCN}/${uid}/${VertexChatRoomCN}`
  const vertexChatRoomDocRef = await add<VertexChatRoom>(
    db,
    vertexChatRoomPath,
    vertexChatRoomParams,
  )

  const vertexPromptOptions: VertexExample = {
    vertexChatRoomId: vertexChatRoomDocRef.id,
    examples: [
      {
        input:
          'What is the Skeet framework and what benefits does it offer for app development?',
        output:
          'The Skeet framework is an open-source full-stack app development solution that aims to lower the development and operation cost of applications. It allows developers to focus more on the application logic and worry less about infrastructure. The framework can be assembled with a combination of SQL and NoSQL.',
      },
    ],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  const vertexExamplePath = `${vertexChatRoomPath}/${vertexChatRoomDocRef.id}/${VertexExampleCN}`
  await add<VertexExample>(db, vertexExamplePath, vertexPromptOptions)

  console.log('Seed addVertexMessageSeed added successfully!')
}

const run = async () => {
  const { uid } = await loginSeed()
  const db = admin.firestore()
  await addVertexMessageSeed(uid, db)
}

run()