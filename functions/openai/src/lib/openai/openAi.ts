import dotenv from 'dotenv'
import { Configuration, CreateChatCompletionRequest, OpenAIApi } from 'openai'
import { IncomingMessage } from 'http'
import { User, UserChatRoom, UserChatRoomMessage } from '@/models'
import {
  getGrandChildCollectionItem,
  updateGrandChildCollectionItem,
} from '@skeet-framework/firestore'
dotenv.config()

export const chat = async (
  createChatCompletionRequest: CreateChatCompletionRequest
) => {
  const configuration = new Configuration({
    organization: process.env.CHAT_GPT_ORG,
    apiKey: process.env.CHAT_GPT_KEY,
  })
  const openai = new OpenAIApi(configuration)
  const completion = await openai.createChatCompletion(
    createChatCompletionRequest
  )
  return completion.data.choices[0].message
}

export const streamChat = async (
  userId: string,
  userChatRoomId: string,
  userChatRoomMessageId: string,
  createChatCompletionRequest: CreateChatCompletionRequest
) => {
  const configuration = new Configuration({
    organization: process.env.CHAT_GPT_ORG,
    apiKey: process.env.CHAT_GPT_KEY,
  })
  const openai = new OpenAIApi(configuration)
  try {
    const res = await openai.createChatCompletion(createChatCompletionRequest, {
      responseType: 'stream',
    })
    const stream = res.data as unknown as IncomingMessage
    stream.on('data', async (chunk: Buffer) => {
      const payloads = chunk.toString().split('\n\n')
      for await (const payload of payloads) {
        if (payload.includes('[DONE]')) return
        if (payload.startsWith('data:')) {
          const data = payload.replaceAll(/(\n)?^data:\s*/g, '')
          try {
            const delta = JSON.parse(data.trim())
            const message = delta.choices[0].delta?.content
            if (message == undefined) continue
            const collectionName = 'User'
            const childCollectionName = 'UserChatRoom'
            const grandChildCollectionName = 'UserChatRoomMessage'
            const userChatRoomMessage = await getGrandChildCollectionItem<
              UserChatRoomMessage,
              UserChatRoom,
              User
            >(
              collectionName,
              childCollectionName,
              grandChildCollectionName,
              userId,
              userChatRoomId,
              userChatRoomMessageId
            )
            const currentContent = userChatRoomMessage.data.content
            const newContent = currentContent + message
            await updateGrandChildCollectionItem<
              UserChatRoomMessage,
              UserChatRoom,
              User
            >(
              collectionName,
              childCollectionName,
              grandChildCollectionName,
              userId,
              userChatRoomId,
              userChatRoomMessageId,
              { content: newContent }
            )
            console.log(message)
          } catch (error) {
            console.log(`Error with JSON.parse and ${payload}.\n${error}`)
          }
        }
      }
    })

    stream.on('end', () => console.log('Stream done'))
    stream.on('error', (e: Error) => console.error(e))
  } catch (error: any) {
    if (error.response?.status) {
      console.error(error.response.status, error.message)
      error.response.data.on('data', (data: any) => {
        const message = data.toString()
        try {
          const parsed = JSON.parse(message)
          console.error('An error occurred during OpenAI request: ', parsed)
        } catch (error) {
          console.error('An error occurred during OpenAI request: ', message)
        }
      })
    } else {
      console.error('An error occurred during OpenAI request', error)
    }
  }
}
