import tw from '@/lib/tailwind'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Text, Modal, Pressable, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import useColorModeRefresh from '@/hooks/useColorModeRefresh'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Bars3Icon, XMarkIcon } from 'react-native-heroicons/outline'
import clsx from 'clsx'
import UserMenu from './UserMenu'
import { useTranslation } from 'react-i18next'
import { userRoutes } from '@/routes/UserRoutes'
import LogoHorizontal from '@/components/common/atoms/LogoHorizontal'
import { ScrollView } from 'react-native-gesture-handler'

type Props = {
  children: ReactNode
}

export default function UserLayout({ children }: Props) {
  useColorModeRefresh()
  const navigation = useNavigation<any>()
  const route = useRoute()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <>
      <View
        style={tw`relative w-full max-h-screen max-w-full bg-white dark:bg-gray-900`}
      >
        <SafeAreaView>
          <Modal
            animationType="fade"
            visible={isMenuOpen}
            onRequestClose={() => {
              setIsMenuOpen(false)
            }}
          >
            <View style={tw`w-full h-full`}>
              <View
                style={tw`flex flex-grow flex-col bg-white pt-5 dark:bg-gray-900`}
              >
                <View
                  style={tw`flex flex-row items-center justify-center px-4`}
                >
                  <LogoHorizontal />
                  <View style={tw`flex-grow`} />
                  <Pressable
                    onPress={() => {
                      setIsMenuOpen(false)
                    }}
                    style={({ pressed }) =>
                      tw`${clsx(
                        pressed ? 'bg-gray-50 dark:bg-gray-800' : '',
                        'w-5 h-5 lg:hidden'
                      )}`
                    }
                  >
                    <XMarkIcon style={tw`w-5 h-5 dark:text-gray-50`} />
                  </Pressable>
                </View>
                <View style={tw`mt-5 flex flex-1 flex-col`}>
                  <View style={tw`flex-1 px-2 pb-4`}>
                    {userRoutes.map((item) => (
                      <Pressable
                        key={`DocLayout Menu ${item.name}`}
                        style={tw`${clsx(
                          route.name === item.name
                            ? 'bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-white'
                            : 'text-gray-700 hover:bg-gray-50 dark:text-gray-50 dark:hover:bg-gray-800',
                          'flex flex-row items-center px-2 py-2 text-sm font-medium'
                        )}`}
                        onPress={() => {
                          navigation.navigate(item.name)
                          setIsMenuOpen(false)
                        }}
                      >
                        <item.icon
                          style={tw`${clsx(
                            route.name === item.name
                              ? 'text-gray-900  dark:text-white'
                              : 'text-gray-700 dark:text-gray-50',
                            'mr-3 h-6 w-6 flex-shrink-0'
                          )}`}
                        />
                        <Text style={tw`py-2 font-loaded-medium`}>
                          {t(item.name)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </Modal>
          <View style={tw`flex flex-row max-w-full`}>
            <View
              style={tw`z-10 hidden lg:inset-y-0 lg:flex lg:w-64 lg:flex-col min-h-screen`}
            >
              <View
                style={tw`flex flex-grow flex-col bg-white pt-5 dark:bg-gray-900`}
              >
                <View style={tw`flex flex-shrink-0 items-start px-4`}>
                  <LogoHorizontal />
                </View>
                <View style={tw`mt-5 flex flex-1 flex-col`}>
                  <View style={tw`flex-1 px-2 pb-4`}>
                    {userRoutes.map((item) => (
                      <Pressable
                        key={`DocLayout Menu ${item.name}`}
                        style={tw`${clsx(
                          route.name === item.name
                            ? 'bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-white'
                            : 'text-gray-700 hover:bg-gray-50 dark:text-gray-50 dark:hover:bg-gray-800',
                          'flex flex-row items-center px-2 py-2 text-sm font-medium'
                        )}`}
                        onPress={() => {
                          navigation.navigate(item.name)
                          setIsMenuOpen(false)
                        }}
                      >
                        <item.icon
                          style={tw`${clsx(
                            route.name === item.name
                              ? 'text-gray-900  dark:text-white'
                              : 'text-gray-700 dark:text-gray-50',
                            'mr-3 h-6 w-6 flex-shrink-0'
                          )}`}
                        />
                        <Text style={tw`py-1 font-loaded-medium text-lg`}>
                          {t(item.name)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            <View style={tw`flex flex-col flex-1 max-h-screen`}>
              <View
                style={tw`flex-shrink- top-0 z-10 flex h-16 md:h-18 bg-white bg-opacity-90 dark:bg-gray-900 dark:bg-opacity-90`}
              >
                <View
                  style={tw`flex flex-row items-center justify-between p-4 lg:p-6 md:justify-start md:gap-10`}
                >
                  <View
                    style={tw`flex flex-1 flex-row gap-6 md:gap-8 items-center`}
                  >
                    <Pressable
                      onPress={() => {
                        setIsMenuOpen(true)
                      }}
                      style={({ pressed }) =>
                        tw`${clsx(
                          pressed ? 'bg-gray-50 dark:bg-gray-800' : '',
                          'w-5 h-5 lg:hidden'
                        )}`
                      }
                    >
                      <Bars3Icon style={tw`w-5 h-5 dark:text-gray-50`} />
                    </Pressable>
                    <View style={tw`flex lg:hidden`}>
                      <LogoHorizontal />
                    </View>
                  </View>
                  <View
                    style={tw`flex flex-row items-center justify-end gap-6`}
                  >
                    <UserMenu />
                  </View>
                </View>
              </View>
              <ScrollView style={tw`py-6`}>
                <View style={tw`w-full min-h-screen`}>{children}</View>
              </ScrollView>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </>
  )
}
