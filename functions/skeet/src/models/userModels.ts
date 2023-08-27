import { Timestamp } from '@skeet-framework/firestore'

// Define Collection Name
export const UserCN = 'User'
export const UserChatRoomCN = 'UserChatRoom'
export const UserChatRoomMessageCN = 'UserChatRoomMessage'

// CollectionId: User
// DocumentId: auto
export type User = {
  id?: string
  uid: string
  username: string
  email: string
  iconUrl: string
  userChatRoomIds?: string[]
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

// CollectionId: UserChatRoom
// DocumentId: auto
export type UserChatRoom = {
  id?: string
  title: string
  model: string
  maxTokens: number
  temperature: number
  context: string
  stream: boolean
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

// CollectionId: UserChatRoomMessage
// DocumentId: auto
export type UserChatRoomMessage = {
  id?: string
  userChatRoomId: string
  role: string
  content: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}
