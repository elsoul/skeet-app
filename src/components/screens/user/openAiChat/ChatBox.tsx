import tw from '@/lib/tailwind'
import clsx from 'clsx'
import { View, Text, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import {
  PaperAirplaneIcon,
  PencilSquareIcon,
  PlusCircleIcon,
  XMarkIcon,
} from 'react-native-heroicons/outline'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { userState } from '@/store/user'
import { auth, db } from '@/lib/firebase'
import { orderBy } from 'firebase/firestore'
import { ScrollView, TextInput } from 'react-native-gesture-handler'
import { chatContentSchema, getGptChatModelName } from '@/utils/form'
import Toast from 'react-native-toast-message'
import { fetchSkeetFunctions } from '@/lib/skeet/functions'
import { Image } from 'expo-image'
import { blurhash } from '@/utils/placeholder'
import { ChatRoom } from './ChatMenu'
import { AddStreamUserChatRoomMessageParams } from '@/types/http/skeet/addStreamUserChatRoomMessageParams'
import CodeEditor, {
  CodeEditorSyntaxStyles,
} from '@rivascva/react-native-code-editor'
import { signOut } from 'firebase/auth'
import { TextDecoder } from 'text-encoding'
import {
  UserChatRoom,
  UserChatRoomMessage,
  genUserChatRoomPath,
  genUserChatRoomMessagePath,
} from '@/types/models'
import { Timestamp } from '@skeet-framework/firestore'
import { get, query } from '@/lib/skeet/firestore'

type ChatMessage = {
  id: string
  role: string
  createdAt: Timestamp | undefined
  updatedAt: Timestamp | undefined
  content: string
  viewWithCodeEditor: boolean
}

type Props = {
  setNewChatModalOpen: (_value: boolean) => void
  currentChatRoomId: string | null
  getChatRooms: () => void
}

export default function ChatBox({
  setNewChatModalOpen,
  currentChatRoomId,
  getChatRooms,
}: Props) {
  const { t } = useTranslation()
  const user = useRecoilValue(userState)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null)
  const scrollViewRef = useRef<ScrollView>(null)
  const scrollToEnd = useCallback(() => {
    if (currentChatRoomId) {
      scrollViewRef.current?.scrollToEnd({ animated: false })
    }
  }, [scrollViewRef, currentChatRoomId])
  const [isFirstMessage, setFirstMessage] = useState(true)

  const getChatRoom = useCallback(async () => {
    if (db && user.uid && currentChatRoomId) {
      try {
        const data = await get<UserChatRoom>(
          db,
          genUserChatRoomPath(user.uid),
          currentChatRoomId
        )
        if (data.title !== '') {
          setFirstMessage(false)
        }
        setChatRoom(data as ChatRoom)
      } catch (e) {
        console.error(e)
      }
    }
  }, [currentChatRoomId, user.uid])

  useEffect(() => {
    void (async () => {
      try {
        await getChatRoom()
      } catch (e) {
        console.error(e)
      }
    })()
  }, [getChatRoom])

  const [isSending, setSending] = useState(false)

  const getUserChatRoomMessage = useCallback(async () => {
    if (db && user.uid && currentChatRoomId) {
      const querySnapshot = await query<UserChatRoomMessage>(
        db,
        genUserChatRoomMessagePath(user.uid, currentChatRoomId),
        [orderBy('createdAt', 'asc')]
      )
      const messages: ChatMessage[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        messages.push({
          id: doc.id,
          viewWithCodeEditor: false,
          ...data,
        } as ChatMessage)
      })
      setChatMessages(messages)
    }
  }, [currentChatRoomId, user.uid])

  useEffect(() => {
    void (async () => {
      try {
        await getUserChatRoomMessage()
      } catch (e) {
        console.error(e)
      }
    })()
  }, [getUserChatRoomMessage])

  useEffect(() => {
    if (chatMessages.length > 0) {
      scrollToEnd()
    }
  }, [chatMessages, scrollToEnd])

  const [chatContent, setChatContent] = useState<string>('')
  const chatContentLines = useMemo(() => {
    return (chatContent.match(/\n/g) || []).length + 1
  }, [chatContent])
  const [chatContentError, setChatContentError] = useState('')
  const validateChatContent = useCallback(() => {
    try {
      chatContentSchema.parse(chatContent)
      setChatContentError('')
    } catch (err) {
      setChatContentError('chatContentErrorText')
    }
  }, [chatContent, setChatContentError])

  useEffect(() => {
    if (chatContent) validateChatContent()
  }, [chatContent, validateChatContent])

  const isChatMessageDisabled = useMemo(() => {
    return isSending || chatContent == '' || chatContentError != ''
  }, [isSending, chatContent, chatContentError])

  const chatMessageSubmit = useCallback(async () => {
    try {
      if (!isChatMessageDisabled && user.uid && currentChatRoomId) {
        setSending(true)
        setChatMessages((prev) => {
          prev.push({
            id: `UserSendingMessage${new Date().toISOString()}`,
            role: 'user',
            createdAt: undefined,
            updatedAt: undefined,
            content: chatContent,
            viewWithCodeEditor: false,
          })
          prev.push({
            id: `AssistantAnsweringMessage${new Date().toISOString()}`,
            role: 'assistant',
            createdAt: undefined,
            updatedAt: undefined,
            content: '',
            viewWithCodeEditor: false,
          })
          return [...prev]
        })
        const res =
          await fetchSkeetFunctions<AddStreamUserChatRoomMessageParams>(
            'skeet',
            'addStreamUserChatRoomMessage',
            {
              userChatRoomId: currentChatRoomId,
              content: chatContent,
              isFirstMessage,
            }
          )
        const reader = await res?.body?.getReader()
        const decoder = new TextDecoder('utf-8')

        const readChunk = async () => {
          return reader?.read().then(({ value, done }): any => {
            try {
              if (!done) {
                const dataString = decoder.decode(value)
                if (dataString != 'Stream done') {
                  const regex = /({"text":".*?"})/g
                  const matches = dataString.match(regex)
                  let text = ''

                  if (matches) {
                    matches.forEach((match) => {
                      try {
                        const json = JSON.parse(match)
                        text = text.concat(json.text)
                      } catch (e) {
                        console.error('JSON parse error: ', e)
                      }
                    })
                  }
                  const data = { text }
                  setChatMessages((prev) => {
                    prev[prev.length - 1].content =
                      prev[prev.length - 1].content + data.text
                    return [...prev]
                  })
                }
              } else {
                // done
              }
            } catch (error) {
              console.log(error)
            }
            if (!done) {
              return readChunk()
            }
          })
        }
        await readChunk()

        if (chatRoom && chatRoom.title == '') {
          await getChatRoom()
          await getChatRooms()
        }
        await getUserChatRoomMessage()
        setChatContent('')
        setFirstMessage(false)
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
        if (auth) {
          await signOut(auth)
        }
      } else {
        Toast.show({
          type: 'error',
          text1: t('errorTitle') ?? 'Error',
          text2:
            t('errorBody') ?? 'Something went wrong... Please try it again.',
        })
      }
    } finally {
      setSending(false)
    }
  }, [
    isChatMessageDisabled,
    t,
    chatContent,
    currentChatRoomId,
    user.uid,
    setFirstMessage,
    isFirstMessage,
    chatRoom,
    getChatRoom,
    getUserChatRoomMessage,
    getChatRooms,
  ])

  const viewWithCodeEditor = useCallback(
    (itemId: string, itemBoolean: boolean) => {
      const updatedChatMessages = [...chatMessages]
      const updatedItemIndex = updatedChatMessages.findIndex(
        (message) => message.id === itemId
      )
      if (updatedItemIndex !== -1) {
        updatedChatMessages[updatedItemIndex].viewWithCodeEditor = itemBoolean
      }
      setChatMessages(updatedChatMessages)
    },
    [chatMessages]
  )

  return (
    <>
      <View style={tw`w-full sm:flex-1 p-4`}>
        {!currentChatRoomId && (
          <View
            style={tw`h-screen-bar-xs sm:h-screen-bar bg-gray-50 dark:bg-gray-800 w-full flex flex-col items-center justify-center`}
          >
            <View
              style={tw`flex flex-col items-center justify-center gap-8 p-4`}
            >
              <Text
                style={tw`text-2xl font-loaded-bold text-gray-700 dark:text-gray-200`}
              >
                {t('openAiChat.chatGPTCustom')}
              </Text>
              <Pressable
                onPress={() => {
                  setNewChatModalOpen(true)
                }}
                style={tw`${clsx(
                  'flex flex-row items-center gap-4 justify-center px-3 py-2 bg-gray-900 dark:bg-gray-600'
                )}`}
              >
                <PlusCircleIcon style={tw`${clsx('h-6 w-6 text-white')}`} />
                <Text style={tw`font-loaded-bold text-lg text-white`}>
                  {t('openAiChat.newChat')}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
        {currentChatRoomId && (
          <View
            style={tw`h-screen-bar-xs sm:h-screen-bar w-full flex flex-col justify-between gap-4`}
          >
            <View style={tw`flex flex-1`}>
              <ScrollView ref={scrollViewRef}>
                <View style={tw`pb-24`}>
                  <View style={tw`${clsx('bg-gray-100 dark:bg-gray-700', '')}`}>
                    <View
                      style={tw`flex flex-row p-4 justify-start items-start gap-4 md:gap-8 w-full max-w-3xl mx-auto`}
                    >
                      {chatRoom?.model === 'gpt-3.5-turbo' && (
                        <View style={tw`flex`}>
                          <Image
                            source={
                              'https://storage.googleapis.com/epics-bucket/BuidlersCollective/Jake.png'
                            }
                            placeholder={blurhash}
                            contentFit="cover"
                            style={tw`w-6 h-6 sm:w-10 sm:h-10 rounded-full aspect-square`}
                          />
                        </View>
                      )}
                      {chatRoom?.model.includes('gpt-4') && (
                        <View style={tw`flex`}>
                          <Image
                            source={
                              'https://storage.googleapis.com/epics-bucket/BuidlersCollective/Legend.png'
                            }
                            placeholder={blurhash}
                            contentFit="cover"
                            style={tw`w-6 h-6 sm:w-10 sm:h-10 rounded-full aspect-square`}
                          />
                        </View>
                      )}

                      <View style={tw`flex-auto`}>
                        <View style={tw`pb-2`}>
                          <Text
                            style={tw`font-loaded-bold text-gray-900 dark:text-white text-base`}
                          >
                            {chatRoom?.title ? chatRoom?.title : t('noTitle')}
                          </Text>
                          <Text
                            style={tw`font-loaded-medium text-gray-500 dark:text-gray-400 text-sm`}
                          >
                            {getGptChatModelName(chatRoom?.model)}:{' '}
                            {chatRoom?.maxTokens} {t('tokens')}
                          </Text>
                        </View>
                        <Text
                          style={tw`font-loaded-normal text-gray-900 dark:text-white`}
                        >
                          {chatRoom?.context}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {chatMessages.map((chatMessage) => (
                    <View
                      key={chatMessage.id}
                      style={tw`${clsx(
                        chatMessage.role === 'system' &&
                          'bg-gray-100 dark:bg-gray-700',
                        chatMessage.role === 'assistant' &&
                          'bg-blue-50 dark:bg-gray-800',
                        ''
                      )}`}
                    >
                      <View
                        style={tw`flex flex-row p-4 justify-start items-start gap-4 md:gap-8 w-full max-w-3xl mx-auto`}
                      >
                        {chatMessage.role === 'user' && (
                          <View style={tw`flex`}>
                            <Image
                              source={user.iconUrl === '' ? null : user.iconUrl}
                              placeholder={blurhash}
                              contentFit="cover"
                              style={tw`w-6 h-6 sm:w-10 sm:h-10 rounded-full aspect-square`}
                            />
                          </View>
                        )}
                        {(chatMessage.role === 'assistant' ||
                          chatMessage.role === 'system') &&
                          chatRoom?.model === 'gpt-3.5-turbo' && (
                            <View style={tw`flex`}>
                              <Image
                                source={
                                  'https://storage.googleapis.com/epics-bucket/BuidlersCollective/Jake.png'
                                }
                                placeholder={blurhash}
                                contentFit="cover"
                                style={tw`w-6 h-6 sm:w-10 sm:h-10 rounded-full aspect-square`}
                              />
                            </View>
                          )}
                        {(chatMessage.role === 'assistant' ||
                          chatMessage.role === 'system') &&
                          chatRoom?.model.includes('gpt-4') && (
                            <View style={tw`flex`}>
                              <Image
                                source={
                                  'https://storage.googleapis.com/epics-bucket/BuidlersCollective/Legend.png'
                                }
                                placeholder={blurhash}
                                contentFit="cover"
                                style={tw`w-6 h-6 sm:w-10 sm:h-10 rounded-full aspect-square`}
                              />
                            </View>
                          )}
                        {chatMessage.viewWithCodeEditor ? (
                          <>
                            <View style={tw`flex-auto dark:hidden w-full`}>
                              <CodeEditor
                                language="javascript"
                                style={tw`w-full`}
                                syntaxStyle={CodeEditorSyntaxStyles.github}
                                initialValue={chatMessage.content}
                              />
                            </View>
                            <View style={tw`hidden dark:flex-auto w-full`}>
                              <CodeEditor
                                language="javascript"
                                style={tw`w-full`}
                                syntaxStyle={
                                  CodeEditorSyntaxStyles.monokaiSublime
                                }
                                initialValue={chatMessage.content}
                              />
                            </View>
                          </>
                        ) : (
                          <>
                            <View style={tw`flex-auto`}>
                              {chatMessage.role === 'system' && (
                                <View style={tw`pb-2`}>
                                  <Text
                                    style={tw`font-loaded-bold text-gray-900 dark:text-white text-base`}
                                  >
                                    {chatRoom?.title
                                      ? chatRoom?.title
                                      : t('noTitle')}
                                  </Text>
                                  <Text
                                    style={tw`font-loaded-medium text-gray-500 dark:text-gray-400 text-sm`}
                                  >
                                    {getGptChatModelName(chatRoom?.model)}:{' '}
                                    {chatRoom?.maxTokens} {t('tokens')}
                                  </Text>
                                </View>
                              )}
                              <Text
                                style={tw`font-loaded-normal text-gray-900 dark:text-white`}
                              >
                                {chatMessage.content}
                              </Text>
                            </View>
                          </>
                        )}
                        <View>
                          {chatMessage.viewWithCodeEditor ? (
                            <Pressable
                              onPress={() => {
                                viewWithCodeEditor(chatMessage.id, false)
                              }}
                              style={({ pressed }) =>
                                tw`${clsx(
                                  pressed ? 'bg-gray-50 dark:bg-gray-800' : '',
                                  'w-5 h-5'
                                )}`
                              }
                            >
                              <XMarkIcon
                                style={tw`w-5 h-5 text-gray-500 dark:text-gray-400`}
                              />
                            </Pressable>
                          ) : (
                            <Pressable
                              onPress={() => {
                                viewWithCodeEditor(chatMessage.id, true)
                              }}
                              style={({ pressed }) =>
                                tw`${clsx(
                                  pressed ? 'bg-gray-50 dark:bg-gray-800' : '',
                                  'w-5 h-5'
                                )}`
                              }
                            >
                              <PencilSquareIcon
                                style={tw`w-5 h-5 text-gray-500 dark:text-gray-400`}
                              />
                            </Pressable>
                          )}
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View
              style={tw`flex flex-row gap-4 items-end w-full max-w-3xl mx-auto`}
            >
              <TextInput
                multiline
                style={tw`${clsx(
                  chatContentLines > 4
                    ? 'h-36'
                    : `h-${10 + (chatContentLines - 1) * 8}}`,
                  'flex-1 border-2 border-gray-900 p-1 dark:border-gray-50 text-sm sm:text-lg font-loaded-normal text-gray-900 dark:text-white'
                )}`}
                inputMode="text"
                value={chatContent}
                onChangeText={setChatContent}
              />
              <Pressable
                onPress={async () => {
                  await chatMessageSubmit()
                }}
                disabled={isChatMessageDisabled}
                style={tw`${clsx(
                  'flex flex-row items-center justify-center px-3 py-2 bg-gray-900 h-10 w-10',
                  isChatMessageDisabled
                    ? 'bg-gray-300 dark:bg-gray-800 dark:text-gray-400'
                    : 'dark:bg-gray-600'
                )}`}
              >
                <PaperAirplaneIcon
                  style={tw`${clsx('mx-3 h-6 w-6 flex-shrink-0 text-white')}`}
                />
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </>
  )
}
