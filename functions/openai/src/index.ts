import admin from 'firebase-admin'
import dotenv from 'dotenv'
import { Request, onRequest } from 'firebase-functions/v2/https'
import { chat } from '@/lib/openai/openAi'
import { rootSpec } from '@/spec'
import {
  ChatCompletionRequestMessageRoleEnum,
  CreateChatCompletionRequest,
} from 'openai'
import {
  createUserChatRoom,
  getUserChatRoomMessages,
  addUserChatRoomMessage,
} from '@/route'

dotenv.config()
admin.initializeApp()

export { createUserChatRoom, getUserChatRoomMessages, addUserChatRoomMessage }

export interface TypedRequestBody<T> extends Request {
  body: T
}

export const root = onRequest(rootSpec, async (req, res) => {
  try {
    res.json({
      status: 'Skeet APP is Running!',
    })
  } catch (error) {
    const errorLog = `root - ${error}`
    console.log(errorLog)
    res.status(400).json({ result: 'root error!' })
  }
})

export const hello = onRequest(rootSpec, async (req, res) => {
  try {
    const body = {
      systemContent: req.body.systemContent,
      content: req.body.content,
    }
    const model = 'gpt-3.5-turbo'
    const maxTokens = 100
    const temperature = 1
    const openAiBody: CreateChatCompletionRequest = {
      model,
      max_tokens: maxTokens,
      temperature,
      stream: false,
      messages: [
        {
          role: ChatCompletionRequestMessageRoleEnum.System,
          content:
            body.systemContent ||
            '優秀な女性アシスタント。物事を段階的に考えるのが得意です。優しい口調。できないことは言わない。',
        },
        {
          role: ChatCompletionRequestMessageRoleEnum.User,
          content: body.content || 'Hello',
        },
      ],
    }
    const result = await chat(openAiBody)
    res.json({
      status: 'Welcome to Skeet APP!',
      result: result,
    })
  } catch (error) {
    const errorLog = `hello - ${error}`
    console.log(errorLog)
    res.status(400).json({ result: 'hello error!' })
  }
})
