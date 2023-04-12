import admin from 'firebase-admin'
import dotenv from 'dotenv'
import { onRequest } from 'firebase-functions/v2/https'
import { chat } from '@/lib/openai/openAi'
import { helloSpec, openaichatroomSpec } from '@/spec'
import { addChatRoom, addMessage, getRoomMessages, getUser } from '@/models'

dotenv.config()
admin.initializeApp()

export const hello = onRequest(helloSpec, async (req, res) => {
  try {
    const userId = '1'
    const model = 'gpt-3.5-turbo'
    const maxTokens = 100
    const temperature = 1
    const result = await addChatRoom(userId, model, maxTokens, temperature)
    res.json({
      status: 'Successfully Created ChatRoom!',
      chatRoomId: result.id,
    })
  } catch (error) {
    const errorLog = `hello - ${error}`
    console.log(errorLog)
    res.status(400).json({ result: 'hello error!' })
  }
})

export const openaichatroom = onRequest(
  openaichatroomSpec,
  async (req, res) => {
    try {
      const body = {
        model: req.body.model || 'gpt-3.5-turbo',
        systemCharacter:
          req.body.systemCharacter ||
          '優秀な女性アシスタント。物事を段階的に考えるのが得意です。優しい口調。できないことは言わない。',
        chatRoomId: String(req.body.chatRoomId) || '',
        content: req.body.content,
        maxTokens: req.body.maxTokens || 700,
        temperature: req.body.temperature || 1,
      }
      const user = await getUser(req)
      if (body.chatRoomId == '') {
        const chatRoom = await addChatRoom(
          user.uid,
          body.model,
          body.maxTokens,
          body.temperature
        )
        await addMessage(user.uid, chatRoom.id, body.systemCharacter, 'system')
      }

      const role = 'user'
      await addMessage(user.uid, body.chatRoomId, body.content, role)
      const openaiBody = await getRoomMessages(user.uid, body.chatRoomId)
      const message = await chat(openaiBody)
      if (!message) throw new Error('message is undefined')
      await addMessage(user.uid, body.chatRoomId, message.content, message.role)

      res.json({ result: 'success!', message })
    } catch (error) {
      const errorLog = `openaichatroom - ${error}`
      console.log(errorLog)
      res.status(400).json({ result: 'openaichatroom error!' })
    }
  }
)
