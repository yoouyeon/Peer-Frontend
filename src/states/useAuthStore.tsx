import { create, StateCreator } from 'zustand'
import LocalStorage from './localStorage'
import axios from 'axios'
import useNicknameStore from './useNicknameStore'
import API_PATH from '@/constant/apiPath'

interface IAuthStore {
  isLogin: boolean
  accessToken: string | null
  login: (accessToken: string) => void
  logout: (isRefreshing?: boolean) => void
}

export interface IDependencies {
  localStorage: typeof LocalStorage
  useNicknameStore: typeof useNicknameStore
}

export const createAuthStore = (deps: IDependencies) => {
  const { localStorage, useNicknameStore } = deps

  // 초기 인증 데이터 로드
  const authDataJSON = localStorage.getItem('authData')
  const authData = authDataJSON
    ? JSON.parse(authDataJSON)
    : { accessToken: null }

  const stateCreator: StateCreator<IAuthStore> = (set) => ({
    isLogin: !!authData.accessToken,
    accessToken: authData.accessToken,
    login: (accessToken) => {
      const authDataToSave = { accessToken }
      LocalStorage.setItem('authData', JSON.stringify(authDataToSave))
      axios
        .get(API_PATH.profile.get, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => {
          const nickname = res.data.nickname
          useNicknameStore.getState().setNickname(nickname)
        })
        .catch(() => {})
      // set state
      set(() => ({
        isLogin: true,
        accessToken,
      }))
    },
    logout: (isRefreshing) => {
      if (authData.accessToken && isRefreshing === undefined) {
        axios
          .get(API_PATH.logout, {
            headers: {
              Authorization: `Bearer ${authData.accessToken}`,
            },
          })
          .catch(() => {
            // console.log('만료된 토큰') -- do nothing
          })
      }
      LocalStorage.removeItem('authData')
      set(() => ({
        isLogin: false,
        accessToken: null,
      }))
      useNicknameStore.getState().unsetNickname()
    },
  })

  return create<IAuthStore>(stateCreator)
}

const useAuthStore = createAuthStore({
  localStorage: LocalStorage,
  useNicknameStore,
})

export default useAuthStore
