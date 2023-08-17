import { getChildCollectionItem } from '@skeet-framework/firestore'
import { User, UserChatRoom, UserChatRoomCN, UserCN } from '@/models'

export const getUserChatRoom = async (
  userId: string,
  userChatRoomId: string,
) => {
  try {
    const userChatRoom = await getChildCollectionItem<UserChatRoom, User>(
      UserCN,
      UserChatRoomCN,
      userId,
      userChatRoomId,
    )
    if (!userChatRoom) throw new Error('userChatRoom not found')

    return userChatRoom
  } catch (error) {
    throw new Error(`getUserChatRoom: ${error}`)
  }
}
