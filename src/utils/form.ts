import * as z from 'zod'

export const emailSchema = z.string().email()
export const passwordSchema = z.string().min(8)
export const usernameSchema = z.string().min(1).max(20)

export type GPTModel = 'gpt-4-1106-preview' | 'gpt-4' | 'gpt-3.5-turbo'
export const allowedGPTModel: GPTModel[] = [
  'gpt-4-1106-preview',
  'gpt-4',
  'gpt-3.5-turbo',
]
export const gptModelSchema = z.union([
  z.literal('gpt-4-1106-preview'),
  z.literal('gpt-4'),
  z.literal('gpt-3.5-turbo'),
])

export const getGptChatModelName = (name = 'gpt-4-1106-preview') => {
  const chatRoomNames = {
    'gpt-4-1106-preview': 'GPT-4 Turbo (preview)',
    'gpt-4': 'GPT-4',
    'gpt-3.5-turbo': 'GPT-3.5 Turbo',
  }
  return chatRoomNames[name as keyof typeof chatRoomNames]
}

export const maxTokensSchema = z.number().int().min(100).max(4096)
export const temperatureSchema = z.number().min(0).max(2)
export const systemContentSchema = z.string().min(1).max(1000)
export const chatContentSchema = z.string().min(1).max(100000)
