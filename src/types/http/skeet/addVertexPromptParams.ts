import { VertexExample } from '@skeet-framework/ai'

export type AddVertexPromptParams = {
  vertexChatRoomId: string
  context: string
  examples: VertexExample[]
  content: string
}
