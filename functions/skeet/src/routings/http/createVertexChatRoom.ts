import { onRequest } from 'firebase-functions/v2/https'
import { publicHttpOption } from '@/routings/options'
import { TypedRequestBody } from '@/index'
import { CreateVertexChatRoomParams } from '@/types/http/createVertexChatRoomParams'
import * as dotenv from 'dotenv'
import {
  addChildCollectionItem,
  getCollectionItem,
} from '@skeet-framework/firestore'
import { User, VertexChatRoom } from '@/models'
import { getUserAuth } from '@/lib'
dotenv.config()

export const createVertexChatRoom = onRequest(
  publicHttpOption,
  async (req: TypedRequestBody<CreateVertexChatRoomParams>, res) => {
    try {
      const user = await getUserAuth(req)
      const userDoc = await getCollectionItem<User>('User', user.uid)
      if (!userDoc) throw new Error('userDoc is not found')

      const roomOptions = {
        userRef: userDoc.ref,
        title: req.body.title || '',
        model: req.body.model || 'chat-bison@001',
        maxTokens: req.body.maxTokens || 256,
        temperature: req.body.temperature || 0.2,
        topP: req.body.topP || 0.95,
        topK: req.body.topK || 40,
      }
      const chatRoom = await addChildCollectionItem<VertexChatRoom, User>(
        'User',
        'VertexChatRoom',
        user.uid,
        roomOptions,
      )

      res.json({
        status: 'success',
        data: chatRoom,
      })
    } catch (error) {
      res.status(500).json({ status: 'error', message: String(error) })
    }
  },
)
