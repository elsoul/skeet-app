// ⚡️ This is a Skeet Framework Sample Models ⚡️
// Define Your Model Types
// CollectionId & DocumentId are custamizable
import { Timestamp } from '@skeet-framework/firestore'

// CollectionId: VertexChatRoom
// DocumentId: auto
// Path: User/{uid}/VertexChatRoom
export const VertexChatRoomCN = 'VertexChatRoom'
export type VertexChatRoom = {
  id?: string
  title: string
  context: string
  model: string
  maxTokens: number
  temperature: number
  topP: number
  topK: number
  examples: VertexExampleInput[]
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export type VertexExampleInput = {
  input: string
  output: string
}

// CollectionId: VertexChatRoomMessage
// DocumentId: auto
// Path: User/{uid}/VertexChatRoom/{vertexChatRoomId}/VertexChatRoomMessage
export const VertexChatRoomMessageCN = 'VertexChatRoomMessage'
export type VertexChatRoomMessage = {
  role: VertexChatRoomMessageRole
  content: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export enum VertexChatRoomMessageRole {
  USER = 'user',
  AI = 'ai',
}
