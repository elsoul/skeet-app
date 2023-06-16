import dotenv from 'dotenv'
import { Configuration, CreateChatCompletionRequest, OpenAIApi } from 'openai'
import { IncomingMessage } from 'http'
import { Response } from 'firebase-functions/v1'
import { sleep } from '@/utils/time'
dotenv.config()

export const chat = async (
  createChatCompletionRequest: CreateChatCompletionRequest,
  organization: string,
  apiKey: string
) => {
  const configuration = new Configuration({
    organization,
    apiKey,
  })
  const openai = new OpenAIApi(configuration)
  const completion = await openai.createChatCompletion(
    createChatCompletionRequest
  )
  return completion.data.choices[0].message
}

export const streamChat = async (
  res: Response,
  createChatCompletionRequest: CreateChatCompletionRequest,
  organization: string,
  apiKey: string
) => {
  let streamClosed = false
  const configuration = new Configuration({
    organization,
    apiKey,
  })
  const openai = new OpenAIApi(configuration)
  try {
    const result = await openai.createChatCompletion(
      createChatCompletionRequest,
      {
        responseType: 'stream',
      }
    )
    const messageResults: string[] = []
    const stream = result.data as unknown as IncomingMessage
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

            console.log(message)
            messageResults.push(message)
            while (!streamClosed && res.writableLength > 0) {
              await sleep(10)
            }
            res.write(JSON.stringify({ text: message }))
          } catch (error) {
            console.log(`Error with JSON.parse and ${payload}.\n${error}`)
          }
        }
      }
      res.once('error', () => (streamClosed = true))
      res.once('close', () => (streamClosed = true))
      if (streamClosed) res.end('Stream disconnected')
    })

    stream.on('end', () => {
      console.log(`Stream end - ${messageResults.join('')}`)
      res.end('Stream done')
    })
    stream.on('error', (e: Error) => console.error(e))
  } catch (error) {
    console.error(error)
  }
}
