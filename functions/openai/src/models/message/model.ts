import { ChatRoom } from '@/models'
import { Ref } from 'typesaurus'

export type Message = {
  chatRoom: Ref<ChatRoom>
  role: string
  content: string
  createdAt: string
  updatedAt: string
}
