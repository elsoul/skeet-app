import { db } from '@/index'
import {
  UserCN,
  VertexChatRoom,
  VertexChatRoomCN,
  VertexChatRoomMessage,
  VertexChatRoomMessageRole,
  VertexExample,
  VertexExampleCN,
  VertexChatRoomMessageCN,
} from '@/models'
import { getUserAuth } from '@/lib'
import { AddVertexMessageParams, TypedRequestBody } from '@/types/http'
import { onRequest } from 'firebase-functions/v2/https'
import { publicHttpOption } from '../options'
import { sendToVertexAI, streamResponse } from '@/lib'
import { add, get } from '@skeet-framework/firestore'

export const addVertexMessage = onRequest(
  publicHttpOption,
  async (req: TypedRequestBody<AddVertexMessageParams>, res) => {
    try {
      const user = await getUserAuth(req)

      // Get VertexChatRoom
      const chatRoomPath = `${UserCN}/${user.uid}/${VertexChatRoomCN}`
      const vertexChatRoomData = await get<VertexChatRoom>(
        db,
        chatRoomPath,
        req.body.vertexChatRoomId,
      )

      // Get VertexExample
      const vertexExamplePath = `${chatRoomPath}/${req.body.vertexChatRoomId}/${VertexExampleCN}`
      const vertexExampleData = await get<VertexExample>(
        db,
        vertexExamplePath,
        req.body.vertexExampleId,
      )

      // Send to VertexAI
      const response = await sendToVertexAI(
        vertexChatRoomData,
        vertexExampleData,
        req.body.content,
      )

      // Add User Message to VertexChatRoomMessage
      const messagePath = `${vertexExamplePath}/${req.body.vertexExampleId}/${VertexChatRoomMessageCN}`
      const messageBody = {
        vertexChatRoomId: vertexChatRoomData.userId,
        role: VertexChatRoomMessageRole.USER,
        content: req.body.content,
      } as VertexChatRoomMessage
      await add<VertexChatRoomMessage>(db, messagePath, messageBody)

      // Add AI Message to VertexChatRoomMessage
      const messageResBody = {
        vertexChatRoomId: vertexChatRoomData.userId,
        role: VertexChatRoomMessageRole.AI,
        content: response,
      }
      await add<VertexChatRoomMessage>(db, messagePath, messageResBody)

      // Stream Response
      await streamResponse(response, res)
    } catch (error) {
      res.status(500).json({ status: 'error', message: String(error) })
    }
  },
)
