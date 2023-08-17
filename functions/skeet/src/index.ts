import admin from 'firebase-admin'
import dotenv from 'dotenv'

dotenv.config()
admin.initializeApp()
export const db = admin.firestore()

export {
  seed,
  authOnCreateUser,
  createUserChatRoom,
  getUserChatRoomMessages,
  addUserChatRoomMessage,
  addStreamUserChatRoomMessage,
  addVertexMessage,
} from '@/routings'
