import { userState } from "@/store/user"
import { useRecoilValue } from 'recoil'
import skeetCloudConfig from '@root/skeet-cloud.config.json'

export default function useSkeetFunctions(methodName: string) {
  const {skeetToken} = useRecoilValue(userState)
  const fetcher = async () => {
    try {
      const url = process.env.NODE_ENV === 'production' ? `https://${skeetCloudConfig.app.functionsDomain}` : `http://127.0.0.1:5001/${skeetCloudConfig.app.projectId}/${skeetCloudConfig.app.region}`
      const res = await fetch(`${url}/${methodName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${skeetToken}`
        }
      })
      return await res.json()
    } catch (e) {
      console.error(e)
      throw new Error('Failed to fetch Skeet Functions')
    }
  }

  return fetcher
}