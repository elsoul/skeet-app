import { atom } from 'recoil'
import ReactNativeRecoilPersist from 'react-native-recoil-persist'

export type UserState = {
  uid: string
  email: string
  username: string
  iconUrl: string
  skeetToken: string
}

export const defaultUser = {
  uid: '',
  email: '',
  username: '',
  iconUrl: '',
  skeetToken: '',
}

export const userState = atom<UserState>({
  key: 'userState',
  default: defaultUser,
  effects_UNSTABLE: [ReactNativeRecoilPersist.persistAtom],
})
