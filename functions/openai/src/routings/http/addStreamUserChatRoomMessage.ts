import { onRequest } from 'firebase-functions/v2/https'
import { User, UserChatRoom, UserChatRoomMessage } from '@/models'
import { order } from 'typesaurus'
import {
  ChatCompletionRequestMessage,
  CreateChatCompletionRequest,
} from 'openai'
import { streamChat } from '@/lib/openai/openAi'
import { TypedRequestBody } from '@/index'
import {
  addGrandChildCollectionItem,
  getChildCollectionItem,
  queryGrandChildCollectionItem,
} from '@skeet-framework/firestore'
import { getUserAuth } from '@/lib/getUserAuth'
import { publicHttpOption } from '@/routings'
import { AddStreamUserChatRoomMessageParams } from '@/types/http/addStreamUserChatRoomMessageParams'
import { sleep } from '@/utils/time'

export const addStreamUserChatRoomMessage = onRequest(
  publicHttpOption,
  async (req: TypedRequestBody<AddStreamUserChatRoomMessageParams>, res) => {
    try {
      const body = {
        userChatRoomId: req.body.userChatRoomId || '',
        content: req.body.content,
      }
      if (body.userChatRoomId === '') throw new Error('userChatRoomId is empty')
      const user = await getUserAuth(req)
      const userCollectionName = 'User'
      const userChatRoomCollectionName = 'UserChatRoom'
      const userChatRoomMessageCollectionName = 'UserChatRoomMessage'
      const userChatRoom = await getChildCollectionItem<UserChatRoom, User>(
        userCollectionName,
        userChatRoomCollectionName,
        user.uid,
        body.userChatRoomId
      )
      if (!userChatRoom) throw new Error('userChatRoom not found')
      if (userChatRoom.data.stream === false)
        throw new Error('stream must be true')

      const newMessage: UserChatRoomMessage = {
        userChatRoomRef: userChatRoom.ref,
        role: 'user',
        content: body.content,
      }
      await addGrandChildCollectionItem<
        UserChatRoomMessage,
        UserChatRoom,
        User
      >(
        userCollectionName,
        userChatRoomCollectionName,
        userChatRoomMessageCollectionName,
        user.uid,
        body.userChatRoomId,
        newMessage
      )
      const systemMessage: UserChatRoomMessage = {
        userChatRoomRef: userChatRoom.ref,
        role: 'assistant',
        content: '',
      }

      const userChatRoomMessageRef = await addGrandChildCollectionItem<
        UserChatRoomMessage,
        UserChatRoom,
        User
      >(
        userCollectionName,
        userChatRoomCollectionName,
        userChatRoomMessageCollectionName,
        user.uid,
        body.userChatRoomId,
        systemMessage
      )
      const userChatRoomMessages = await queryGrandChildCollectionItem<
        UserChatRoomMessage,
        UserChatRoom,
        User
      >(
        userCollectionName,
        userChatRoomCollectionName,
        userChatRoomMessageCollectionName,
        user.uid,
        body.userChatRoomId,
        [order('createdAt', 'asc')]
      )
      const messages = []
      for await (const message of userChatRoomMessages) {
        messages.push({
          role: message.data.role,
          content: message.data.content,
        } as ChatCompletionRequestMessage)
      }

      const openAiBody: CreateChatCompletionRequest = {
        model: userChatRoom.data.model,
        max_tokens: userChatRoom.data.maxTokens,
        temperature: userChatRoom.data.temperature,
        n: 1,
        top_p: 1,
        stream: userChatRoom.data.stream,
        messages,
      }

      await streamChat(
        user.uid,
        body.userChatRoomId,
        userChatRoomMessageRef.id,
        openAiBody
      )
      res.json({
        status: 'streaming',
        userChatRoomMessageId: userChatRoomMessageRef.id,
      })
    } catch (error) {
      res.status(500).json({ status: 'error', message: String(error) })
    }
  }
)
