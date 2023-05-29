import * as z from 'zod'

export const emailSchema = z.string().email()
export const passwordSchema = z.string().min(8)
export const usernameSchema = z.string().min(1).max(20)
