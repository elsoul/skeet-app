import { ChatRoom } from '@/models/chatRoom/model'
import { Ref } from 'typesaurus'

export type Message = {
  chatRoom: Ref<ChatRoom>
  role: string
  content: string
  createdAt: string
  updatedAt: string
}
