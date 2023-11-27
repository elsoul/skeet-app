import 'react-native-gesture-handler'
import '@/lib/i18n'
import { useDeviceContext } from 'twrnc'
import tw from '@/lib/tailwind'
import { useFonts } from 'expo-font'
import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
} from '@expo-google-fonts/inter'

import AppLoading from '@/components/loading/AppLoading'
import { Suspense } from 'react'
import { RecoilRoot } from 'recoil'
import { MenuProvider } from 'react-native-popup-menu'
import Toast from 'react-native-toast-message'
import { toastConfig } from '@/lib/toast'
import Routes from '@/routes/Routes'
import { LogBox } from 'react-native'
LogBox.ignoreLogs(['']) // Ignore log notification by message

export default function App() {
  useDeviceContext(tw)

  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  })

  if (!fontsLoaded) {
    return (
      <>
        <AppLoading />
      </>
    )
  }

  return (
    <>
      <Suspense fallback={<AppLoading />}>
        <RecoilRoot>
          <SkeetApp />
        </RecoilRoot>
      </Suspense>
    </>
  )
}

function SkeetApp() {
  return (
    <>
      <MenuProvider>
        <Routes />
        <Toast config={toastConfig} />
      </MenuProvider>
    </>
  )
}
