import { userState } from '@/store/user'
import { useRecoilValue } from 'recoil'
import { useMemo, useEffect, useState } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import UserRoutes from './UserRoutes'
import DefaultRoutes from './DefaultRoutes'
import { NavigationContainer } from '@react-navigation/native'
import AppLoading from '@/components/loading/AppLoading'
import { useTranslation } from 'react-i18next'
import * as Linking from 'expo-linking'
import skeetCloudConfig from '@root/skeet-cloud.config.json'
import useScreens from '@/hooks/useScreens'
import { auth, UserImpl } from '@/lib/firebase'

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
  const [initializing, setInitializing] = useState(true)
  const [user, setUser] = useState()

  function onAuthStateChanged(user: UserImpl) {
    setUser(user)
    if (initializing) setInitializing(false)
  }

  useEffect(() => {
    const subscriber = auth.onAuthStateChanged(onAuthStateChanged)
    return subscriber
  }, []);
  
  const { defaultScreens, userScreens } = useScreens()

  const linking = useMemo(() => {
    return {
      prefixes: [prefix, `https://${skeetCloudConfig.app.appDomain}/`],
      config: {
        screens: {
          Default: {
            path: '',
            screens: defaultScreens,
          },
          User: {
            path: 'user',
            screens: userScreens,
          },
        },
      },
    }
  }, [defaultScreens, userScreens])

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
          initialRouteName={user ? 'User' : 'Default'}
        >
          {user && auth.currentUser.emailVerified ? (
            <Stack.Screen name="User" component={UserRoutes} />
          ) : (
            <Stack.Screen name="Default" component={DefaultRoutes} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  )
}
