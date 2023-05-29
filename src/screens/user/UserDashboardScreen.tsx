import { Pressable, Text, View } from 'react-native'
import UserLayout from '@/layouts/user/UserLayout'
import tw from '@/lib/tailwind'
import { useTranslation } from 'react-i18next'
import useColorModeRefresh from '@/hooks/useColorModeRefresh'
import LogoHorizontal from '@/components/common/atoms/LogoHorizontal'
import { openUrl } from '@/utils/link'
import useAnalytics from '@/hooks/useAnalytics'

export default function UserDashboardScreen() {
  useColorModeRefresh()
  useAnalytics()
  const { t } = useTranslation()
  return (
    <>
      <UserLayout>
        <View
          style={tw`flex flex-colitems-center justify-start py-18 sm:px-6 lg:px-8`}
        >
          <View style={tw`sm:mx-auto sm:w-full sm:max-w-md`}>
            <View style={tw`mx-auto`}>
              <LogoHorizontal />
            </View>
            <Text
              style={tw`font-loaded-bold mt-6 text-center text-3xl tracking-tight text-gray-900 dark:text-white`}
            >
              {t('dashboard.title')}
            </Text>
            <Text
              style={tw`px-2 mt-2 text-center text-sm text-gray-600 dark:text-gray-300`}
            >
              {t('dashboard.sub')}
            </Text>
            <Pressable
              onPress={() => {
                openUrl('https://skeet.dev')
              }}
            >
              <Text
                style={tw`mt-2 py-2 text-center font-loaded-medium text-indigo-500 dark:text-indigo-200`}
              >
                {t('dashboard.goToDoc')}
              </Text>
            </Pressable>
          </View>
        </View>
      </UserLayout>
    </>
  )
}
