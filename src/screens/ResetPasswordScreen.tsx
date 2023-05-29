import { Pressable, Text, View } from 'react-native'
import DefaultLayout from '@/layouts/default/DefaultLayout'
import tw from '@/lib/tailwind'
import { useTranslation } from 'react-i18next'
import useColorModeRefresh from '@/hooks/useColorModeRefresh'
import LogoHorizontal from '@/components/common/atoms/LogoHorizontal'
import { useNavigation } from '@react-navigation/native'
import { TextInput } from 'react-native-gesture-handler'
import { useCallback, useState } from 'react'
import Toast from 'react-native-toast-message'
import useAnalytics from '@/hooks/useAnalytics'
import Button from '@/components/common/atoms/Button'
import { emailSchema } from '@/utils/form'
import { sleep } from '@/utils/time'
import clsx from 'clsx'
import { auth } from '@/lib/firebase'
import { sendPasswordResetEmail } from 'firebase/auth'

export default function ResetPasswordScreen() {
  useColorModeRefresh()
  useAnalytics()
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const [isLoading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const validateEmail = useCallback(() => {
    try {
      emailSchema.parse(email)
      setEmailError('')
    } catch (err) {
      setEmailError('emailErrorText')
    }
  }, [email, setEmailError])

  const validate = useCallback(() => {
    validateEmail()
  }, [validateEmail])

  const resetPassword = useCallback(async () => {
    if (auth && emailError === '') {
      try {
        setLoading(true)
        await sendPasswordResetEmail(auth, email)
        Toast.show({
          type: 'success',
          text1:
            t('sentResetPasswordRequest') ?? 'Succeed Reset Password Request',
          text2: t('confirmEmail') ?? 'Check your email',
        })
        navigation.navigate('CheckEmail')
      } catch (err) {
        console.error(err)
        Toast.show({
          type: 'error',
          text1:
            t('sentResetPasswordRequest') ?? 'Succeed Reset Password Request',
          text2: t('confirmEmail') ?? 'Check your email',
        })
      } finally {
        setLoading(false)
      }
    }
  }, [navigation, t, emailError, email])

  return (
    <>
      <DefaultLayout>
        <View
          style={tw`flex h-full flex-col items-center justify-start py-12 sm:px-6 lg:px-8`}
        >
          <View style={tw`sm:mx-auto sm:w-full sm:max-w-md`}>
            <LogoHorizontal />
            <Text
              style={tw`font-loaded-bold mt-6 text-center text-3xl tracking-tight text-gray-900 dark:text-white`}
            >
              {t('resetYourPassword')}
            </Text>
            <Pressable
              onPress={() => {
                navigation.navigate('Register')
              }}
            >
              <Text
                style={tw`mt-2 text-center text-sm text-gray-600 dark:text-gray-300`}
              >
                {t('or')}{' '}
                <Text
                  style={tw`font-loaded-medium text-indigo-500 dark:text-indigo-200`}
                >
                  {t('registerYourAccount')}
                </Text>
              </Text>
            </Pressable>
          </View>
          <View style={tw`w-full sm:mx-auto sm:max-w-md`}>
            <View style={tw`px-4 py-6 sm:px-10 gap-6`}>
              <View>
                <Text
                  style={tw`text-sm font-loaded-medium leading-6 text-gray-900 dark:text-gray-50`}
                >
                  {t('email')}
                  {emailError !== '' && (
                    <Text style={tw`text-red-500 dark:text-red-300 text-xs`}>
                      {' : '}
                      {t(emailError)}
                    </Text>
                  )}
                </Text>
                <View style={tw`mt-2`}>
                  <TextInput
                    style={tw`w-full border-2 border-gray-900 dark:border-gray-50 p-3 text-lg font-loaded-bold text-gray-900 dark:text-white sm:leading-6`}
                    inputMode="email"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>
              <View>
                <Button
                  onPress={async () => {
                    validate()
                    await sleep(100)
                    resetPassword()
                  }}
                  disabled={isLoading}
                  className={clsx(
                    isLoading
                      ? 'bg-gray-300 dark:bg-gray-800 dark:text-gray-400'
                      : '',
                    'w-full px-3 py-2'
                  )}
                >
                  <Text
                    style={tw`text-center font-loaded-bold text-lg text-white dark:text-gray-900`}
                  >
                    {t('reset')}
                  </Text>
                </Button>
              </View>
            </View>
          </View>
        </View>
      </DefaultLayout>
    </>
  )
}
