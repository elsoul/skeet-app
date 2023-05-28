import tw from '@/lib/tailwind'
import { Image } from 'expo-image'
import { View } from 'react-native'

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['

export default function EditUserIconUrl() {
  return (
    <>
      <View style={tw`w-6 h-6`}>
        {/* <Image
          source={`${gravatarIconUrl('s.kishi@elsoul.nl')}`}
          placeholder={blurhash}
          contentFit="cover"
          transition={1000}
        /> */}
      </View>
    </>
  )
}
