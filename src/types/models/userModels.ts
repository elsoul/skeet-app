import { Ref } from '@skeet-framework/firestore'
import { Timestamp } from '@google-cloud/firestore'

// CollectionId: User
// DocumentId: uid
export type User = {
  uid: string
  username: string
  email: string
  iconUrl: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

// CollectionId: UserChatRoom
// DocumentId: auto
export type UserChatRoom = {
  userRef: Ref<User>
  model: string
  maxTokens: number
  temperature: number
  stream: boolean
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

// CollectionId: UserChatRoomMessage
// DocumentId: auto
export type UserChatRoomMessage = {
  userChatRoomRef: Ref<UserChatRoom>
  role: string
  content: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}
