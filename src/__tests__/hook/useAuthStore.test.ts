import LocalStorage from '@/states/localStorage'
import { act, renderHook } from '@testing-library/react'
import axios from 'axios'
import { createAuthStore, IDependencies } from '@/states/useAuthStore'
import useNicknameStore from '@/states/useNicknameStore'
import { MOCK_ACCESS_TOKEN, MOCK_USER_PROFILE } from '@/mocks/constants'
import API_PATH from '@/constant/apiPath'

jest.mock('@/states/localStorage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}))

describe('useAuthStore', () => {
  let setNicknameSpy: jest.SpyInstance
  let unsetNicknameSpy: jest.SpyInstance
  let axiosGetSpy: jest.SpyInstance
  let mockLocalStorage: jest.Mocked<typeof LocalStorage>

  const renderUseAuthStore = () => {
    const dependencies: IDependencies = {
      localStorage: mockLocalStorage,
      useNicknameStore,
    }
    const useMockAuthStore = createAuthStore(dependencies)

    return renderHook(() => useMockAuthStore())
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mockLocalStorage = LocalStorage as jest.Mocked<typeof LocalStorage>

    const nicknameStore = useNicknameStore.getState()
    setNicknameSpy = jest.spyOn(nicknameStore, 'setNickname')
    unsetNicknameSpy = jest.spyOn(nicknameStore, 'unsetNickname')

    axiosGetSpy = jest.spyOn(axios, 'get')
  })

  describe('초기 상태', () => {
    test('로컬스토리지에 값이 없는 경우의 초깃값', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      const { result } = renderUseAuthStore()

      expect(result.current.isLogin).toBe(false)
      expect(result.current.accessToken).toBeNull()
    })

    test('로컬스토리지에 값이 있는 경우의 초깃값', () => {
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify({ accessToken: MOCK_ACCESS_TOKEN }),
      )
      const { result } = renderUseAuthStore()

      expect(result.current.isLogin).toBe(true)
      expect(result.current.accessToken).toBe(MOCK_ACCESS_TOKEN)
    })
  })

  describe('로그인', () => {
    test('로그인 상태로 변경되고 access token이 store에 저장된다.', async () => {
      const { result } = renderUseAuthStore()
      const login = result.current.login

      await act(async () => login(MOCK_ACCESS_TOKEN))

      expect(result.current.isLogin).toBe(true)
      expect(result.current.accessToken).toBe(MOCK_ACCESS_TOKEN)
    })

    test('로컬스토리지에 access token을 저장한다.', async () => {
      const { result } = renderUseAuthStore()
      const login = result.current.login

      await act(async () => login(MOCK_ACCESS_TOKEN))

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'authData',
        JSON.stringify({ accessToken: MOCK_ACCESS_TOKEN }),
      )
    })

    test('닉네임 스토어에 조회한 닉네임을 저장한다', async () => {
      const { result } = renderUseAuthStore()
      const login = result.current.login

      await act(async () => login(MOCK_ACCESS_TOKEN))

      expect(setNicknameSpy).toHaveBeenCalledWith(MOCK_USER_PROFILE.nickname)
    })
  })

  describe('로그아웃', () => {
    beforeAll(() => {
      // 초기 로그인 상태를 설정
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify({ accessToken: MOCK_ACCESS_TOKEN }),
      )
    })

    beforeEach(async () => {
      jest.clearAllMocks()
    })

    test('로그아웃 상태로 변경되고 access token이 제거된다.', async () => {
      const { result } = renderUseAuthStore()
      const logout = result.current.logout

      await act(async () => logout())

      expect(result.current.isLogin).toBe(false)
      expect(result.current.accessToken).toBeNull()
    })

    test('로컬스토리지에서 access token을 제거한다.', async () => {
      const { result } = renderUseAuthStore()
      const logout = result.current.logout

      await act(async () => logout())

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authData')
    })

    test('로그아웃 API를 호출한다', async () => {
      const { result } = renderUseAuthStore()
      const logout = result.current.logout
      const accessToken = result.current.accessToken

      await act(async () => logout())

      expect(axiosGetSpy).toHaveBeenLastCalledWith(API_PATH.logout, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    })

    test('닉네임 스토어에 닉네임을 초기화한다', async () => {
      const { result } = renderUseAuthStore()
      const logout = result.current.logout

      await act(async () => logout())

      expect(unsetNicknameSpy).toHaveBeenCalled()
    })

    test('리프레시 로그아웃시에는 API를 호출하지 않는다', async () => {
      const { result } = renderUseAuthStore()
      const logout = result.current.logout

      await act(async () => logout(true))

      expect(axiosGetSpy).not.toHaveBeenCalledWith(
        API_PATH.logout,
        expect.anything(),
      )
    })
  })
})
