import { ScheduleOptions } from 'firebase-functions/v2/scheduler'
import dotenv from 'dotenv'
dotenv.config()

const appName = process.env.SKEET_APP_NAME || 'skeet-app'
const project = process.env.PROJECT_ID || 'skeet-app'
const region = process.env.REGION || 'europe-west6'
const serviceAccount = `${appName}@${project}.iam.gserviceaccount.com`
const vpcConnector = `${project}-con`

export const schedulerDefaultOption: ScheduleOptions = {
  region,
  schedule: 'every 1 hours',
  timeZone: 'UTC',
  retryCount: 3,
  maxRetrySeconds: 60,
  minBackoffSeconds: 1,
  maxBackoffSeconds: 10,
  serviceAccount,
  ingressSettings: 'ALLOW_INTERNAL_ONLY',
  vpcConnector,
  vpcConnectorEgressSettings: 'PRIVATE_RANGES_ONLY',
  timeoutSeconds: 540,
}
