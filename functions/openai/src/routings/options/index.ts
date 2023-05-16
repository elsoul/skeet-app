import dotenv from 'dotenv'
dotenv.config()

export * from './httpOptions'
export * from './pubsubOptions'
export * from './firestoreOptions'
export * from './schedulerOptions'

export const project = process.env.PROJECT_ID || 'skeet-example'
export const region = process.env.REGION || 'europe-west6'
export const serviceAccount = `${project}@${project}.iam.gserviceaccount.com`
export const vpcConnector = `${project}-con`
export const cors = ['http://localhost:4000', 'https://app.skeet.dev']
