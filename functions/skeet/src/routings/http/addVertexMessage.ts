import { db } from '@/index'
import {
  VertexChatRoom,
  VertexChatRoomMessage,
  VertexChatRoomMessageRole,
  genVertexChatRoomPath,
  genVertexChatRoomMessagePath,
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
      const chatRoomPath = genVertexChatRoomPath(user.uid)
      const vertexChatRoomData = await get<VertexChatRoom>(
        db,
        chatRoomPath,
        req.body.vertexChatRoomId,
      )
      const vertexExampleData = vertexChatRoomData.examples

      // Send to VertexAI
      const response = await sendToVertexAI(
        {
          id: req.body.vertexChatRoomId,
          ...vertexChatRoomData,
        },
        vertexExampleData,
        req.body.content,
        chatRoomPath,
      )

      // Add User Message to VertexChatRoomMessage
      const messagePath = genVertexChatRoomMessagePath(
        user.uid,
        req.body.vertexChatRoomId,
      )
      const messageBody = {
        role: VertexChatRoomMessageRole.USER,
        content: req.body.content,
      } as VertexChatRoomMessage
      await add<VertexChatRoomMessage>(db, messagePath, messageBody)

      // Add AI Message to VertexChatRoomMessage
      const messageResBody = {
        role: VertexChatRoomMessageRole.AI,
        content: response,
      }
      await add<VertexChatRoomMessage>(db, messagePath, messageResBody)

      // Stream Response
      await streamResponse(response, res)
    } catch (error) {
      console.error(error)
      res.status(500).json({ status: 'error', message: String(error) })
    }
  },
)
