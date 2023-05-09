import admin from 'firebase-admin'
import dotenv from 'dotenv'
import { Request } from 'firebase-functions/v2/https'
import {
  createUserChatRoom,
  getUserChatRoomMessages,
  addUserChatRoomMessage,
  root,
  hello,
} from '@/route'

export interface TypedRequestBody<T> extends Request {
  body: T
}

dotenv.config()
admin.initializeApp()

export {
  root,
  hello,
  createUserChatRoom,
  getUserChatRoomMessages,
  addUserChatRoomMessage,
}
