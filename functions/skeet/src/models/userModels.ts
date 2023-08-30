import { Timestamp, FieldValue } from '@skeet-framework/firestore'

// Define Collection Name
export const UserCN = 'User'
export const UserChatRoomCN = 'UserChatRoom'
export const UserChatRoomMessageCN = 'UserChatRoomMessage'

// CollectionId: User
// DocumentId: auto
// Path: User

export type User = {
  id?: string
  uid: string
  username: string
  email: string
  iconUrl: string
  userChatRoomIds?: string[]
  createdAt?: Timestamp | FieldValue
  updatedAt?: Timestamp | FieldValue
}

// CollectionId: UserChatRoom
// DocumentId: auto
// Path: User/{uid}/UserChatRoom
export type UserChatRoom = {
  id?: string
  title: string
  model: string
  maxTokens: number
  temperature: number
  context: string
  stream: boolean
  createdAt?: Timestamp | FieldValue
  updatedAt?: Timestamp | FieldValue
}

// CollectionId: UserChatRoomMessage
// DocumentId: auto
// Path: User/{uid}/UserChatRoom/{userChatRoomId}/UserChatRoomMessage
export type UserChatRoomMessage = {
  id?: string
  userChatRoomId: string
  role: string
  content: string
  createdAt?: Timestamp | FieldValue
  updatedAt?: Timestamp | FieldValue
}
