import { onRequest } from 'firebase-functions/v2/https'
import { CreateChatCompletionRequest } from 'openai'
import { streamChat } from '@/lib/openai/openAi'
import { TypedRequestBody } from '@/index'
import { updateChildCollectionItem } from '@skeet-framework/firestore'
import { getUserAuth } from '@/lib/getUserAuth'
import { publicHttpOption } from '@/routings'
import { AddStreamUserChatRoomMessageParams } from '@/types/http/addStreamUserChatRoomMessageParams'
import { generateChatRoomTitle } from '@/lib/openai/generateChatRoomTitle'
import { defineSecret } from 'firebase-functions/params'
import {
  User,
  UserChatRoom,
  userChatRoomCollectionName,
  userCollectionName,
} from '@/models'
import { createUserChatRoomMessage } from '@/models/lib/createUserChatRoomMessage'
import { getMessages } from '@/models/lib/getMessages'
import { getUserChatRoom } from '@/models/lib/getUserChatRoom'
const chatGptOrg = defineSecret('CHAT_GPT_ORG')
const chatGptKey = defineSecret('CHAT_GPT_KEY')

export const addStreamUserChatRoomMessage = onRequest(
  { ...publicHttpOption, secrets: [chatGptOrg, chatGptKey] },
  async (req: TypedRequestBody<AddStreamUserChatRoomMessageParams>, res) => {
    const organization = chatGptOrg.value()
    const apiKey = chatGptKey.value()

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

      // Get UserChatRoom
      const userChatRoom = await getUserChatRoom(user.uid, body.userChatRoomId)
      if (userChatRoom.data.stream === false)
        throw new Error('stream must be true')

      // Add UserChatRoomMessage
      await createUserChatRoomMessage(userChatRoom.ref, user.uid, body.content)

      // Get UserChatRoomMessages for OpenAI Request
      const messages = await getMessages(user.uid, body.userChatRoomId)

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
        res,
        openAiBody,
        chatGptOrg.value(),
        chatGptKey.value(),
        user.uid,
        userChatRoom.ref
      )
    } catch (error) {
      res.status(500).json({ status: 'error', message: String(error) })
    }
  }
)
