import { userState } from '@/store/user'
import { useRecoilValue } from 'recoil'
import skeetCloudConfig from '@root/skeet-cloud.config.json'
import { toKebabCase } from '@/utils/character'
import { Platform } from 'react-native'

export default function useSkeetFunctions() {
  const { skeetToken } = useRecoilValue(userState)
  const fetcher = async <T>(
    functionName: string,
    methodName: string,
    params: T
  ) => {
    try {
      const url =
        process.env.NODE_ENV === 'production' || Platform.OS !== 'web'
          ? `https://${
              skeetCloudConfig.app.functionsDomain
            }/${functionName}/${toKebabCase(methodName)}`
          : `http://127.0.0.1:5001/${skeetCloudConfig.app.projectId}/${skeetCloudConfig.app.region}/${methodName}`
      const res = await fetch(`${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${skeetToken}`,
        },
        body: JSON.stringify(params),
      })
      return await res.json()
    } catch (err) {
      console.error(err)
      if (err instanceof Error) {
        throw new Error(err.message)
      }
    }
  }

  return fetcher
}
