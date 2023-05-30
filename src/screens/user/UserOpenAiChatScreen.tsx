import { View } from 'react-native'
import UserLayout from '@/layouts/user/UserLayout'
import tw from '@/lib/tailwind'

import useColorModeRefresh from '@/hooks/useColorModeRefresh'
import useAnalytics from '@/hooks/useAnalytics'
import ChatMenu from '@/components/screens/user/openAiChat/ChatMenu'
import ChatBox from '@/components/screens/user/openAiChat/ChatBox'
import { useState } from 'react'

export default function UserOpenAiChatScreen() {
  useColorModeRefresh()
  useAnalytics()

  const [isNewChatModalOpen, setNewChatModalOpen] = useState(false)
  const [currentChatRoomId, setCurrentChatRoomId] = useState<string | null>(
    null
  )
  return (
    <>
      <UserLayout>
        <View style={tw`flex flex-col items-start justify-start sm:flex-row`}>
          <ChatMenu
            isNewChatModalOpen={isNewChatModalOpen}
            setNewChatModalOpen={setNewChatModalOpen}
            currentChatRoomId={currentChatRoomId}
            setCurrentChatRoomId={setCurrentChatRoomId}
          />
          <ChatBox
            setNewChatModalOpen={setNewChatModalOpen}
            currentChatRoomId={currentChatRoomId}
          />
        </View>
      </UserLayout>
    </>
  )
}
