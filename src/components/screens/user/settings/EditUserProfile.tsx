import tw from '@/lib/tailwind'
import clsx from 'clsx'
import { View, Pressable, Text, Modal } from 'react-native'
import { PencilSquareIcon, XMarkIcon } from 'react-native-heroicons/outline'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import LogoHorizontal from '@/components/common/atoms/LogoHorizontal'

export default function EditUserProfile() {
  const { t } = useTranslation()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <View style={tw`p-2`}></View>
      <View style={tw`flex flex-col items-center justify-center`}>
        <Pressable
          style={tw`${clsx(
            'flex flex-row items-center px-2 py-2 text-sm font-medium text-gray-900 dark:text-gray-50'
          )}`}
          onPress={() => {
            setIsModalOpen(true)
          }}
        >
          <PencilSquareIcon style={tw`${clsx('mr-3 h-6 w-6 flex-shrink-0')}`} />
          <Text
            style={tw`py-2 font-loaded-medium text-gray-900 dark:text-gray-50`}
          >
            {t('settings.editProfile')}
          </Text>
        </Pressable>
      </View>
      <Modal
        animationType="fade"
        visible={isModalOpen}
        onRequestClose={() => {
          setIsModalOpen(false)
        }}
      >
        <View style={tw`w-full h-full flex flex-col bg-white dark:bg-gray-900`}>
          <View style={tw`flex flex-row items-center justify-center p-4`}>
            <LogoHorizontal />
            <View style={tw`flex-grow`} />
            <Pressable
              onPress={() => {
                setIsModalOpen(false)
              }}
              style={({ pressed }) =>
                tw`${clsx(
                  pressed ? 'bg-gray-50 dark:bg-gray-800' : '',
                  'w-5 h-5 lg:hidden'
                )}`
              }
            >
              <XMarkIcon style={tw`w-5 h-5 text-gray-900 dark:text-gray-50`} />
            </Pressable>
          </View>
          <View style={tw`flex flex-grow flex-col pt-10 gap-8`}>
            <Text style={tw`text-center font-loaded-bold text-lg`}>
              {t('settings.editProfile')}
            </Text>
          </View>
        </View>
      </Modal>
    </>
  )
}
