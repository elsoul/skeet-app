import tw from '@/lib/tailwind'
import type { ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import useColorModeRefresh from '@/hooks/useColorModeRefresh'
import { useNavigation } from '@react-navigation/native'
import { ArrowLeftIcon } from 'react-native-heroicons/outline'
import clsx from 'clsx'
import UserMenu from './UserMenu'
import { ScrollView } from 'react-native-gesture-handler'

type Props = {
  children: ReactNode
}

export default function UserLayout({ children }: Props) {
  useColorModeRefresh()
  const navigation = useNavigation()

  return (
    <>
      <ScrollView style={tw`relative w-full h-full bg-white dark:bg-gray-900`}>
        <SafeAreaView>
          <View style={tw`h-24 w-full bg-white dark:bg-gray-900`}>
            <View
              style={tw`flex flex-row items-center justify-between p-6 md:justify-start md:gap-10`}
            >
              <View style={tw`flex flex-1`}>
                {navigation.canGoBack() && (
                  <>
                    <Pressable
                      onPress={() => {
                        navigation.goBack()
                      }}
                      style={({ pressed }) =>
                        tw`${clsx(
                          pressed ? 'bg-gray-50 dark:bg-gray-800' : '',
                          'w-5 h-5'
                        )}`
                      }
                    >
                      <ArrowLeftIcon style={tw`w-5 h-5 dark:text-gray-50`} />
                    </Pressable>
                  </>
                )}
              </View>
              <View style={tw`flex flex-row items-center justify-end gap-6`}>
                <UserMenu />
              </View>
            </View>
          </View>
          {children}
        </SafeAreaView>
      </ScrollView>
    </>
  )
}
