import tw from '@/lib/tailwind'
import { Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { EllipsisVerticalIcon } from 'react-native-heroicons/outline'
import {
  Menu,
  MenuOptions,
  MenuTrigger,
  MenuOption,
} from 'react-native-popup-menu'
import { useNavigation } from '@react-navigation/native'
import useLogout from '@/hooks/useLogout'

export default function UserMenu() {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()

  const logout = useLogout()

  return (
    <>
      <Menu>
        <MenuTrigger customStyles={tw`w-6 h-6`}>
          <EllipsisVerticalIcon
            style={tw`w-5 h-5 text-gray-700 dark:text-gray-200`}
          />
        </MenuTrigger>
        <MenuOptions>
          <View style={tw`shadow-lg dark:bg-gray-900`}>
            <MenuOption
              onSelect={() => {
                navigation.navigate('Settings')
              }}
              style={tw`p-3`}
            >
              <Text
                style={{
                  ...tw`font-loaded-medium text-gray-900 dark:text-gray-50`,
                }}
              >
                {t('settings.title')}
              </Text>
            </MenuOption>
            <MenuOption
              onSelect={() => {
                logout()
              }}
              style={tw`p-3 border-t-gray-50 dark:border-t-gray-800 border-t`}
            >
              <Text
                style={{
                  ...tw`font-loaded-medium text-gray-900 dark:text-gray-50`,
                }}
              >
                {t('logout')}
              </Text>
            </MenuOption>
          </View>
        </MenuOptions>
      </Menu>
    </>
  )
}
