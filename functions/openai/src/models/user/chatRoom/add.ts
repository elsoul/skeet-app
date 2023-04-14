import { format } from 'date-fns'
import { add, collection, ref, subcollection } from 'typesaurus'
import { User } from '@/models/user'
import { ChatRoom } from '@/models'

const collectionName = 'chatRooms'
const parentCollectionName = 'users'

export const addChatRoom = async (
  parentId: string,
  model: string,
  maxTokens: number,
  temperature: number
) => {
  try {
    const parentCollection = collection<User>(parentCollectionName)
    const chatRoomsCollection = subcollection<ChatRoom, User>(
      collectionName,
      parentCollection
    )
    const parentRef = ref(parentCollection, parentId)
    const parentChatRooms = chatRoomsCollection(parentRef)
    const today = format(new Date(), 'yyyy-MM-dd-HH:mm:ss')
    return await add(parentChatRooms, {
      user: parentRef,
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
