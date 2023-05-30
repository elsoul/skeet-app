import tw from '@/lib/tailwind'
import { View } from 'react-native'

type Props = {
  setNewChatModalOpen: (_value: boolean) => void
  currentChatRoomId: string | null
}

export default function ChatBox({
  setNewChatModalOpen,
  currentChatRoomId,
}: Props) {
  return (
    <>
      <View style={tw`w-full h-full`}></View>
    </>
  )
}
