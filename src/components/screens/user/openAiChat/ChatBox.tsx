import tw from '@/lib/tailwind'
import clsx from 'clsx'
import { View, Text, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import {
  PaperAirplaneIcon,
  PlusCircleIcon,
} from 'react-native-heroicons/outline'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRecoilState } from 'recoil'
import { defaultUser, userState } from '@/store/user'
import { db } from '@/lib/firebase'
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
import useSkeetFunctions from '@/hooks/useSkeetFunctions'
import { AddUserChatRoomMessageParams } from '@/types/http/openai/addUserChatRoomMessageParams'
import { Image } from 'expo-image'
import { blurhash } from '@/utils/placeholder'
import { ChatRoom } from './ChatMenu'

type ChatMessage = {
  id: string
  role: string
  createdAt: string
  updatedAt: string
  content: string
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
  const [user, setUser] = useRecoilState(userState)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null)
  const getChatRoom = useCallback(async () => {
    if (db && user.uid && currentChatRoomId) {
      const docRef = doc(
        db,
        `User/${user.uid}/UserChatRoom/${currentChatRoomId}`
      )
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data()
        setChatRoom({ id: docSnap.id, ...data } as ChatRoom)
      } else {
        console.log('No such document!')
      }
    }
  }, [currentChatRoomId, user.uid])
  useEffect(() => {
    getChatRoom()
  }, [getChatRoom])

  const [isAnswering, setIsAnswering] = useState(false)
  const fetcher = useSkeetFunctions()

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
          messages.push({ id: doc.id, ...data } as ChatMessage)
        })
        if (messages[messages.length - 1]?.role === 'assistant') {
          setIsAnswering(false)
        }
        setChatMessages(messages)
      })
      return () => unsubscribe()
    }
  }, [user.uid, currentChatRoomId])

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
    return isAnswering || chatContent == '' || chatContentError != ''
  }, [isAnswering, chatContent, chatContentError])

  const chatMessageSubmit = useCallback(async () => {
    try {
      if (!isChatMessageDisabled && user.uid && currentChatRoomId) {
        setIsAnswering(true)
        const res = await fetcher<AddUserChatRoomMessageParams>(
          'openai',
          'addUserChatRoomMessage',
          {
            userChatRoomId: currentChatRoomId,
            content: chatContent,
          }
        )
        if (res.status == 'error') {
          throw new Error(res.message)
        }
        setChatContent('')
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
    }
  }, [
    isChatMessageDisabled,
    fetcher,
    t,
    setUser,
    chatContent,
    currentChatRoomId,
    user.uid,
  ])

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
              <ScrollView>
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
                      <View>
                        <Image
                          source={user.iconUrl === '' ? null : user.iconUrl}
                          placeholder={blurhash}
                          contentFit="cover"
                          style={tw`w-6 h-6 sm:w-10 sm:h-10 rounded-full aspect-square`}
                        />
                      </View>
                    )}
                    {chatMessage.role === 'assistant' &&
                      chatRoom?.model === 'gpt-3.5-turbo' && (
                        <View>
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
                    {chatMessage.role === 'assistant' &&
                      chatRoom?.model === 'gpt-4' && (
                        <View>
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

                    <Text
                      style={tw`font-loaded-normal text-gray-900 dark:text-white w-full`}
                    >
                      {chatMessage.content}
                    </Text>
                  </View>
                ))}
                {isAnswering && (
                  <View
                    style={tw`${clsx(
                      'bg-blue-50 dark:blue-800',
                      'flex flex-row p-4 justify-start items-start gap-4 md:gap-8'
                    )}`}
                  >
                    {chatRoom?.model === 'gpt-3.5-turbo' && (
                      <View>
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
                    {chatRoom?.model === 'gpt-4' && (
                      <View>
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

                    <Text
                      style={tw`font-loaded-normal text-gray-900 dark:text-white w-full`}
                    >
                      ...
                    </Text>
                  </View>
                )}
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
