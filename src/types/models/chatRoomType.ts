import { Ref } from 'typesaurus'
import { User } from './userType'

export type ChatRoom = {
  user: Ref<User>
  model: string
  maxTokens: number
  temperature: number
  createdAt: string
  updatedAt: string
}
