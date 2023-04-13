import { Ref } from 'typesaurus'
import { User } from '@/models/user/model'

export type ChatRoom = {
  user: Ref<User>
  model: string
  maxTokens: number
  temperature: number
  createdAt: string
  updatedAt: string
}
