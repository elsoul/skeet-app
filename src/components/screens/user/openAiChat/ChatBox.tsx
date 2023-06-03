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
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore'
import { ScrollView, TextInput } from 'react-native-gesture-handler'
import { chatContentSchema } from '@/utils/form'
import Toast from 'react-native-toast-message'
import { fetchSkeetFunctions } from '@/lib/skeet'
import { Image } from 'expo-image'
import { blurhash } from '@/utils/placeholder'
import { ChatRoom } from './ChatMenu'
import { AddStreamUserChatRoomMessageParams } from '@/types/http/openai/addStreamUserChatRoomMessageParams'
import CodeEditor, {
  CodeEditorSyntaxStyles,
} from '@rivascva/react-native-code-editor'
import { signOut } from 'firebase/auth'

type ChatMessage = {
  id: string
  role: string
  createdAt: string
  updatedAt: string
  content: string
  viewWithCodeEditor: boolean
}

type Props = {
  setNewChatModalOpen: (_value: boolean) => void
  currentChatRoomId: string | null
}

export default function ChatBox({
  setNewChatModalOpen,
  currentChatRoomId,
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
      const docRef = doc(
        db,
        `User/${user.uid}/UserChatRoom/${currentChatRoomId}`
      )
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data()
        if (data.title !== '') {
          setFirstMessage(false)
        }
        setChatRoom({ id: docSnap.id, ...data } as ChatRoom)
      } else {
        console.log('No such document!')
      }
    }
  }, [currentChatRoomId, user.uid])
  useEffect(() => {
    getChatRoom()
  }, [getChatRoom])

  const [isSending, setSending] = useState(false)

  useEffect(() => {
    if (db && user.uid && currentChatRoomId) {
      const q = query(
        collection(
          db,
          `User/${user.uid}/UserChatRoom/${currentChatRoomId}/UserChatRoomMessage`
        ),
        orderBy('createdAt', 'asc')
      )
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
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
      })
      return () => unsubscribe()
    }
  }, [user.uid, currentChatRoomId, scrollToEnd, chatRoom, getChatRoom])

  useEffect(() => {
    if (chatMessages.length > 0) {
      scrollToEnd()
    }
  }, [chatMessages, scrollToEnd])

  const [chatContent, setChatContent] = useState<string>('')
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
        const res =
          await fetchSkeetFunctions<AddStreamUserChatRoomMessageParams>(
            'openai',
            'addStreamUserChatRoomMessage',
            {
              userChatRoomId: currentChatRoomId,
              content: chatContent,
              isFirstMessage,
            }
          )
        if (res.status == 'error') {
          throw new Error(res.message)
        }
        if (chatRoom && chatRoom.title == '') {
          getChatRoom()
        }
        setChatContent('')
        setSending(false)
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
          signOut(auth)
        }
      } else {
        Toast.show({
          type: 'error',
          text1: t('errorTitle') ?? 'Error',
          text2:
            t('errorBody') ?? 'Something went wrong... Please try it again.',
        })
      }
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
                  'flex flex-row items-center gap-4 justify-center w-full px-3 py-2 bg-gray-900 dark:bg-gray-600'
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
                  {chatMessages.map((chatMessage) => (
                    <View
                      key={chatMessage.id}
                      style={tw`${clsx(
                        chatMessage.role === 'system' &&
                          'bg-gray-100 dark:bg-gray-700',
                        chatMessage.role === 'assistant' &&
                          'bg-blue-50 dark:bg-gray-800',
                        'flex flex-row p-4 justify-start items-start gap-4 md:gap-8'
                      )}`}
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
                        chatRoom?.model === 'gpt-4' && (
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
                          <View style={tw`flex-auto dark:hidden`}>
                            <CodeEditor
                              language="javascript"
                              syntaxStyle={CodeEditorSyntaxStyles.github}
                              initialValue={chatMessage.content}
                            />
                          </View>
                          <View style={tw`hidden dark:flex-auto`}>
                            <CodeEditor
                              language="javascript"
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
                                  {chatRoom?.model}: {chatRoom?.maxTokens}{' '}
                                  {t('tokens')}
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
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={tw`flex flex-col gap-4`}>
              <TextInput
                multiline
                style={tw`w-full border-2 border-gray-900 dark:border-gray-50 p-3 text-lg font-loaded-normal text-gray-900 dark:text-white h-24 sm:h-48`}
                inputMode="text"
                value={chatContent}
                onChangeText={setChatContent}
              />
              <Pressable
                onPress={() => {
                  chatMessageSubmit()
                }}
                disabled={isChatMessageDisabled}
                style={tw`${clsx(
                  'flex flex-row items-center justify-center w-full px-3 py-2 bg-gray-900 dark:bg-gray-600',
                  isChatMessageDisabled
                    ? 'bg-gray-300 dark:bg-gray-800 dark:text-gray-400'
                    : ''
                )}`}
              >
                <PaperAirplaneIcon
                  style={tw`${clsx('mr-3 h-6 w-6 flex-shrink-0 text-white')}`}
                />
                <Text
                  style={tw`text-center font-loaded-bold text-lg text-white`}
                >
                  {t('openAiChat.chatMessageSubmit')}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </>
  )
}
