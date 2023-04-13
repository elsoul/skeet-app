import { format } from 'date-fns'
import { add, collection, ref, subcollection } from 'typesaurus'
import { ChatRoom, Message, User } from '@/models'

export const addMessage = async (
  userId: string,
  chatRoomId: string,
  content: string,
  role = 'user'
) => {
  try {
    const usersCollection = collection<User>('users')
    const chatRoomsCollection = subcollection<ChatRoom, User>(
      'chatRooms',
      usersCollection
    )
    const user = ref(usersCollection, userId)
    const messagesCollection = subcollection<Message, ChatRoom, User>(
      'messages',
      chatRoomsCollection
    )
    const userChatRooms = ref(chatRoomsCollection(user), chatRoomId)
    const message = messagesCollection(
      ref(chatRoomsCollection(user), chatRoomId)
    )
    const today = format(new Date(), 'yyyy-MM-dd-HH:mm:ss')
    add(message, {
      chatRoom: userChatRooms,
      role,
      content,
      createdAt: today,
      updatedAt: today,
    })
  } catch (error) {
    throw new Error(`addMessage: ${error}`)
  }
}
