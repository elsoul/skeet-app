import { format } from 'date-fns'
import { Ref, add, collection, ref, subcollection } from 'typesaurus'
import { User } from '@/models/user'

export type ChatRoom = {
  user: Ref<User>
  model: string
  maxTokens: number
  temperature: number
  createdAt: string
  updatedAt: string
}
export const addChatRoom = async (
  userId: string,
  model: string,
  maxTokens: number,
  temperature: number
) => {
  try {
    const usersCollection = collection<User>('users')
    const chatRoomsCollection = subcollection<ChatRoom, User>(
      'chatRooms',
      usersCollection
    )
    const user = ref(usersCollection, userId)
    const userChatRooms = chatRoomsCollection(user)
    const today = format(new Date(), 'yyyy-MM-dd-HH:mm:ss')
    console.log(today)
    return await add(userChatRooms, {
      user,
      model,
      maxTokens,
      temperature,
      createdAt: today,
      updatedAt: today,
    })
  } catch (error) {
    throw new Error(`addChatRoom: ${error}`)
  }
}
