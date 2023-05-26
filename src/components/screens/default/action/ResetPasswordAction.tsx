import ActionLoading from '@/components/loading/ActionLoading'
import tw from '@/lib/tailwind'
import { View, Text } from 'react-native'
import { useCallback, useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import Toast from 'react-native-toast-message'
import { firebaseAuth } from '@/lib/firebase'
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth'
import Button from '@/components/common/atoms/Button'
import { passwordSchema } from '@/utils/form'
import LogoHorizontal from '@/components/common/atoms/LogoHorizontal'
import { TextInput } from 'react-native-gesture-handler'
import { sleep } from '@/utils/time'
import clsx from 'clsx'

type Props = {
  oobCode: string
}

export default function ResetPasswordAction({ oobCode }: Props) {
  const [isLoading, setLoading] = useState(true)
  const [isRegisterLoading, setRegisterLoading] = useState(false)
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const [email, setEmail] = useState('')

  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const validatePassword = useCallback(() => {
    try {
      passwordSchema.parse(password)
      setPasswordError('')
    } catch (err) {
      setPasswordError('passwordErrorText')
    }
  }, [password, setPasswordError])

  const validate = useCallback(() => {
    validatePassword()
  }, [validatePassword])
  const verifyEmail = useCallback(async () => {
    try {
      if (!firebaseAuth) throw new Error('firebaseAuth not initialized')
      const gotEmail = await verifyPasswordResetCode(firebaseAuth, oobCode)
      setEmail(gotEmail)
      setLoading(false)
    } catch (err) {
      console.error(err)
      Toast.show({
        type: 'error',
        text1: t('verifyErrorTitle') ?? 'Verify Error',
        text2:
          t('verifyErrorBody') ??
          'Something went wrong... Please try it again later.',
      })
      navigation.navigate('Login')
    }
  }, [navigation, t, oobCode])

  useEffect(() => {
    verifyEmail()
  }, [verifyEmail])

  const resetPassword = useCallback(async () => {
    try {
      setRegisterLoading(true)
      if (!firebaseAuth) throw new Error('firebaseAuth not initialized')
      await confirmPasswordReset(firebaseAuth, oobCode, password)
      Toast.show({
        type: 'success',
        text1: t('resetPasswordSuccessTitle') ?? 'Reset Success',
        text2:
          t('resetPasswordSuccessBody') ??
          'Something went wrong... Please try it again later.',
      })
      navigation.navigate('Login')
    } catch (err) {
      console.error(err)
      Toast.show({
        type: 'error',
        text1: t('resetPasswordErrorTitle') ?? 'Reset Error',
        text2:
          t('resetPasswordErrorBody') ??
          'Something went wrong... Please try it again later.',
      })
    } finally {
      setRegisterLoading(false)
    }
  }, [oobCode, password, t, navigation])

  if (isLoading) {
    return (
      <>
        <ActionLoading />
      </>
    )
  }

  return (
    <>
      <View style={tw`w-full h-full flex-col items-center justify-center`}>
        <View style={tw`sm:mx-auto sm:w-full sm:max-w-md`}>
          <LogoHorizontal />
          <Text
            style={tw`font-loaded-bold mt-6 text-center text-3xl tracking-tight text-gray-900 dark:text-white`}
          >
            {t('inputNewPassword')}
          </Text>
          <Text
            style={tw`font-loaded-light mt-4 text-center text-base tracking-tight text-gray-700 dark:text-gray-300`}
          >
            {email}
          </Text>
        </View>
        <View style={tw`w-full sm:mx-auto sm:max-w-md`}>
          <View style={tw`px-4 py-6 sm:px-10 gap-6`}>
            <View>
              <Text
                style={tw`text-sm font-loaded-medium leading-6 text-gray-900 dark:text-gray-50`}
              >
                {t('password')}
                {passwordError !== '' && (
                  <Text style={tw`text-red-500 dark:text-red-300 text-xs`}>
                    {' : '}
                    {t(passwordError)}
                  </Text>
                )}
              </Text>
              <View style={tw`mt-2`}>
                <TextInput
                  style={tw`w-full border-2 border-gray-900 dark:border-gray-50 p-3 text-lg font-loaded-bold text-gray-900 dark:text-white sm:leading-6`}
                  secureTextEntry={true}
                  value={password}
                  onChangeText={setPassword}
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
                  isRegisterLoading
                    ? 'bg-gray-300 dark:bg-gray-800 dark:text-gray-400'
                    : '',
                  'w-full py-2 px-3'
                )}
              >
                <Text
                  style={tw`text-center font-loaded-bold text-lg text-white dark:text-gray-900`}
                >
                  {t('register')}
                </Text>
              </Button>
            </View>
          </View>
        </View>
      </View>
    </>
  )
}
