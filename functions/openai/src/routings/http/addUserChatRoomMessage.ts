import { onRequest } from 'firebase-functions/v2/https'
import { getUserAuth, User, UserChatRoom, UserChatRoomMessage } from '@/models'
import {
  addGrandChildCollectionItem,
  queryGrandChildCollectionItem,
} from '@skeet-framework/firestore'
import { collection, get, order, ref, subcollection } from 'typesaurus'
import {
  ChatCompletionRequestMessage,
  CreateChatCompletionRequest,
} from 'openai'
import { chat } from '@/lib/openai/openAi'
import { TypedRequestBody } from '@/index'
import { AddUserChatRoomMessageParams } from '@/types/http/addUserChatRoomMessageParams'
import { defaultHttpOption } from '@/routings/options'

export const addUserChatRoomMessage = onRequest(
  defaultHttpOption,
  async (req: TypedRequestBody<AddUserChatRoomMessageParams>, res) => {
    try {
      const body = {
        userChatRoomId: req.body.userChatRoomId || '',
        content: req.body.content,
      }
      if (body.userChatRoomId === '') throw new Error('userChatRoomId is empty')
      const user = await getUserAuth(req)
      const userCollectionName = 'User'
      const userChatRoomCollectionName = 'UserChatRoom'
      const userChatRoomMessageCollectionName = 'UserChatRoomMessage'
      const userCollection = collection<User>(userCollectionName)
      const userChatRoomCollection = subcollection<UserChatRoom, User>(
        userChatRoomCollectionName,
        userCollection
      )
      const userChatRoom = await get(
        userChatRoomCollection(user.uid),
        body.userChatRoomId
      )
      if (!userChatRoom) throw new Error('userChatRoom not found')
      const newMessage: UserChatRoomMessage = {
        userChatRoomRef: ref(
          userChatRoomCollection(user.uid),
          body.userChatRoomId
        ),
        role: 'user',
        content: body.content,
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
        body.userChatRoomId,
        newMessage
      )
      const userChatRoomMessages = await queryGrandChildCollectionItem<
        UserChatRoomMessage,
        UserChatRoom,
        User
      >(
        userCollectionName,
        userChatRoomCollectionName,
        userChatRoomMessageCollectionName,
        user.uid,
        body.userChatRoomId,
        [order('createdAt', 'asc')]
      )
      const messages = []
      for await (const message of userChatRoomMessages) {
        messages.push({
          role: message.data.role,
          content: message.data.content,
        } as ChatCompletionRequestMessage)
      }
      const openAiBody: CreateChatCompletionRequest = {
        model: userChatRoom.data.model,
        max_tokens: userChatRoom.data.maxTokens,
        temperature: userChatRoom.data.temperature,
        n: 1,
        top_p: 1,
        stream: userChatRoom.data.stream,
        messages,
      }
      const openAiResponse = await chat(openAiBody)
      if (!openAiResponse) throw new Error('openAiResponse not found')
      const content = String(openAiResponse.content) || ''
      const openAiResponseMessage: UserChatRoomMessage = {
        userChatRoomRef: ref(
          userChatRoomCollection(user.uid),
          body.userChatRoomId
        ),
        role: 'assistant',
        content,
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
        body.userChatRoomId,
        openAiResponseMessage
      )
      res.json({ result: 'success!', openAiResponse })
    } catch (error) {
      const errorLog = `createUserChatRoom - ${error}`
      console.log(errorLog)
      res.status(400).json({ result: error })
    }
  }
)
