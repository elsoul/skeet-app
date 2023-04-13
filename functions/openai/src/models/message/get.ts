import { collection, get, order, query, ref, subcollection } from 'typesaurus'
import { ChatRoom, Message, User } from '@/models'
import { CreateChatCompletionRequest } from 'openai'

const collectionName = 'messages'
const parentCollectionName = 'users'
const parent2CollectionName = 'chatRooms'

export const getMessages = async (userId: string, chatRoomId: string) => {
  try {
    const usersCollection = collection<User>(parentCollectionName)
    const chatRoomsCollection = subcollection<ChatRoom, User>(
      parent2CollectionName,
      usersCollection
    )
    const user = ref(usersCollection, userId)
    const messagesCollection = subcollection<Message, ChatRoom, User>(
      collectionName,
      chatRoomsCollection
    )
    const userChatRooms = ref(chatRoomsCollection(user), chatRoomId)

    const messages = await query(messagesCollection(userChatRooms), [
      order('createdAt', 'asc'),
    ])
    return messages
  } catch (error) {
    throw new Error(`getMessages: ${error}`)
  }
}

export const getRoomMessages = async (userId: string, chatRoomId: string) => {
  try {
    const usersCollection = collection<User>(parentCollectionName)
    const chatRoomsCollection = subcollection<ChatRoom, User>(
      parent2CollectionName,
      usersCollection
    )
    const user = ref(usersCollection, userId)
    const messagesCollection = subcollection<Message, ChatRoom, User>(
      collectionName,
      chatRoomsCollection
    )
    const userChatRooms = ref(chatRoomsCollection(user), chatRoomId)

    const chatRoomData = await get(userChatRooms)
    if (!chatRoomData) throw new Error('Chat room not found!')
    const messagesDocs = await query(messagesCollection(userChatRooms), [
      order('createdAt', 'asc'),
    ])
    const messageArray = []
    for await (const message of messagesDocs) {
      const messageData = await get(message.ref)
      if (!messageData) throw new Error('Message not found!')
      messageArray.push({
        role: messageData.data.role,
        content: messageData.data.content,
      })
    }

    const chatRoomWithMessages = {
      model: chatRoomData.data.model,
      max_tokens: chatRoomData.data.maxTokens,
      temperature: chatRoomData.data.temperature,
      top_p: 1,
      n: 1,
      stream: false,
      messages: messageArray,
    }

    return chatRoomWithMessages as CreateChatCompletionRequest
  } catch (error) {
    throw new Error(`getRoomMessages: ${error}`)
  }
}
