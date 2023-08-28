import { VertexChatRoom, VertexExample } from '@/models/vertexModels'
import { VertexAI } from '@skeet-framework/ai'
import skeetOptions from '../../skeetOptions.json'

export const sendToVertexAI = async (
  vertexChatRoomData: VertexChatRoom,
  vertexExampleData: VertexExample,
  content: string,
) => {
  try {
    const vertexAi = new VertexAI({
      projectId: skeetOptions.projectId,
      location: skeetOptions.region,
    })

    const examples = vertexExampleData.examples.map((example) => {
      return {
        input: { content: example.input },
        output: { content: example.output },
      }
    })

    return vertexAi.prompt({
      context: vertexChatRoomData.context,
      examples,
      messages: [
        {
          author: 'user',
          content: content,
        },
      ],
    })
  } catch (error) {
    throw new Error(`sendToVertexAI: ${error}`)
  }
}