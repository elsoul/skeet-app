import tw from '@/lib/tailwind'
import { Pressable, Text, View, Modal } from 'react-native'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import { PlusCircleIcon, QueueListIcon } from 'react-native-heroicons/outline'
import { XMarkIcon } from 'react-native-heroicons/outline'
import LogoHorizontal from '@/components/common/atoms/LogoHorizontal'
import { useCallback, useEffect, useMemo, useState } from 'react'
import useSkeetFunctions from '@/hooks/useSkeetFunctions'
import { CreateUserChatRoomParams } from '@/types/http/createUserChatRoomParams'
import Toast from 'react-native-toast-message'
import { useRecoilState } from 'recoil'
import { userState, defaultUser } from '@/store/user'

type Props = {
  isNewChatModalOpen: boolean
  setNewChatModalOpen: (_value: boolean) => void
  currentChatRoomId: string | null
  setCurrentChatRoomId: (_value: string | null) => void
}

type GPTModel = 'gpt-3.5-turbo' | 'gpt-4'

export default function ChatMenu({
  isNewChatModalOpen,
  setNewChatModalOpen,
}: Props) {
  const { t } = useTranslation()
  const [isChatListModalOpen, setChatListModalOpen] = useState(false)
  const fetcher = useSkeetFunctions()
  const [user, setUser] = useRecoilState(userState)

  const [chatList, setChatList] = useState([])

  const [model, setModel] = useState<GPTModel>('gpt-3.5-turbo')
  const [systemContent, setSystemContent] = useState<string>(
    'This is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.'
  )
  const [maxTokens, setMaxTokens] = useState(1000)
  const [temperature, setTemperature] = useState(0)

  useEffect(() => {}, [])

  const newChatSubmit = useCallback(async () => {
    try {
      const res = await fetcher<CreateUserChatRoomParams>(
        'openai',
        'createUserChatRoom',
        {
          model,
          systemContent,
          maxTokens,
          temperature,
          stream: false,
        }
      )
      console.log(res)
      setNewChatModalOpen(false)
      if (res.status == 'error') {
        throw new Error(res.message)
      }
    } catch (err) {
      console.error(err)
      if (
        err instanceof Error &&
        err.message.includes('Firebase ID token has expired.')
      ) {
        Toast.show({
          type: 'error',
          text1: t('errorTokenExpiredTitle') ?? 'Token Expired.',
          text2: t('errorTokenExpiredBody') ?? 'Please sign in again.',
        })
        setUser(defaultUser)
      } else {
        Toast.show({
          type: 'error',
          text1: t('errorTitle') ?? 'Error',
          text2:
            t('errorBody') ?? 'Something went wrong... Please try it again.',
        })
      }
    } finally {
      setNewChatModalOpen(false)
    }
  }, [
    setNewChatModalOpen,
    fetcher,
    model,
    systemContent,
    maxTokens,
    temperature,
    t,
    setUser,
  ])

  const isNewChatDisabled = useMemo(() => {
    return false
  }, [])

  return (
    <>
      <View
        style={tw`w-full h-full sm:w-54 flex flex-col items-center justify-center`}
      >
        <View style={tw`w-full p-4 sm:hidden`}>
          <View style={tw`flex flex-row justify-center items-center`}>
            <Pressable
              onPress={() => {
                setChatListModalOpen(true)
              }}
              style={tw`${clsx('flex flex-row items-center justify-center')}`}
            >
              <QueueListIcon
                style={tw`${clsx(
                  'h-6 w-6 flex-shrink-0 text-gray-900 dark:text-gray-white'
                )}`}
              />
            </Pressable>
            <View style={tw`flex-grow`} />
            <Text style={tw`text-center font-loaded-bold`}>
              {t('openAiChat.title')}
            </Text>
            <View style={tw`flex-grow`} />
            <Pressable
              onPress={() => {
                setNewChatModalOpen(true)
              }}
              style={tw`${clsx('flex flex-row items-center justify-center')}`}
            >
              <PlusCircleIcon
                style={tw`${clsx(
                  'h-6 w-6 flex-shrink-0 text-gray-900 dark:text-gray-white'
                )}`}
              />
            </Pressable>
          </View>
        </View>
        <View style={tw`hidden w-full p-2 sm:flex`}>
          <Pressable
            onPress={() => {
              setNewChatModalOpen(true)
            }}
            style={tw`${clsx(
              'flex flex-row items-center justify-center w-full px-3 py-2 bg-gray-900 dark:bg-gray-600'
            )}`}
          >
            <PlusCircleIcon
              style={tw`${clsx('mr-3 h-6 w-6 flex-shrink-0 text-white')}`}
            />
            <Text style={tw`text-center font-loaded-bold text-lg text-white`}>
              {t('openAiChat.newChat')}
            </Text>
          </Pressable>
        </View>
      </View>
      <Modal
        animationType="fade"
        visible={isNewChatModalOpen}
        onRequestClose={() => {
          setNewChatModalOpen(false)
        }}
      >
        <View style={tw`w-full h-full flex flex-col bg-white dark:bg-gray-900`}>
          <View style={tw`flex flex-row items-center justify-center p-4`}>
            <LogoHorizontal />
            <View style={tw`flex-grow`} />
            <Pressable
              onPress={() => {
                setNewChatModalOpen(false)
              }}
              style={({ pressed }) =>
                tw`${clsx(
                  pressed ? 'bg-gray-50 dark:bg-gray-800' : '',
                  'w-5 h-5'
                )}`
              }
            >
              <XMarkIcon style={tw`w-5 h-5 text-gray-900 dark:text-gray-50`} />
            </Pressable>
          </View>
          <View style={tw`flex flex-grow flex-col gap-8`}>
            <Text style={tw`text-center font-loaded-bold text-lg`}>
              {t('openAiChat.newChat')}
            </Text>
            <View style={tw`w-full sm:mx-auto sm:max-w-md`}>
              <View style={tw`px-4 sm:px-10 gap-6`}>
                <View>
                  {/* <Text
                    style={tw`text-sm font-loaded-medium leading-6 text-gray-900 dark:text-gray-50`}
                  >
                    {t('username')}
                    {usernameError !== '' && (
                      <Text style={tw`text-red-500 dark:text-red-300 text-xs`}>
                        {' : '}
                        {t(usernameError)}
                      </Text>
                    )}
                  </Text>
                  <View style={tw`mt-2`}>
                    <TextInput
                      style={tw`w-full border-2 border-gray-900 dark:border-gray-50 p-3 text-lg font-loaded-bold text-gray-900 dark:text-white sm:leading-6`}
                      inputMode="text"
                      value={username}
                      onChangeText={setUsername}
                    />
                  </View> */}
                </View>

                <View>
                  <Pressable
                    onPress={() => {
                      newChatSubmit()
                    }}
                    disabled={isNewChatDisabled}
                    style={tw`${clsx(
                      'flex flex-row items-center justify-center w-full px-3 py-2 bg-gray-900 dark:bg-gray-600',
                      isNewChatDisabled
                        ? 'bg-gray-300 dark:bg-gray-800 dark:text-gray-400'
                        : ''
                    )}`}
                  >
                    <PlusCircleIcon
                      style={tw`${clsx(
                        'mr-3 h-6 w-6 flex-shrink-0 text-white'
                      )}`}
                    />
                    <Text
                      style={tw`text-center font-loaded-bold text-lg text-white`}
                    >
                      {t('openAiChat.createChatRoom')}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        visible={isChatListModalOpen}
        onRequestClose={() => {
          setChatListModalOpen(false)
        }}
      >
        <View style={tw`w-full h-full flex flex-col bg-white dark:bg-gray-900`}>
          <View style={tw`flex flex-row items-center justify-center p-4`}>
            <LogoHorizontal />
            <View style={tw`flex-grow`} />
            <Pressable
              onPress={() => {
                setChatListModalOpen(false)
              }}
              style={({ pressed }) =>
                tw`${clsx(
                  pressed ? 'bg-gray-50 dark:bg-gray-800' : '',
                  'w-5 h-5'
                )}`
              }
            >
              <XMarkIcon style={tw`w-5 h-5 text-gray-900 dark:text-gray-50`} />
            </Pressable>
          </View>
          <View style={tw`flex flex-grow flex-col gap-8`}>
            <Text style={tw`text-center font-loaded-bold text-lg`}>
              {t('openAiChat.chatList')}
            </Text>
            <View style={tw`w-full sm:mx-auto sm:max-w-md`}>
              <View style={tw`px-4 sm:px-10 gap-6`}></View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  )
}
