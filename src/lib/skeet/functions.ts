import skeetCloudConfig from '@root/skeet-cloud.config.json'
import { toKebabCase } from '@/utils/character'
import { auth, platformDevIP, functions } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import { httpsCallable, httpsCallableFromURL } from 'firebase/functions'

export const fetchSkeetFunctions = async <T>(
  functionName: string,
  methodName: string,
  params: T
) => {
  try {
    const url =
      process.env.NODE_ENV === 'production'
        ? skeetCloudConfig.app.hasLoadBalancer
          ? `https://${
              skeetCloudConfig.app.lbDomain
            }/${functionName}/${toKebabCase(methodName)}`
          : `https://${skeetCloudConfig.app.region}-${skeetCloudConfig.app.fbProjectId}.cloudfunctions.net/${methodName}`
        : `http://${platformDevIP}:5001/${skeetCloudConfig.app.fbProjectId}/${skeetCloudConfig.app.region}/${methodName}`
    const skeetToken = await auth?.currentUser?.getIdToken()
    const res = await fetch(`${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${skeetToken}`,
      },
      body: JSON.stringify(params),
    })
    return res
  } catch (err) {
    console.error(err)
    if (
      err instanceof Error &&
      (err.message.includes('Firebase ID token has expired.') ||
        err.message.includes('Error: getUserAuth'))
    ) {
      if (auth) {
        await signOut(auth)
      }
    }
  }
}

export const callSkeetFunctions = async <T>(
  functionName: string,
  methodName: string,
  params: T
) => {
  try {
    const callableFunction =
      process.env.NODE_ENV === 'production' &&
      skeetCloudConfig.app.hasLoadBalancer
        ? functions
          ? httpsCallableFromURL(
              functions,
              `https://${
                skeetCloudConfig.app.lbDomain
              }/${functionName}/${toKebabCase(methodName)}`
            )
          : undefined
        : functions
        ? httpsCallable(functions, methodName)
        : undefined

    const res = await callableFunction?.(params)
    return res
  } catch (err: any) {
    console.error(err)
    throw new Error(err.message)
  }
}
