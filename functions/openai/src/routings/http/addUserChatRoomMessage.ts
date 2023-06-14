import { onRequest } from 'firebase-functions/v2/https'
import { User, UserChatRoom, UserChatRoomMessage } from '@/models'
import {
  addGrandChildCollectionItem,
  getChildCollectionItem,
  queryGrandChildCollectionItem,
  updateChildCollectionItem,
} from '@skeet-framework/firestore'
import { order } from 'typesaurus'
import {
  ChatCompletionRequestMessage,
  CreateChatCompletionRequest,
} from 'openai'
import { chat } from '@/lib/openai/openAi'
import { TypedRequestBody } from '@/index'
import { AddUserChatRoomMessageParams } from '@/types/http/addUserChatRoomMessageParams'
import { publicHttpOption } from '@/routings/options'
import { getUserAuth } from '@/lib/getUserAuth'
import { generateChatRoomTitle } from '@/lib/openai/generateChatRoomTitle'

export const addUserChatRoomMessage = onRequest(
  { ...publicHttpOption, secrets: ['CHAT_GPT_ORG', 'CHAT_GPT_KEY'] },
  async (req: TypedRequestBody<AddUserChatRoomMessageParams>, res) => {
    const { CHAT_GPT_ORG: organization, CHAT_GPT_KEY: apiKey } = process.env
    try {
      if (!organization || !apiKey)
        throw new Error('ChatGPT organization or apiKey is empty')
      const body = {
        userChatRoomId: req.body.userChatRoomId ?? '',
        content: req.body.content,
        isFirstMessage: req.body.isFirstMessage ?? false,
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
      if (userChatRoom.data.stream === true)
        throw new Error('stream must be false')

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
      let openAiBody: CreateChatCompletionRequest = {
        model: userChatRoom.data.model,
        max_tokens: userChatRoom.data.maxTokens,
        temperature: userChatRoom.data.temperature,
        n: 1,
        top_p: 1,
        stream: userChatRoom.data.stream,
        messages,
      }
      const openAiResponse = await chat(openAiBody, organization, apiKey)
      if (!openAiResponse) throw new Error('openAiResponse not found')
      const content = String(openAiResponse.content) || ''
      const openAiResponseMessage: UserChatRoomMessage = {
        userChatRoomRef: userChatRoom.ref,
        role: 'assistant',
        content,
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
        openAiResponseMessage
      )
      if (messages.length === 3) {
        const title = await generateChatRoomTitle(
          body.content,
          organization,
          apiKey
        )
        await updateChildCollectionItem<UserChatRoom, User>(
          userCollectionName,
          userChatRoomCollectionName,
          user.uid,
          body.userChatRoomId,
          { title }
        )
      }
      res.json({ status: 'success', openAiResponse })
    } catch (error) {
      res.status(500).json({ status: 'error', message: String(error) })
    }
  }
)
