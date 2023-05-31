import { Pressable, Text, View } from 'react-native'
import DefaultLayout from '@/layouts/default/DefaultLayout'
import tw from '@/lib/tailwind'
import { useTranslation } from 'react-i18next'
import useColorModeRefresh from '@/hooks/useColorModeRefresh'
import LogoHorizontal from '@/components/common/atoms/LogoHorizontal'
import { useNavigation } from '@react-navigation/native'
import { TextInput } from 'react-native-gesture-handler'
import { useCallback, useState, useEffect, useMemo } from 'react'
import { useRecoilState } from 'recoil'
import { defaultUser, userState } from '@/store/user'
import Toast from 'react-native-toast-message'
import useAnalytics from '@/hooks/useAnalytics'
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth'
import { emailSchema, passwordSchema } from '@/utils/form'
import { auth, db } from '@/lib/firebase'
import Button from '@/components/common/atoms/Button'
import { doc, getDoc } from 'firebase/firestore'
import clsx from 'clsx'

export default function LoginScreen() {
  useColorModeRefresh()
  useAnalytics()
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const [_user, setUser] = useRecoilState(userState)
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

  useEffect(() => {
    if (email.length > 0) validateEmail()
  }, [email, validateEmail])

  useEffect(() => {
    if (password.length > 0) validatePassword()
  }, [password, validatePassword])

  const login = useCallback(async () => {
    if (auth && emailError === '' && passwordError === '' && db) {
      try {
        setLoading(true)
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        )
        if (!userCredential.user.emailVerified) {
          await sendEmailVerification(userCredential.user)
          throw new Error('Not verified')
        }

        const fbToken = await userCredential.user.getIdToken()
        if (process.env.NODE_ENV !== 'production') {
          console.log({ fbToken })
        }

        const docRef = doc(db, 'User', userCredential.user.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setUser({
            uid: userCredential.user.uid,
            email: userCredential.user.email ?? '',
            username: docSnap.data()?.username ?? '',
            iconUrl: docSnap.data()?.iconUrl ?? '',
            skeetToken: fbToken,
          })
          Toast.show({
            type: 'success',
            text1: t('succeedLogin') ?? 'Succeed to sign in🎉',
            text2: t('howdy') ?? 'Howdy?',
          })
        } else {
          throw new Error('Not verified')
        }
      } catch (err) {
        console.error(err)
        if (err instanceof Error && err.message === 'Not verified') {
          Toast.show({
            type: 'error',
            text1: t('errorNotVerifiedTitle') ?? 'Not verified.',
            text2:
              t('errorNotVerifiedBody') ??
              'Sent email to verify. Please check your email box.',
          })
          setUser(defaultUser)
        } else {
          Toast.show({
            type: 'error',
            text1: t('errorLoginTitle') ?? 'Failed to sign in.',
            text2:
              t('errorLoginBody') ??
              'Something went wrong... Please try it again.',
          })
        }
      } finally {
        setLoading(false)
      }
    }
  }, [setUser, t, email, password, emailError, passwordError])

  const isDisabled = useMemo(
    () =>
      isLoading ||
      emailError != '' ||
      passwordError != '' ||
      email == '' ||
      password == '',
    [isLoading, emailError, passwordError, email, password]
  )

  return (
    <>
      <DefaultLayout>
        <View
          style={tw`flex h-full flex-col items-center justify-start py-12 sm:px-6 lg:px-8`}
        >
          <View style={tw`sm:mx-auto sm:w-full sm:max-w-md`}>
            <View style={tw`mx-auto`}>
              <LogoHorizontal className="w-24" />
            </View>
            <Text
              style={tw`font-loaded-bold mt-6 text-center text-3xl tracking-tight text-gray-900 dark:text-white`}
            >
              {t('loginToYourAccount')}
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

              <View style={tw`flex-row items-center`}>
                <View style={tw`flex`}></View>
                <View style={tw`flex flex-1`}>
                  <Pressable
                    onPress={() => {
                      navigation.navigate('ResetPassword')
                    }}
                  >
                    <Text
                      style={tw`px-2 text-right font-loaded-medium text-indigo-500 dark:text-indigo-200`}
                    >
                      {t('forgotYourPassword')}
                    </Text>
                  </Pressable>
                </View>
              </View>
              <View>
                <Button
                  onPress={() => {
                    login()
                  }}
                  disabled={isDisabled}
                  className={clsx(
                    isDisabled
                      ? 'bg-gray-300 dark:bg-gray-800 dark:text-gray-400'
                      : '',
                    'w-full px-3 py-2'
                  )}
                >
                  <Text
                    style={tw`text-center font-loaded-bold text-lg text-white`}
                  >
                    {t('login')}
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
