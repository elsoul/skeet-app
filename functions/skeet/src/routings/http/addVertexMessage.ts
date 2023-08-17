import { db } from '@/index'
import {
  UserCN,
  VertexChatRoom,
  VertexChatRoomCN,
  VertexExample,
  VertexPromptCN,
} from '@/models'
import { getUserAuth } from '@/lib'
import { AddVertexMessageParams, TypedRequestBody } from '@/types/http'
import { onRequest } from 'firebase-functions/v2/https'
import { publicHttpOption } from '../options'
import { sendToVertexAI } from '@/models/lib/vertex/sendToVertexAi'
import { streamResponse } from '@/models/lib/vertex/streamResponse'
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
      await streamResponse(response, res, req, user, vertexChatRoomData)
    } catch (error) {
      res.status(500).json({ status: 'error', message: String(error) })
    }
  },
)
