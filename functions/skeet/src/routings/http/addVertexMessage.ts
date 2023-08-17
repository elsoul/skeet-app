import { db } from '@/index'
import {
  UserCN,
  VertexChatRoom,
  VertexChatRoomCN,
  VertexChatRoomMessage,
  VertexChatRoomMessageRole,
  VertexExample,
  VertexPromptCN,
  VertexChatRoomMessageCN,
} from '@/models'
import { getUserAuth } from '@/lib'
import { AddVertexMessageParams, TypedRequestBody } from '@/types/http'
import { onRequest } from 'firebase-functions/v2/https'
import { publicHttpOption } from '../options'
import { sendToVertexAI, streamResponse } from '@/models/lib'
import {
  createDataRef,
  createFirestoreDataConverter,
  getFirestoreData,
} from '@/models/converters'

export const addVertexMessage = onRequest(
  publicHttpOption,
  async (req: TypedRequestBody<AddVertexMessageParams>, res) => {
    try {
      const user = await getUserAuth(req)

      // Get VertexChatRoom
      const vertexChatRoomRef = createDataRef<VertexChatRoom>(
        db,
        `${UserCN}/${user.uid}/${VertexChatRoomCN}/${req.body.vertexChatRoomId}`,
        createFirestoreDataConverter<VertexChatRoom>(),
      )
      const vertexChatRoomData = await getFirestoreData(vertexChatRoomRef)

      // Get VertexExample
      const vertexExampleRef = createDataRef<VertexExample>(
        db,
        `${UserCN}/${user.uid}/${VertexChatRoomCN}/${req.body.vertexChatRoomId}/${VertexPromptCN}/${req.body.vertexPromptId}`,
        createFirestoreDataConverter<VertexExample>(),
      )
      const vertexExampleData = await getFirestoreData(vertexExampleRef)

      const response = await sendToVertexAI(
        vertexChatRoomData,
        vertexExampleData,
        req.body.content,
      )
      const messageCollectionRef = db
        .collection(
          `${UserCN}/${user.uid}/${VertexChatRoomCN}/${req.body.vertexChatRoomId}/${VertexPromptCN}/${req.body.vertexPromptId}/${VertexChatRoomMessageCN}`,
        )
        .withConverter(createFirestoreDataConverter<VertexChatRoomMessage>())

      console.log({ messageCollectionRef })
      const messageBody = {
        vertexChatRoomId: vertexChatRoomData.userId,
        role: VertexChatRoomMessageRole.USER,
        content: req.body.content,
      }
      await messageCollectionRef.add(messageBody)

      const messageResBody = {
        vertexChatRoomId: vertexChatRoomData.userId,
        role: VertexChatRoomMessageRole.AI,
        content: response,
      }
      await messageCollectionRef.add(messageResBody)

      await streamResponse(response, res)
    } catch (error) {
      res.status(500).json({ status: 'error', message: String(error) })
    }
  },
)
