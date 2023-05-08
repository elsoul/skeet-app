import { onRequest } from 'firebase-functions/v2/https'
import { rootSpec } from '@/spec'
import { getUserAuth, User, UserChatRoom, UserChatRoomMessage } from '@/models'
import { getGrandChildCollectionItems } from '@/lib/getGrandChildCollectionItems'

export const getUserChatRoomMessages = onRequest(rootSpec, async (req, res) => {
  try {
    const user = await getUserAuth(req)
    const body = {
      userId: user.uid,
      userChatRoomId: req.body.userChatRoomId,
    }
    const messages = await getGrandChildCollectionItems<
      UserChatRoomMessage,
      UserChatRoom,
      User
    >(
      'User',
      'UserChatRoom',
      'UserChatRoomMessage',
      body.userId,
      body.userChatRoomId
    )
    res.json({ result: 'success!', messages })
  } catch (error) {
    const errorLog = `getUserChatRoomMessages - ${error}`
    console.log(errorLog)
    res.status(400).json({ result: error })
  }
})
