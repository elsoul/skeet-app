import tw from '@/lib/tailwind'
import clsx from 'clsx'
import { Image } from 'expo-image'
import { View, Pressable, Text } from 'react-native'
import { PencilSquareIcon } from 'react-native-heroicons/outline'
import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { doc, getDoc } from 'firebase/firestore'
import { useRecoilState } from 'recoil'
import { userState } from '@/store/user'
import { db } from '@/lib/firebase'
import { blurhash } from '@/utils/placeholder'
// import { User } from '@/types/models'

export default function EditUserIconUrl() {
  const { t } = useTranslation()
  const [user, setUser] = useRecoilState(userState)
  const [iconUrl, setIconUrl] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      if (db && user.uid !== '') {
        const docRef = doc(db, 'User', user.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setIconUrl(docSnap.data()?.iconUrl)
        } else {
          setUser({
            uid: '',
            email: '',
            username: '',
            iconUrl: '',
            skeetToken: '',
          })
        }
      }
    })()
  }, [user.uid, setUser])

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      exif: false,
      allowsMultipleSelection: false,
    })

    if (!result.canceled && result.assets[0]) {
      console.log(result.assets[0].uri)
    }
  }, [])

  return (
    <>
      <View style={tw`p-2`}>
        <Image
          source={iconUrl}
          placeholder={blurhash}
          contentFit="cover"
          style={tw`w-32 h-32 rounded-full`}
        />
      </View>
      <View style={tw`flex flex-col items-center justify-center`}>
        <Pressable
          style={tw`${clsx(
            'flex flex-row items-center px-2 py-2 text-sm font-medium text-gray-900 dark:text-gray-50'
          )}`}
          onPress={() => {
            pickImage()
          }}
        >
          <PencilSquareIcon style={tw`${clsx('mr-3 h-6 w-6 flex-shrink-0')}`} />
          <Text
            style={tw`py-2 font-loaded-medium text-gray-900 dark:text-gray-50`}
          >
            {t('settings.editIconUrl')}
          </Text>
        </Pressable>
      </View>
    </>
  )
}
