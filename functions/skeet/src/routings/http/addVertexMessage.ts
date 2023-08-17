import { onRequest } from 'firebase-functions/v2/https'
import { publicHttpOption } from '@/routings/options'
import { TypedRequestBody } from '@/index'
import { AddVertexMessageParams } from '@/types/http/addVertexMessageParams'
import { VertexAI } from '@skeet-framework/ai'
import skeetOptions from '../../../skeetOptions.json'
import { getUserAuth } from '@/lib'
import {
  addGrandGrandChildCollectionItem,
  getChildCollectionItem,
  getCollectionItem,
  getGrandChildCollectionItem,
} from '@skeet-framework/firestore'
import {
  User,
  VertexChatRoom,
  VertexChatRoomMessage,
  VertexPrompt,
} from '@/models'
import { ChunkedStream } from '@/lib/chunk'

export const addVertexMessage = onRequest(
  publicHttpOption,
  async (req: TypedRequestBody<AddVertexMessageParams>, res) => {
    try {
      const user = await getUserAuth(req)
      const userDoc = await getCollectionItem<User>('User', user.uid)
      if (!userDoc) throw new Error('userDoc is not found')

      const vertexChatRoomDoc = await getChildCollectionItem<
        VertexChatRoom,
        User
      >('User', 'VertexChatRoom', user.uid, req.body.vertexChatRoomId)
      if (!vertexChatRoomDoc) throw new Error('vertexChatRoomDoc is not found')

      const vertexPromptDoc = await getGrandChildCollectionItem<
        VertexPrompt,
        VertexChatRoom,
        User
      >(
        'User',
        'VertexChatRoom',
        'VertexPrompt',
        user.uid,
        req.body.vertexChatRoomId,
        req.body.vertexPromptId,
      )
      if (!vertexPromptDoc) throw new Error('vertexPromptDoc is not found')

      const vertexAi = new VertexAI({
        projectId: skeetOptions.projectId,
        location: skeetOptions.region,
      })

      const response = await vertexAi.prompt({
        context: vertexPromptDoc.data.context,
        examples: vertexPromptDoc.data.examples,
        messages: [
          {
            author: 'user',
            content: req.body.content,
          },
        ],
      })
      const stream = new ChunkedStream(response)
      stream.on('data', (chunk) => {
        console.log(chunk.toString())
        res.write(JSON.stringify({ text: chunk.toString() }))
      })
      stream.on('end', async () => {
        const messageBody = {
          vertexChatRoomRef: vertexChatRoomDoc.ref,
          role: 'user',
          content: req.body.content,
        }
        await addGrandGrandChildCollectionItem<
          VertexChatRoomMessage,
          VertexPrompt,
          VertexChatRoom,
          User
        >(
          'User',
          'VertexChatRoom',
          'VertexPrompt',
          'VertexChatRoomMessage',
          user.uid,
          req.body.vertexChatRoomId,
          req.body.vertexPromptId,
          messageBody,
        )
        const messageResBody = {
          vertexChatRoomRef: vertexChatRoomDoc.ref,
          role: 'assistant',
          content: response,
        }
        await addGrandGrandChildCollectionItem<
          VertexChatRoomMessage,
          VertexPrompt,
          VertexChatRoom,
          User
        >(
          'User',
          'VertexChatRoom',
          'VertexPrompt',
          'VertexChatRoomMessage',
          user.uid,
          req.body.vertexChatRoomId,
          req.body.vertexPromptId,
          messageResBody,
        )
        res.end()
      })
      stream.on('error', (e: Error) => console.error(e))
    } catch (error) {
      res.status(500).json({ status: 'error', message: String(error) })
    }
  },
)
