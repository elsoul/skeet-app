import { PubSubOptions } from 'firebase-functions/v2/pubsub'
import { region, serviceAccount, vpcConnector } from './index'

export const pubsubDefaultOption: (topic: string) => PubSubOptions = (
  topic
) => {
  return {
    topic,
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
  }
}
