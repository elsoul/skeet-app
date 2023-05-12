import { onRequest } from 'firebase-functions/v2/https'
import { rootSpec } from '@/spec'
import { getUserAuth, User, UserChatRoom, UserChatRoomMessage } from '@/models'
import {
  addCollectionItem,
  addChildCollectionItem,
  addGrandChildCollectionItem,
} from '@skeet-framework/firestore'
import { TypedRequestBody } from '@/index'
import { CreateUserChatRoomParams } from '@/types/http/createUserChatRoomParams'

export const createUserChatRoom = onRequest(
  rootSpec,
  async (req: TypedRequestBody<CreateUserChatRoomParams>, res) => {
    try {
      const body = {
        model: req.body.model || 'gpt-3.5-turbo',
        systemContent:
          req.body.systemContent ||
          '優秀な女性アシスタント。物事を段階的に考えるのが得意です。優しい口調。できないことは言わない。',
        maxTokens: req.body.maxTokens || 256,
        temperature: req.body.temperature || 1,
        stream: req.body.stream || false,
      }
      const user = await getUserAuth(req)
      const userCollectionName = 'User'
      const userChatRoomCollectionName = 'UserChatRoom'
      const userChatRoomMessageCollectionName = 'UserChatRoomMessage'

      const userBody: User = {
        uid: user.uid,
        username: user.displayName || '',
        email: user.email || '',
        iconUrl: user.photoURL || '',
      }
      const userRef = await addCollectionItem<User>(
        userCollectionName,
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
        userCollectionName,
        userChatRoomCollectionName,
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
        userCollectionName,
        userChatRoomCollectionName,
        userChatRoomMessageCollectionName,
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
