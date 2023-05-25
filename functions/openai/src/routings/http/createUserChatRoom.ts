import { onRequest } from 'firebase-functions/v2/https'
import { User, UserChatRoom, UserChatRoomMessage } from '@/models'
import {
  addChildCollectionItem,
  addGrandChildCollectionItem,
  getCollectionItem,
} from '@skeet-framework/firestore'
import { TypedRequestBody } from '@/index'
import { defaultHttpOption } from '@/routings/options'
import { CreateUserChatRoomParams } from '@/types/http/createUserChatRoomParams'
import { getUserAuth } from '@/lib/getUserAuth'

export const createUserChatRoom = onRequest(
  defaultHttpOption,
  async (req: TypedRequestBody<CreateUserChatRoomParams>, res) => {
    try {
      const body = {
        model: req.body.model || 'gpt-3.5-turbo',
        systemContent:
          req.body.systemContent ||
          'This is a great chatbot. This Assistant is very kind and helpful.',
        maxTokens: req.body.maxTokens || 256,
        temperature: req.body.temperature || 1,
        stream: req.body.stream || false,
      }
      const user = await getUserAuth(req)
      const parentCollectionName = 'User'
      const childCollectionName = 'UserChatRoom'
      const grandChildCollectionName = 'UserChatRoomMessage'

      const userDoc = await getCollectionItem<User>(
        parentCollectionName,
        user.uid
      )
      console.log(`userDoc: ${userDoc}`)

      const parentId = user.uid || ''
      const params: UserChatRoom = {
        userRef: userDoc.ref,
        model: body.model,
        maxTokens: body.maxTokens,
        temperature: body.temperature,
        stream: body.stream,
      }
      const userChatRoomRef = await addChildCollectionItem<UserChatRoom, User>(
        parentCollectionName,
        childCollectionName,
        parentId,
        params
      )
      console.log(`created userChatRoomRef: ${userChatRoomRef.id}`)
      const systemMessage: UserChatRoomMessage = {
        userChatRoomRef,
        role: 'system',
        content: body.systemContent,
      }
      const userChatRoomMessageRef = await addGrandChildCollectionItem<
        UserChatRoomMessage,
        UserChatRoom,
        User
      >(
        parentCollectionName,
        childCollectionName,
        grandChildCollectionName,
        user.uid,
        userChatRoomRef.id,
        systemMessage
      )
      res.json({ status: 'success', userChatRoomRef, userChatRoomMessageRef })
    } catch (error) {
      res.status(500).json({ status: 'error', message: String(error) })
    }
  }
)