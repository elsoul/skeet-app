import {
  User,
  UserChatRoom,
  UserChatRoomMessage,
  UserChatRoomCN,
  UserChatRoomMessageCN,
  UserCN,
} from '@/models'
import { Ref, addGrandChildCollectionItem } from '@skeet-framework/firestore'

export const createUserChatRoomMessage = async (
  userChatRoomRef: Ref<UserChatRoom>,
  userId: string,
  content: string,
  role = 'user',
) => {
  try {
    const newMessage: UserChatRoomMessage = {
      userChatRoomRef,
      role,
      content,
    }
    return await addGrandChildCollectionItem<
      UserChatRoomMessage,
      UserChatRoom,
      User
    >(
      UserCN,
      UserChatRoomCN,
      UserChatRoomMessageCN,
      userId,
      userChatRoomRef.id,
      newMessage,
    )
  } catch (error) {
    throw new Error(`createUserChatRoomMessage: ${error}`)
  }
}
