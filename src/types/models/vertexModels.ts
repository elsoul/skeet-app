// ⚡️ This is a Skeet Framework Sample Models ⚡️
// Define Your Model Types
// CollectionId & DocumentId are custamizable
import { Timestamp, FieldValue } from '@skeet-framework/firestore'

// CollectionId: VertexChatRoom
// DocumentId: auto
export const VertexChatRoomCN = 'VertexChatRoom'
export type VertexChatRoom = {
  id?: string
  userId: string
  title: string
  context: string
  model: string
  maxTokens: number
  temperature: number
  topP: number
  topK: number
  createdAt?: Timestamp | FieldValue
  updatedAt?: Timestamp | FieldValue
}

// CollectionId: VertexPrompt
// DocumentId: auto
export const VertexExampleCN = 'VertexExample'
export type VertexExample = {
  vertexChatRoomId: string
  examples: VertexExampleInput[]
  createdAt?: Timestamp | FieldValue
  updatedAt?: Timestamp | FieldValue
}

export type VertexExampleInput = {
  input: string
  output: string
}

// CollectionId: VertexChatRoomMessage
// DocumentId: auto
export const VertexChatRoomMessageCN = 'VertexChatRoomMessage'
export type VertexChatRoomMessage = {
  vertexChatRoomId: string
  role: VertexChatRoomMessageRole
  content: string
  createdAt?: Timestamp | FieldValue
  updatedAt?: Timestamp | FieldValue
}

export enum VertexChatRoomMessageRole {
  USER = 'user',
  AI = 'ai',
}
