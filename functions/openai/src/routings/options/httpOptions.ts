import { HttpsOptions } from 'firebase-functions/v2/https'
import skeetOptions from '../../../skeetOptions.json'

const appName = skeetOptions.name
const project = skeetOptions.projectId
const region = skeetOptions.region
const appDomain = skeetOptions.appDomain
const serviceAccount = `${appName}@${project}.iam.gserviceaccount.com`
const vpcConnector = `${appName}-con`
const cors = ['http://localhost:4000', `https://{${appDomain}}`]

export const publicHttpOption: HttpsOptions = {
  region,
  cpu: 1,
  memory: '1GiB',
  maxInstances: 100,
  minInstances: 0,
  concurrency: 1,
  timeoutSeconds: 540,
  labels: {
    skeet: 'http',
  },
}

export const privateHttpOption: HttpsOptions = {
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
  labels: {
    skeet: 'http',
  },
}
