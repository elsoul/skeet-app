import { useRecoilCallback } from 'recoil'
import { userState } from '@/store/user'
import Toast from 'react-native-toast-message'
import { useTranslation } from 'react-i18next'

export default function useLogout() {
  const { t } = useTranslation()
  const logout = useRecoilCallback(({ reset }) => () => {
    reset(userState)
    Toast.show({
      type: 'success',
      text1: t('succeedLogout') ?? 'Succeed to sign out',
      text2: t('seeYouSoon') ?? 'See you soon👋',
    })
  })
  return logout
}
