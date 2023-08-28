export * from './addVertexMessageParams'
export * from './addStreamUserChatRoomMessageParams'
export * from './addUserChatRoomMessageParams'
export * from './createUserChatRoomParams'
export * from './addVertexMessageParams'
import { Request } from 'firebase-functions/v2/https'

export interface TypedRequestBody<T> extends Request {
  body: T
}
