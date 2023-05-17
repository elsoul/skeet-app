import { onRequest } from 'firebase-functions/v2/https'
import { User, UserChatRoom, UserChatRoomMessage } from '@/models'
import {
  addCollectionItem,
  addChildCollectionItem,
  addGrandChildCollectionItem,
} from '@skeet-framework/firestore'
import { TypedRequestBody } from '@/index'
import { CreateUserChatRoomParams } from '@/types/http/createUserChatRoomParams'
import { defaultHttpOption } from '@/routings/options'
import { getUserAuth } from '@/lib/auth'

export const createUserChatRoom = onRequest(
  defaultHttpOption,
  async (req: TypedRequestBody<CreateUserChatRoomParams>, res) => {
    try {
      const body = {
        model: req.body.model || 'gpt-3.5-turbo',
        systemContent:
          req.body.systemContent ||
          '優秀なアシスタント。物事を段階的に考えるのが得意です。優しい口調。できないことは言わない。',
        maxTokens: req.body.maxTokens || 256,
        temperature: req.body.temperature || 1,
        stream: req.body.stream || false,
      }
      const user = await getUserAuth(req)
      const parentCollectionName = 'User'
      const childCollectionName = 'UserChatRoom'
      const grandChildCollectionName = 'UserChatRoomMessage'

      const userBody: User = {
        uid: user.uid,
        username: user.displayName || '',
        email: user.email || '',
        iconUrl: user.photoURL || '',
      }
      const userRef = await addCollectionItem<User>(
        parentCollectionName,
        userBody,
        user.uid
      )

      const parentId = user.uid || ''
      const params: UserChatRoom = {
        userRef,
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
      await addGrandChildCollectionItem<
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
      res.json({ result: 'success!', userChatRoomRef })
    } catch (error) {
      const errorLog = `createUserChatRoom - ${error}`
      console.log(errorLog)
      res.status(400).json({ result: error })
    }
  }
)
