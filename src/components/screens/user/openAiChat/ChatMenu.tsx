import tw from '@/lib/tailwind'
import { Pressable, Text, View, Modal } from 'react-native'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import {
  ChatBubbleLeftIcon,
  ChevronDownIcon,
  PlusCircleIcon,
  QueueListIcon,
} from 'react-native-heroicons/outline'
import { XMarkIcon } from 'react-native-heroicons/outline'
import LogoHorizontal from '@/components/common/atoms/LogoHorizontal'
import { useCallback, useEffect, useMemo, useState } from 'react'
import useSkeetFunctions from '@/hooks/useSkeetFunctions'
import { CreateUserChatRoomParams } from '@/types/http/createUserChatRoomParams'
import Toast from 'react-native-toast-message'
import { useRecoilState } from 'recoil'
import { userState, defaultUser } from '@/store/user'
import {
  GPTModel,
  allowedGPTModel,
  gptModelSchema,
  temperatureSchema,
  maxTokensSchema,
  systemContentSchema,
} from '@/utils/form'
import {
  Menu,
  MenuOptions,
  MenuTrigger,
  MenuOption,
  MenuProvider,
} from 'react-native-popup-menu'
import { ScrollView, TextInput } from 'react-native-gesture-handler'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { format } from 'date-fns'

export type ChatRoom = {
  id: string
  createdAt: string
  updatedAt: string
  model: GPTModel
  maxTokens: number
  temperature: number
}

type Props = {
  isNewChatModalOpen: boolean
  setNewChatModalOpen: (_value: boolean) => void
  currentChatRoomId: string | null
  setCurrentChatRoomId: (_value: string | null) => void
}

