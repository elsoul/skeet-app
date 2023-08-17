import { Ref, Timestamp } from '@skeet-framework/firestore'
import { User } from './userModels'
import { VertexExample, VertexMessage } from '@skeet-framework/ai'

// ⚡️ This is a Skeet Framework Sample Models ⚡️
// Define Your Model Types
// CollectionId & DocumentId are custamizable

// CollectionId: VertexChatRoom
// DocumentId: auto
export type VertexChatRoom = {
  userRef: Ref<User>
  title: string
  model: string
  maxTokens: number
  temperature: number
  topP: number
  topK: number
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

// CollectionId: VertexPrompt
// DocumentId: auto
export type VertexPrompt = {
  vertexChatRoomRef: Ref<VertexChatRoom>
  context: string
  examples: VertexExample[]
  messages: VertexMessage[]
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

// CollectionId: auto
// DocumentId: auto
export type VertexChatRoomMessage = {
  vertexChatRoomRef: Ref<VertexChatRoom>
  role: string
  content: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}
