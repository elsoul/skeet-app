import { onMessagePublished } from 'firebase-functions/v2/pubsub'
import { pubsubDefaultOption } from '@/routings/options'

export const TOPIC_NAME = 'pubsubExample'

export const pubsubExample = onMessagePublished(
  pubsubDefaultOption(TOPIC_NAME),
  async (event) => {
    try {
      console.log({ status: 'success', topic: TOPIC_NAME, event })
    } catch (error) {
      console.error({ status: 'error', message: String(error) })
    }
  }
)
