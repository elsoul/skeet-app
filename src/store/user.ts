import { atom } from 'recoil'
import ReactNativeRecoilPersist from 'react-native-recoil-persist'

export type UserState = {
  uid: string
  email: string
  username: string
  iconUrl: string
  skeetToken: string
}

export const userState = atom<UserState>({
  key: 'userState',
  default: {
    uid: '',
    email: '',
    username: '',
    iconUrl: '',
    skeetToken: '',
  },
  effects_UNSTABLE: [ReactNativeRecoilPersist.persistAtom],
})
