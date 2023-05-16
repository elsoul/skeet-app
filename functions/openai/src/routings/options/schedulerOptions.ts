import { ScheduleOptions } from 'firebase-functions/v2/scheduler'
import { serviceAccount, vpcConnector } from './index'

export const schedulerDefaultOption: ScheduleOptions = {
  region: process.env.REGION || 'europe-west6',
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
}
