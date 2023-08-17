import {
  VertexChatRoom,
  VertexExample,
  VertexChatRoomCN,
  UserCN,
  VertexPromptCN,
} from '@/models'
import { createFirestoreDataConverter } from '@/models/converters'
import admin from 'firebase-admin'

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
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }

  console.log({ uid, vertexChatRoomParams })

  const vertexChatRoomConverter = createFirestoreDataConverter<VertexChatRoom>()
  const vertexChatRoomCollection = db
    .collection(`${UserCN}/${vertexChatRoomParams.userId}/${VertexChatRoomCN}`)
    .withConverter(vertexChatRoomConverter)

  const vertexChatRoomDocRef = await vertexChatRoomCollection.add(
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
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }
  const vertexPromptConverter = createFirestoreDataConverter<VertexExample>()
  const vertexPromptCollection = vertexChatRoomDocRef
    .collection(VertexPromptCN)
    .withConverter(vertexPromptConverter)

  await vertexPromptCollection.add(vertexPromptOptions)

  console.log('Seed addVertexMessageSeed added successfully!')
}