export default function ChatMenu({
  isNewChatModalOpen,
  setNewChatModalOpen,
  currentChatRoomId,
  setCurrentChatRoomId,
}: Props) {
  const { t } = useTranslation()
  const [isCreateLoading, setCreateLoading] = useState(false)
  const [isChatListModalOpen, setChatListModalOpen] = useState(false)
  const fetcher = useSkeetFunctions()
  const [user, setUser] = useRecoilState(userState)

  const [chatList, setChatList] = useState<ChatRoom[]>([])

  useEffect(() => {
    if (db) {
      try {
        const q = query(
          collection(db, `User/${user.uid}/UserChatRoom`),
          orderBy('createdAt', 'desc')
        )

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const list: ChatRoom[] = []
          querySnapshot.forEach((doc) => {
            const data = doc.data()
            list.push({ id: doc.id, ...data } as ChatRoom)
          })
          setChatList(list)
        })

        return () => unsubscribe()
      } catch (err) {
        console.log(err)
        if (err instanceof Error && err.message.includes('permission-denied')) {
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
      }
    }
  }, [user.uid, setUser, t])

  const [model, setModel] = useState<GPTModel>(allowedGPTModel[0])
  const [modelError, setModelError] = useState('')
  const validateModel = useCallback(() => {
    try {
      gptModelSchema.parse(model)
      setModelError('')
    } catch (err) {
      setModelError('modelErrorText')
    }
  }, [model, setModelError])

  useEffect(() => {
    if (model.length > 0) validateModel()
  }, [model, validateModel])

  const [maxTokens, setMaxTokens] = useState('1000')
  const [maxTokensError, setMaxTokensError] = useState('')
  const validateMaxTokens = useCallback(() => {
    try {
      maxTokensSchema.parse(Number(maxTokens))
      setMaxTokensError('')
    } catch (err) {
      setMaxTokensError('maxTokensErrorText')
    }
  }, [maxTokens, setMaxTokensError])

  useEffect(() => {
    if (maxTokens) validateMaxTokens()
  }, [maxTokens, validateMaxTokens])

  const [temperature, setTemperature] = useState('0.0')
  const [temperatureError, setTemperatureError] = useState('')
  const validateTemperature = useCallback(() => {
    try {
      temperatureSchema.parse(Number(temperature))
      setTemperatureError('')
    } catch (err) {
      setTemperatureError('temperatureErrorText')
    }
  }, [temperature, setTemperatureError])

  useEffect(() => {
    if (temperature) validateTemperature()
  }, [temperature, validateTemperature])

  const [systemContent, setSystemContent] = useState<string>(
    t('openAiChat.defaultSystemContent') ??
      'This is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.'
  )
  const [systemContentError, setSystemContentError] = useState('')
  const validateSystemContent = useCallback(() => {
    try {
      systemContentSchema.parse(systemContent)
      setSystemContentError('')
    } catch (err) {
      setSystemContentError('systemContentErrorText')
    }
  }, [systemContent, setSystemContentError])

  useEffect(() => {
    if (systemContent) validateSystemContent()
  }, [systemContent, validateSystemContent])

  const isNewChatDisabled = useMemo(() => {
    return (
      isCreateLoading ||
      modelError != '' ||
      maxTokensError != '' ||
      temperatureError != '' ||
      systemContentError != '' ||
      systemContent == ''
    )
  }, [
    modelError,
    isCreateLoading,
    maxTokensError,
    temperatureError,
    systemContentError,
    systemContent,
  ])

  const newChatSubmit = useCallback(async () => {
    try {
      setCreateLoading(true)
      if (!isNewChatDisabled) {
        const res = await fetcher<CreateUserChatRoomParams>(
          'openai',
          'createUserChatRoom',
          {
            model,
            systemContent,
            maxTokens: Number(maxTokens),
            temperature: Number(temperature),
            stream: false,
          }
        )
        if (res.status == 'error') {
          throw new Error(res.message)
        }
        Toast.show({
          type: 'success',
          text1:
            t('openAiChat.chatRoomCreatedSuccessTitle') ?? 'Chat Room Created',
          text2:
            t('openAiChat.chatRoomCreatedSuccessBody') ??
            'Chat room has been created successfully.',
        })
        setCurrentChatRoomId(res.userChatRoomRef.id)
      } else {
        throw new Error('validateError')
      }
    } catch (err) {
      console.error(err)
      if (
        err instanceof Error &&
        (err.message.includes('Firebase ID token has expired.') ||
          err.message.includes('Error: getUserAuth'))
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
      setCreateLoading(false)
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
    setCreateLoading,
    isNewChatDisabled,
    setCurrentChatRoomId,
  ])

  return (
    <>
      <View
        style={tw`w-full sm:w-64 sm:h-screen-bar flex flex-col items-center justify-start`}
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
                  'h-6 w-6 flex-shrink-0 text-gray-900 dark:text-white'
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
                  'h-6 w-6 flex-shrink-0 text-gray-900 dark:text-white'
                )}`}
              />
            </Pressable>
          </View>
        </View>
        <View
          style={tw`hidden w-full p-2 sm:flex h-screen-bar-xs sm:h-screen-bar`}
        >
          <ScrollView>
            <View style={tw`flex flex-col gap-6`}>
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
                <Text
                  style={tw`text-center font-loaded-bold text-lg text-white`}
                >
                  {t('openAiChat.newChat')}
                </Text>
              </Pressable>
              <View style={tw`flex flex-col gap-3`}>
                {chatList.map((chat) => (
                  <Pressable
                    onPress={() => {
                      setCurrentChatRoomId(chat.id)
                    }}
                    key={`ChatMenu Desktop ${chat.id}`}
                    style={tw`${clsx(
                      currentChatRoomId === chat.id &&
                        'border-2 border-gray-900 dark:border-gray-50',
                      'p-2 bg-gray-50 dark:bg-gray-800 flex flex-row items-start justify-start gap-2'
                    )}`}
                  >
                    <ChatBubbleLeftIcon
                      style={tw`${clsx(
                        'h-5 w-5 flex-shrink-0 text-gray-900 dark:text-white'
                      )}`}
                    />
                    <View style={tw`flex flex-col gap-2`}>
                      <Text
                        style={tw`font-loaded-medium text-gray-900 dark:text-white`}
                      >
                        {format(
                          new Date(chat.createdAt),
                          'yyyy/MM/dd HH:mm:ss'
                        )}
                      </Text>
                      <Text
                        style={tw`font-loaded-normal text-gray-900 dark:text-white`}
                      >
                        {chat.model} ({chat.maxTokens}, {chat.temperature})
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
      <Modal
        animationType="fade"
        visible={isNewChatModalOpen}
        onRequestClose={() => {
          setNewChatModalOpen(false)
        }}
        style={tw`z-10 relative`}
      >
        <MenuProvider>
          <ScrollView>
            <View
              style={tw`w-full h-full flex flex-col bg-white dark:bg-gray-900 pb-8`}
            >
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
                  <XMarkIcon
                    style={tw`w-5 h-5 text-gray-900 dark:text-gray-50`}
                  />
                </Pressable>
              </View>
              <View style={tw`flex flex-grow flex-col gap-8`}>
                <Text style={tw`text-center font-loaded-bold text-lg`}>
                  {t('openAiChat.newChat')}
                </Text>
                <View style={tw`w-full sm:mx-auto sm:max-w-md`}>
                  <View style={tw`px-4 sm:px-10 gap-6`}>
                    <View>
                      <Text
                        style={tw`text-sm font-loaded-medium leading-6 text-gray-900 dark:text-gray-50`}
                      >
                        {t('openAiChat.model')}
                        {modelError !== '' && (
                          <Text
                            style={tw`text-red-500 dark:text-red-300 text-xs`}
                          >
                            {' : '}
                            {t(`openAiChat.${modelError}`)}
                          </Text>
                        )}
                      </Text>
                      <View style={tw`mt-2`}>
                        <Menu>
                          <MenuTrigger>
                            <View
                              style={tw`flex flex-row justify-center w-full p-3 border-2 border-gray-900 dark:border-white`}
                            >
                              <Text
                                style={tw`font-loaded-medium text-gray-900 dark:text-gray-50`}
                              >
                                {model}
                              </Text>
                              <View style={tw`flex-grow`} />
                              <ChevronDownIcon
                                style={tw`${clsx(
                                  'h-5 w-5 text-gray-900 dark:text-gray-50'
                                )}`}
                              />
                            </View>
                          </MenuTrigger>
                          <MenuOptions>
                            <View style={tw`shadow-lg dark:bg-gray-900`}>
                              {allowedGPTModel.map((allowedModel) => (
                                <MenuOption
                                  onSelect={() => {
                                    setModel(allowedModel)
                                  }}
                                  key={`Menu Option ${allowedModel}`}
                                  style={tw`p-3 border-t-gray-50 dark:border-t-gray-800 border-t`}
                                >
                                  <Text
                                    style={tw`font-loaded-medium text-gray-900 dark:text-gray-50`}
                                  >
                                    {allowedModel}
                                  </Text>
                                </MenuOption>
                              ))}
                            </View>
                          </MenuOptions>
                        </Menu>
                      </View>
                    </View>
                    <View>
                      <Text
                        style={tw`text-sm font-loaded-medium leading-6 text-gray-900 dark:text-gray-50`}
                      >
                        {t('openAiChat.maxTokens')}
                        {maxTokensError !== '' && (
                          <Text
                            style={tw`text-red-500 dark:text-red-300 text-xs`}
                          >
                            {' : '}
                            {t(`openAiChat.${maxTokensError}`)}
                          </Text>
                        )}
                      </Text>
                      <View style={tw`mt-2`}>
                        <TextInput
                          style={tw`w-full border-2 border-gray-900 dark:border-gray-50 p-3 text-lg font-loaded-bold text-gray-900 dark:text-white sm:leading-6`}
                          inputMode="numeric"
                          value={maxTokens}
                          onChangeText={setMaxTokens}
                        />
                      </View>
                    </View>
                    <View>
                      <Text
                        style={tw`text-sm font-loaded-medium leading-6 text-gray-900 dark:text-gray-50`}
                      >
                        {t('openAiChat.temperature')}
                        {temperatureError !== '' && (
                          <Text
                            style={tw`text-red-500 dark:text-red-300 text-xs`}
                          >
                            {' : '}
                            {t(`openAiChat.${temperatureError}`)}
                          </Text>
                        )}
                      </Text>
                      <View style={tw`mt-2`}>
                        <TextInput
                          style={tw`w-full border-2 border-gray-900 dark:border-gray-50 p-3 text-lg font-loaded-bold text-gray-900 dark:text-white sm:leading-6`}
                          inputMode="numeric"
                          value={temperature}
                          onChangeText={setTemperature}
                        />
                      </View>
                    </View>
                    <View>
                      <Text
                        style={tw`text-sm font-loaded-medium leading-6 text-gray-900 dark:text-gray-50`}
                      >
                        {t('openAiChat.systemContent')}
                        {systemContentError !== '' && (
                          <Text
                            style={tw`text-red-500 dark:text-red-300 text-xs`}
                          >
                            {' : '}
                            {t(`openAiChat.${systemContentError}`)}
                          </Text>
                        )}
                      </Text>
                      <View style={tw`mt-2`}>
                        <TextInput
                          multiline
                          style={tw`w-full border-2 border-gray-900 dark:border-gray-50 p-3 text-lg font-loaded-bold text-gray-900 dark:text-white sm:leading-6 h-48`}
                          inputMode="text"
                          value={systemContent}
                          onChangeText={setSystemContent}
                        />
                      </View>
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
          </ScrollView>
        </MenuProvider>
      </Modal>
      <Modal
        animationType="fade"
        visible={isChatListModalOpen}
        onRequestClose={() => {
          setChatListModalOpen(false)
        }}
      >
        <ScrollView>
          <View
            style={tw`w-full h-full flex flex-col bg-white dark:bg-gray-900 pb-12`}
          >
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
                <XMarkIcon
                  style={tw`w-5 h-5 text-gray-900 dark:text-gray-50`}
                />
              </Pressable>
            </View>
            <View style={tw`flex flex-grow flex-col gap-8`}>
              <Text style={tw`text-center font-loaded-bold text-lg`}>
                {t('openAiChat.chatList')}
              </Text>
              <View style={tw`w-full sm:mx-auto sm:max-w-md`}>
                <View style={tw`px-4 sm:px-10 gap-6`}>
                  {chatList.map((chat) => (
                    <Pressable
                      onPress={() => {
                        setCurrentChatRoomId(chat.id)
                        setChatListModalOpen(false)
                      }}
                      key={`ChatMenu Mobile ${chat.id}`}
                      style={tw`${clsx(
                        currentChatRoomId === chat.id &&
                          'border-2 border-gray-900 dark:border-gray-50',
                        'p-2 bg-gray-50 dark:bg-gray-800 flex flex-row items-start justify-start gap-2'
                      )}`}
                    >
                      <ChatBubbleLeftIcon
                        style={tw`${clsx(
                          'h-5 w-5 flex-shrink-0 text-gray-900 dark:text-white'
                        )}`}
                      />
                      <View style={tw`flex flex-col gap-2`}>
                        <Text
                          style={tw`font-loaded-medium text-gray-900 dark:text-white`}
                        >
                          {format(
                            new Date(chat.createdAt),
                            'yyyy/MM/dd HH:mm:ss'
                          )}
                        </Text>
                        <Text
                          style={tw`font-loaded-normal text-gray-900 dark:text-white`}
                        >
                          {chat.model} ({chat.maxTokens}, {chat.temperature})
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </Modal>
    </>
  )
}