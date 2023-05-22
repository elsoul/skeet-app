import { onSchedule } from 'firebase-functions/v2/scheduler'
import { schedulerDefaultOption } from '@/routings/options'

const TOPIC_NAME = 'schedulerExample'

export const schedulerExample = onSchedule(
  schedulerDefaultOption,
  async (event) => {
    try {
      console.log({ status: 'success', topic: TOPIC_NAME, event })
    } catch (error) {
      console.log({ status: 'error', message: String(error) })
    }
  }
)
