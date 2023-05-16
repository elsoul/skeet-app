import { HttpsOptions } from 'firebase-functions/v2/https'
import { serviceAccount, vpcConnector, cors } from './index'

export const defaultHttpOption: HttpsOptions = {
  region: process.env.REGION || 'europe-west6',
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
}
