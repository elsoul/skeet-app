import dotenv from 'dotenv'
import { Configuration, CreateChatCompletionRequest, OpenAIApi } from 'openai'
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
