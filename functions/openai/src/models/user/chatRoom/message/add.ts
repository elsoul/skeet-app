import { format } from 'date-fns'
import { add, collection, ref, subcollection } from 'typesaurus'
import { ChatRoom, Message, User } from '@/models'

const collectionName = 'messages'
const parentCollectionName = 'users'
const parent2CollectionName = 'chatRooms'

export const addMessage = async (
  userId: string,
  chatRoomId: string,
  content: string,
  role = 'user'
) => {
  try {
    const parentCollection = collection<User>(parentCollectionName)
    const parent2Collection = subcollection<ChatRoom, User>(
      parent2CollectionName,
      parentCollection
    )
    const user = ref(parentCollection, userId)
    const messagesCollection = subcollection<Message, ChatRoom, User>(
      collectionName,
      parent2Collection
    )
    const parent2Ref = ref(parent2Collection(user), chatRoomId)
    const message = messagesCollection(ref(parent2Collection(user), chatRoomId))
    const today = format(new Date(), 'yyyy-MM-dd-HH:mm:ss')
    add(message, {
      chatRoom: parent2Ref,
      role,
      content,
      createdAt: today,
      updatedAt: today,
    })
  } catch (error) {
    throw new Error(`addMessage: ${error}`)
  }
}
