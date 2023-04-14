import { ChatRoom } from '@/models'
import { get, remove } from 'typesaurus'
import { collection, ref } from 'typesaurus'
import { User } from '@/models'

const collectionName = 'chatRooms'
const parentCollectionName = 'users'

export const deleteChatRoom = async (chatRoomId: string) => {
  try {
    if (!chatRoomId) {
      throw new Error('chatRoomId is empty')
    }

    const chatRoomsCollection = collection<ChatRoom>(collectionName)
    const parentCollection = collection<User>(parentCollectionName)

    const chatRoomDoc = await get(chatRoomsCollection, chatRoomId)
    if (!chatRoomDoc || !chatRoomDoc.data) {
      throw new Error(`ChatRoom with id ${chatRoomId} not found`)
    }

    const { user } = chatRoomDoc.data
    const parentRef = ref(parentCollection, user.id)

    await remove(chatRoomsCollection, chatRoomId)
    return parentRef
  } catch (error) {
    throw new Error(`deleteChatRoom: ${error}`)
  }
}
