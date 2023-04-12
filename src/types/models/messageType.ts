import { Ref } from 'typesaurus'
import { ChatRoom } from './chatRoomType'
export type Message = {
  chatRoom: Ref<ChatRoom>
  role: string
  content: string
  createdAt: string
  updatedAt: string
}
