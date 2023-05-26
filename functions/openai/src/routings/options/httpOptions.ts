import { HttpsOptions } from 'firebase-functions/v2/https'
import dotenv from 'dotenv'
dotenv.config()

const appName = process.env.SKEET_APP_NAME || 'skeet-app'
const project = process.env.PROJECT_ID || 'skeet-app'
const region = process.env.REGION || 'europe-west6'
const serviceAccount = `${appName}@${project}.iam.gserviceaccount.com`
const vpcConnector = `${project}-con`
const cors = ['http://localhost:4000', 'https://app.skeet.dev']

export const defaultHttpOption: HttpsOptions = {
  region,
  cpu: 1,
  memory: '1GiB',
  maxInstances: 100,
  minInstances: 0,
  concurrency: 1,
  serviceAccount,
  ingressSettings: 'ALLOW_INTERNAL_AND_GCLB',
  vpcConnector,
  vpcConnectorEgressSettings: 'PRIVATE_RANGES_ONLY',
  cors,
  timeoutSeconds: 540,
}
