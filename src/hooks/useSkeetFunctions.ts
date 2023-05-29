import { userState } from '@/store/user'
import { useRecoilValue } from 'recoil'
import skeetCloudConfig from '@root/skeet-cloud.config.json'
import { toKebabCase } from '@/utils/character'

export default function useSkeetFunctions() {
  const { skeetToken } = useRecoilValue(userState)
  const fetcher = async (functionName: string, methodName: string) => {
    try {
      const url =
        process.env.NODE_ENV === 'production'
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
      })
      return await res.json()
    } catch (e) {
      console.error(e)
      throw new Error('Failed to fetch Skeet Functions')
    }
  }

  return fetcher
}
