import { db } from '@/index'
import { ChunkedStream } from '@/lib/chunk'
import { createFirestoreDataConverter } from '@/models/converters'
import {
  VertexChatRoomMessage,
  VertexChatRoom,
  VertexChatRoomCN,
  UserCN,
  VertexPromptCN,
  VertexChatRoomMessageRole,
} from '@/models'

export const streamResponse = async (
  response: any,
  res: any,
  user: any,
  req: any,
  vertexChatRoomData: VertexChatRoom,
) => {
  const stream = new ChunkedStream(response)

  stream.on('data', async (chunk) => {
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json')
    }
    console.log(`chunk: ${chunk}`)
    res.write(JSON.stringify({ text: chunk.toString() }))
  })

  stream.on('end', async () => {
    const messageCollectionRef = db
      .collection(
        `${UserCN}/${user.uid}/${VertexChatRoomCN}/${vertexChatRoomData.userId}/${VertexPromptCN}/${req.body.vertexPromptId}/VertexChatRoomMessage`,
      )
      .withConverter(createFirestoreDataConverter<VertexChatRoomMessage>())

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

    res.end()
  })

  stream.on('error', async (e: Error) => {
    console.error(e)
    if (!res.headersSent) {
      res.status(500).send('Stream error')
    } else {
      res.end()
    }
  })
}
