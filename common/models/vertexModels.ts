// ⚡️ This is a Skeet Framework Sample Models ⚡️
// Define Your Model Types
// CollectionId & DocumentId are custamizable
import { Timestamp, FieldValue } from '@skeet-framework/firestore'
import { UserCN } from './userModels'

// CollectionId: VertexChatRoom
// DocumentId: auto
// Path: User/{uid}/VertexChatRoom
export const VertexChatRoomCN = 'VertexChatRoom'
export const genVertexChatRoomPath = (uid: string) =>
  `${UserCN}/${uid}/${VertexChatRoomCN}`
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
  createdAt?: Timestamp | FieldValue
  updatedAt?: Timestamp | FieldValue
}

export type VertexExampleInput = {
  input: string
  output: string
}

// CollectionId: VertexChatRoomMessage
// DocumentId: auto
// Path: User/{uid}/VertexChatRoom/{vertexChatRoomId}/VertexChatRoomMessage
export const VertexChatRoomMessageCN = 'VertexChatRoomMessage'
export const genVertexChatRoomMessagePath = (
  uid: string,
  vertexChatRoomId: string,
) =>
  `${UserCN}/${uid}/${VertexChatRoomCN}/${vertexChatRoomId}/${VertexChatRoomMessageCN}`
export type VertexChatRoomMessage = {
  role: VertexChatRoomMessageRole
  content: string
  createdAt?: Timestamp | FieldValue
  updatedAt?: Timestamp | FieldValue
}

export enum VertexChatRoomMessageRole {
  USER = 'user',
  AI = 'ai',
}
