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
  updateChildCollectionItem,
} from '@skeet-framework/firestore'
import { getUserAuth } from '@/lib/getUserAuth'
import { publicHttpOption } from '@/routings'
import { AddStreamUserChatRoomMessageParams } from '@/types/http/addStreamUserChatRoomMessageParams'
import { generateChatRoomTitle } from '@/lib/openai/generateChatRoomTitle'

export const addStreamUserChatRoomMessage = onRequest(
  { ...publicHttpOption, secrets: ['CHAT_GPT_KEY', 'CHAT_GPT_ORG'] },
  async (req: TypedRequestBody<AddStreamUserChatRoomMessageParams>, res) => {
    const { CHAT_GPT_ORG: organization, CHAT_GPT_KEY: apiKey } = process.env
    try {
      if (!organization || !apiKey)
        throw new Error('ChatGPT organization or apiKey is empty')
      const body = {
        userChatRoomId: req.body.userChatRoomId || '',
        content: req.body.content,
      }
      if (body.userChatRoomId === '') throw new Error('userChatRoomId is empty')

      // Get User Info from Firebase Auth
      const user = await getUserAuth(req)

      // Define Collection Name
      const userCollectionName = 'User'
      const userChatRoomCollectionName = 'UserChatRoom'
      const userChatRoomMessageCollectionName = 'UserChatRoomMessage'

      // Get UserChatRoom
      const userChatRoom = await getChildCollectionItem<UserChatRoom, User>(
        userCollectionName,
        userChatRoomCollectionName,
        user.uid,
        body.userChatRoomId
      )
      if (!userChatRoom) throw new Error('userChatRoom not found')
      if (userChatRoom.data.stream === false)
        throw new Error('stream must be true')

      // Add UserChatRoomMessage
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

      // Get UserChatRoomMessages for OpenAI Request
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

      // Add Empty UserChatRoomMessage for Stream ID
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

      // Send Request to OpenAI
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

      console.log('messages.length', messages.length)
      // Update UserChatRoom Title
      if (messages.length === 2) {
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

      // Response
      res.json({
        status: 'streaming',
        userChatRoomMessageId: userChatRoomMessageRef.id,
      })
    } catch (error) {
      res.status(500).json({ status: 'error', message: String(error) })
    }
  }
)
