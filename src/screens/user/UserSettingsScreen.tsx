import LanguageChanger from '@/components/utils/LanguageChanger'
import tw from '@/lib/tailwind'
import { Text, View } from 'react-native'
import ColorModeChanger from '@/components/utils/ColorModeChanger'
import useColorModeRefresh from '@/hooks/useColorModeRefresh'
import { useTranslation } from 'react-i18next'
import UserLayout from '@/layouts/user/UserLayout'
import useAnalytics from '@/hooks/useAnalytics'
import EditUserIconUrl from '@/components/screens/user/settings/EditUserIconUrl'
import EditUserProfile from '@/components/screens/user/settings/EditUserProfile'

export default function UserSettingsScreen() {
  useColorModeRefresh()
  useAnalytics()
  const { t } = useTranslation()

  return (
    <>
      <UserLayout>
        <View style={tw`h-24 w-full bg-white dark:bg-gray-900`}>
          <View
            style={tw`flex flex-row items-center justify-between p-6 md:justify-start md:gap-10`}
          >
            <View style={tw`flex flex-1`}>
              <Text
                style={tw`font-loaded-bold text-3xl text-gray-900 dark:text-gray-50`}
              >
                {t('settings.title')}
              </Text>
            </View>
            <View style={tw`flex flex-row items-center justify-end gap-6`}>
              <LanguageChanger />
              <ColorModeChanger />
            </View>
          </View>
        </View>
        <View style={tw`flex flex-col items-center justify-center`}>
          <View style={tw`flex flex-col sm:flex-row items-center max-w-md`}>
            <View style={tw`flex flex-col items-center`}>
              <EditUserIconUrl />
            </View>
            <View style={tw`flex flex-col`}>
              <EditUserProfile />
            </View>
          </View>
        </View>
      </UserLayout>
    </>
  )
}
