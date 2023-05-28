import tw from '@/lib/tailwind'
import { Image } from 'expo-image'
import { View } from 'react-native'

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['

export default function EditUserIconUrl() {
  return (
    <>
      <View style={tw`p-8`}>
        <Image
          source={`${'https://www.gravatar.com/avatar/14850fd9725c6e36a6642a4155005b82?d=retro'}`}
          placeholder={blurhash}
          contentFit="cover"
          style={tw`w-10 h-10 rounded-full`}
        />
      </View>
    </>
  )
}
