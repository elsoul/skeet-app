import { ChatRoom } from '@/models'
import { get, collection, subcollection, ref } from 'typesaurus'
import { User } from '@/models/user'

const collectionName = 'chatRooms'
const parentCollectionName = 'users'

export const getChatRoom = async (
  parentId: string,
  chatRoomId: string
): Promise<ChatRoom | null> => {
  try {
    const parentCollection = collection<User>(parentCollectionName)
    const chatRoomsCollection = subcollection<ChatRoom, User>(
      collectionName,
      parentCollection
    )
    const parentRef = ref(parentCollection, parentId)
    const chatRoomRef = ref(chatRoomsCollection(parentRef), chatRoomId)
    const chatRoomDoc = await get(chatRoomRef)
    if (!chatRoomDoc || chatRoomDoc.data === undefined) {
      throw new Error(`ChatRoom with id ${chatRoomId} not found`)
    }
    return {
      id: chatRoomDoc.ref.id,
      ...chatRoomDoc.data,
    } as ChatRoom
  } catch (error) {
    throw new Error(`getChatRoom: ${error}`)
  }
}
