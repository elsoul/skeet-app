import {
  limit,
  order,
  queryGrandChildCollectionItem,
} from '@skeet-framework/firestore'
import {
  User,
  UserChatRoom,
  UserChatRoomMessage,
  userChatRoomCollectionName,
  userChatRoomMessageCollectionName,
  userCollectionName,
} from '@/models'
import { ChatCompletionRequestMessage } from 'openai'

export const getMessages = async (userId: string, userChatRoomId: string) => {
  try {
    const userChatRoomMessages = await queryGrandChildCollectionItem<
      UserChatRoomMessage,
      UserChatRoom,
      User
    >(
      userCollectionName,
      userChatRoomCollectionName,
      userChatRoomMessageCollectionName,
      userId,
      userChatRoomId,
      [order('createdAt', 'asc'), limit(5)]
    )
    const messages = []
    for await (const message of userChatRoomMessages) {
      messages.push({
        role: message.data.role,
        content: message.data.content,
      } as ChatCompletionRequestMessage)
    }
    return messages
  } catch (error) {
    throw new Error(`getUserChatRoomMessages: ${error}`)
  }
}
