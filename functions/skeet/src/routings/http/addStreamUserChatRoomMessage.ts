import { db } from '@/index'
import { onRequest } from 'firebase-functions/v2/https'
import { getUserAuth } from '@/lib'
import { publicHttpOption } from '@/routings'
import { AddStreamUserChatRoomMessageParams } from '@/types/http/addStreamUserChatRoomMessageParams'
import { defineSecret } from 'firebase-functions/params'
import {
  UserChatRoom,
  UserChatRoomCN,
  UserCN,
  UserChatRoomMessage,
  UserChatRoomMessageCN,
} from '@/models'
import { OpenAI, OpenAIMessage } from '@skeet-framework/ai'
import { TypedRequestBody } from '@/types/http'
import { add, get, query, update } from '@skeet-framework/firestore'

const chatGptOrg = defineSecret('CHAT_GPT_ORG')
const chatGptKey = defineSecret('CHAT_GPT_KEY')

export const addStreamUserChatRoomMessage = onRequest(
  { ...publicHttpOption, secrets: [chatGptOrg, chatGptKey] },
  async (req: TypedRequestBody<AddStreamUserChatRoomMessageParams>, res) => {
    const organization = chatGptOrg.value()
    const apiKey = chatGptKey.value()

    try {
      if (!organization || !apiKey)
        throw new Error(
          `ChatGPT organization or apiKey is empty\nPlease run \`skeet add secret CHAT_GPT_ORG/CHAT_GPT_KEY\``,
        )

      // Get Request Body
      const body = {
        userChatRoomId: req.body.userChatRoomId || '',
        content: req.body.content,
      }
      if (body.userChatRoomId === '') throw new Error('userChatRoomId is empty')

      // Get User Info from Firebase Auth
      const user = await getUserAuth(req)

      // Get UserChatRoom
      const chatRoomPath = `${UserCN}/${user.uid}/${UserChatRoomCN}`
      const userChatRoom = await get<UserChatRoom>(
        db,
        chatRoomPath,
        body.userChatRoomId,
      )

      // Add User Message to UserChatRoomMessage
      await add<UserChatRoomMessage>(db, chatRoomPath, {
        content: body.content,
        role: 'user',
      })

      // Get UserChatRoomMessages for OpenAI Request
      const messagesPath = `${chatRoomPath}/${body.userChatRoomId}/${UserChatRoomMessageCN}`
      const messages = {
        messages: (await query<UserChatRoomMessage>(
          db,
          messagesPath,
          [],
        )) as OpenAIMessage[],
      }

      console.log('messages.length', messages.messages.length)

      const openAi = new OpenAI({
        organizationKey: organization,
        apiKey,
        model: userChatRoom.model,
        maxTokens: userChatRoom.maxTokens,
        temperature: userChatRoom.temperature,
        n: 1,
        topP: 1,
        stream: true,
      })
      // Update UserChatRoom Title
      if (messages.messages.length === 2) {
        const title = await openAi.generateTitle(body.content)
        await update<UserChatRoom>(db, chatRoomPath, body.userChatRoomId, {
          title,
        })
      }

      // Get OpenAI Stream
      const stream = await openAi.promptStream(messages)
      const messageResults: string[] = []
      for await (const part of stream) {
        const message = String(part.choices[0].delta)
        console.log(message)
        res.write(JSON.stringify({ text: message }))
        messageResults.push(message)
      }
      const message = messageResults.join('')
      await add<UserChatRoomMessage>(db, messagesPath, {
        content: message,
        role: 'assistant',
      })
      res.json({ status: 'success', message })
    } catch (error) {
      res.status(500).json({ status: 'error', message: String(error) })
    }
  },
)
