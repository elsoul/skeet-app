export * from './addVertexMessageParams'
export * from './addStreamUserChatRoomMessageParams'
export * from './addUserChatRoomMessageParams'
export * from './createUserChatRoomParams'
export * from './addVertexMessageParams'
export * from './seedParams'
import { Request } from 'firebase-functions/v2/https'

export interface TypedRequestBody<T> extends Request {
  body: T
}
