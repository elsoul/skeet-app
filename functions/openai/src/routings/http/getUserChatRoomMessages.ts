import { onRequest } from 'firebase-functions/v2/https'
import { User, UserChatRoom, UserChatRoomMessage } from '@/models'
import { queryGrandChildCollectionItem } from '@skeet-framework/firestore'
import { TypedRequestBody } from '@/index'
import { GetUserChatRoomMessagesParams } from '@/types/http/getUserChatRoomParams'
import { defaultHttpOption } from '@/routings/options'
import { order } from 'typesaurus'
import { getUserAuth } from '@/lib/getUserAuth'

export const getUserChatRoomMessages = onRequest(
  defaultHttpOption,
  async (req: TypedRequestBody<GetUserChatRoomMessagesParams>, res) => {
    try {
      const user = await getUserAuth(req)
      const body = {
        userId: user.uid,
        userChatRoomId: req.body.userChatRoomId,
      }
      const parentCollectionName = 'User'
      const childCollectionName = 'UserChatRoom'
      const grandChildCollectionName = 'UserChatRoomMessage'
      const messages = await queryGrandChildCollectionItem<
        UserChatRoomMessage,
        UserChatRoom,
        User
      >(
        parentCollectionName,
        childCollectionName,
        grandChildCollectionName,
        body.userId,
        body.userChatRoomId,
        [order('createdAt', 'asc')]
      )
      res.json({
        status: 'success',
        messages: messages.map((message) => message.data),
      })
    } catch (error) {
      res.status(500).json({ status: 'error', message: String(error) })
    }
  }
)
