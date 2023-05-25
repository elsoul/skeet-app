import { userState } from '@/store/user'
import { useRecoilValue } from 'recoil'
import { useMemo } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import UserRoutes from './UserRoutes'
import DefaultRoutes from './DefaultRoutes'
import { NavigationContainer } from '@react-navigation/native'
import AppLoading from '@/components/loading/AppLoading'
import { useTranslation } from 'react-i18next'
import * as Linking from 'expo-linking'
import appConfig from '@/config/app'

const Stack = createNativeStackNavigator()
const prefix = Linking.createURL('/')

export type RootStackParamList = {
  Action: {
    mode?: string | undefined
    oobCode?: string | undefined
  }
}

export default function Routes() {
  const { t } = useTranslation()
  const user = useRecoilValue(userState)
  const isLoggedIn = useMemo(() => {
    return user.uid !== ''
  }, [user])

  const linking = useMemo(
    () => ({
      prefixes: [prefix, `https://${appConfig.domain}/`],
      config: {
        screens: {
          Default: {
            path: '',
            screens: {
              Login: 'login',
              Register: 'register',
              ResetPassword: 'reset-password',
              CheckEmail: 'check-email',
              Action: 'action',
            },
          },
          User: {
            path: 'user',
            screens: {
              UserDashboard: 'dashboard',
              UserSettings: 'settings',
            },
          },
        },
      },
    }),
    []
  )

  return (
    <>
      <NavigationContainer
        documentTitle={{
          formatter: (_options, route) =>
            `${t(`routes.${route?.name}`)} - ${t('appTitle')}`,
        }}
        fallback={<AppLoading />}
        linking={linking}
      >
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName={isLoggedIn ? 'User' : 'Default'}
        >
          {isLoggedIn ? (
            <Stack.Screen name="User" component={UserRoutes} />
          ) : (
            <Stack.Screen name="Default" component={DefaultRoutes} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  )
}
