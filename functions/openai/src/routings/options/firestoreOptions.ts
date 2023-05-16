import { region, serviceAccount, vpcConnector } from './index'
import { DocumentOptions } from 'firebase-functions/v2/firestore'

export const firestoreDefaultOption: (document: string) => DocumentOptions = (
  document
) => ({
  document,
  region,
  cpu: 1,
  memory: '1GiB',
  maxInstances: 100,
  minInstances: 0,
  concurrency: 1,
  serviceAccount,
  ingressSettings: 'ALLOW_INTERNAL_ONLY',
  vpcConnector,
  vpcConnectorEgressSettings: 'PRIVATE_RANGES_ONLY',
  retry: true,
})
