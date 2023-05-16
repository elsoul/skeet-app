import { onRequest } from 'firebase-functions/v2/https'
import { getUserAuth, User, UserChatRoom, UserChatRoomMessage } from '@/models'
import { getGrandChildCollectionItems } from '@skeet-framework/firestore'
import { TypedRequestBody } from '@/index'
import { GetUserChatRoomMessagesParams } from '@/types/http/getUserChatRoomParams'
import { defaultHttpOption } from '@/routings/options'

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
      const messages = await getGrandChildCollectionItems<
        UserChatRoomMessage,
        UserChatRoom,
        User
      >(
        parentCollectionName,
        childCollectionName,
        grandChildCollectionName,
        body.userId,
        body.userChatRoomId
      )
      res.json({ result: 'success!', messages })
    } catch (error) {
      const errorLog = `getUserChatRoomMessages - ${error}`
      console.log(errorLog)
      res.status(400).json({ result: error })
    }
  }
)
