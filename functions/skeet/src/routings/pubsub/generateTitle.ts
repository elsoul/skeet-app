import { onMessagePublished } from 'firebase-functions/v2/pubsub'
import { pubsubDefaultOption } from '@/routings/options'
import { parsePubSubMessage } from '@/lib/pubsub'
import { GenerateTitleParams } from '@/types/pubsub/generateTitleParams'

export const generateTitleTopic = 'generateTitle'

export const generateTitle = onMessagePublished(
  pubsubDefaultOption(generateTitleTopic),
  async (event) => {
    try {
      const pubsubObject = parsePubSubMessage<GenerateTitleParams>(event)
      console.log({
        status: 'success',
        topic: generateTitleTopic,
        event,
        pubsubObject,
      })
    } catch (error) {
      console.error({ status: 'error', message: String(error) })
    }
  },
)
