import { onRequest } from 'firebase-functions/v2/https'
import { publicHttpOption } from '@/routings/options'
import { TypedRequestBody } from '@/index'
import { AddVertexPromptParams } from '@/types/http/addVertexPromptParams'
import {
  addGrandChildCollectionItem,
  getChildCollectionItem,
  getCollectionItem,
} from '@skeet-framework/firestore'
import { User, VertexChatRoom, VertexPrompt } from '@/models'
import { getUserAuth } from '@/lib'

export const addVertexPrompt = onRequest(
  publicHttpOption,
  async (req: TypedRequestBody<AddVertexPromptParams>, res) => {
    try {
      const user = await getUserAuth(req)
      const userDoc = await getCollectionItem<User>('User', user.uid)
      if (!userDoc) throw new Error('userDoc is not found')

      const vertexChatRoomDoc = await getChildCollectionItem<
        User,
        VertexChatRoom
      >('User', 'VertexChatRoom', user.uid, req.body.vertexChatRoomId)
      if (!vertexChatRoomDoc) throw new Error('vertexChatRoomDoc is not found')

      const vertexExampleOptions = {
        vertexChatRoomRef: vertexChatRoomDoc.ref,
        context: req.body.context,
        examples: req.body.examples,
        messages: [
          {
            author: 'user',
            content: req.body.content,
          },
        ],
      }
      const vertexExample = await addGrandChildCollectionItem<
        VertexPrompt,
        VertexChatRoom,
        User
      >(
        'User',
        'VertexChatRoom',
        'VertexPrompt',
        user.uid,
        req.body.vertexChatRoomId,
        vertexExampleOptions,
      )
      res.json({
        status: 'success',
        data: vertexExample,
      })
    } catch (error) {
      res.status(500).json({ status: 'error', message: String(error) })
    }
  },
)
