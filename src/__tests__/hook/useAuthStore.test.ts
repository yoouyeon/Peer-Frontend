import axios from 'axios'
import { act, renderHook } from '@testing-library/react'
import useAuthStore from '@/states/useAuthStore'
import useNicknameStore from '@/states/useNicknameStore'
import { MOCK_ACCESS_TOKEN } from '@/mocks/constants'
import API_PATH from '@/constant/apiPath'

describe('useAuthStore', () => {
  const renderUseAuthStore = () => {
    return renderHook(() => useAuthStore())
  }

  let getItemSpy: jest.SpyInstance
  let setItemSpy: jest.SpyInstance
  let removeItemSpy: jest.SpyInstance
  let axiosGetSpy: jest.SpyInstance
  let setNicknameSpy: jest.SpyInstance
  let unsetNicknameSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()

    getItemSpy = jest.spyOn(Storage.prototype, 'getItem')
    setItemSpy = jest.spyOn(Storage.prototype, 'setItem')
    removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem')
    getItemSpy.mockReturnValue(null)

    // axios.get을 모킹
    axiosGetSpy = jest.spyOn(axios, 'get')

    // useNicknameStore의 setNickname과 unsetNickname을 모킹
    setNicknameSpy = jest.spyOn(useNicknameStore.getState(), 'setNickname')
    unsetNicknameSpy = jest.spyOn(useNicknameStore.getState(), 'unsetNickname')
  })

  describe('초기 상태', () => {
    test('로컬스토리지에 값이 없는 경우의 초깃값', () => {
      // 로컬스토리지에 값이 없는 경우
      getItemSpy.mockReturnValue(null)
      const { result } = renderUseAuthStore()

      expect(result.current.isLogin).toBe(false)
      expect(result.current.accessToken).toBeNull()
    })

    test('로컬스토리지에 값이 있는 경우의 초깃값', () => {
      // 기존에 저장된 로그인 상태가 있는 경우
      getItemSpy.mockReturnValue(
        JSON.stringify({ accessToken: MOCK_ACCESS_TOKEN }),
      )
      const { result } = renderUseAuthStore()

      expect(result.current.isLogin).toBe(true)
      expect(result.current.accessToken).toBe(MOCK_ACCESS_TOKEN)
    })
  })

  describe('로그인', () => {
    test('상태가 올바르게 변경된다.', () => {
      const { result } = renderUseAuthStore()
      const login = result.current.login

      act(() => login(MOCK_ACCESS_TOKEN))

      expect(result.current.isLogin).toBe(true)
      expect(result.current.accessToken).toBe(MOCK_ACCESS_TOKEN)
    })
    test('로컬스토리지에 access token을 저장한다.', () => {
      const { result } = renderUseAuthStore()
      const login = result.current.login

      act(() => login(MOCK_ACCESS_TOKEN))

      expect(setItemSpy).toHaveBeenCalledWith(
        'authData',
        JSON.stringify({ accessToken: MOCK_ACCESS_TOKEN }),
      )
    })
    test('프로필 조회 API를 호출한다', () => {
      const { result } = renderUseAuthStore()
      const login = result.current.login

      act(() => login(MOCK_ACCESS_TOKEN))

      expect(axiosGetSpy).toHaveBeenCalledWith(API_PATH.profile.get, {
        headers: {
          Authorization: `Bearer ${MOCK_ACCESS_TOKEN}`,
        },
      })
    })
    test('닉네임 스토어에 조회한 닉네임을 저장한다', async () => {
      const { result } = renderUseAuthStore()
      const login = result.current.login
      const MOCK_NICKNAME = 'testNickname'
      axiosGetSpy.mockResolvedValue({
        data: { nickname: MOCK_NICKNAME },
      })

      await act(() => login(MOCK_ACCESS_TOKEN))

      expect(setNicknameSpy).toHaveBeenCalledWith(MOCK_NICKNAME)
    })
  })

  describe('로그아웃', () => {
    const MOCK_NICKNAME = 'testNickname'
    beforeEach(async () => {
      jest.clearAllMocks()
      // 프로필 조회와 로그아웃 API를 모킹
      axiosGetSpy
        .mockResolvedValueOnce({ data: { nickname: MOCK_NICKNAME } }) // 프로필 API 응답
        .mockResolvedValueOnce({ data: { message: 'Logged out' } }) // 로그아웃 API 응답

      // 로그인 상태로 설정
      const { result } = renderUseAuthStore()
      const login = result.current.login
      await act(() => login(MOCK_ACCESS_TOKEN))
    })

    test('상태가 올바르게 변경된다.', async () => {
      const { result } = renderUseAuthStore()
      const logout = result.current.logout

      await act(() => logout())

      expect(result.current.isLogin).toBe(false)
      expect(result.current.accessToken).toBeNull()
    })
    test('로컬스토리지에서 access token을 제거한다.', async () => {
      const { result } = renderUseAuthStore()
      const logout = result.current.logout

      await act(() => logout())

      expect(removeItemSpy).toHaveBeenCalledWith('authData')
    })
    test('로그아웃 API를 호출한다', async () => {
      const { result } = renderUseAuthStore()
      const logout = result.current.logout
      const accessToken = result.current.accessToken

      await act(() => logout())

      // NOTE : accessToken이 null이 아닐 때에만 API를 호출하는데, 현재 초기 로그인 상태를 설정할 수 없어서 테스트가 정상적으로 동작하지 않음.
      expect(axiosGetSpy).toHaveBeenLastCalledWith(API_PATH.logout, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    })
    test('닉네임 스토어에 닉네임을 초기화한다', () => {
      const { result } = renderUseAuthStore()
      const logout = result.current.logout

      act(() => logout())

      expect(unsetNicknameSpy).toHaveBeenCalled()
    })
    // 리프레시 로그아웃
    test('리프레시 로그아웃 시 API를 호출하지 않는다', () => {
      const { result } = renderUseAuthStore()
      const logout = result.current.logout

      act(() => logout(true))

      expect(axiosGetSpy).not.toHaveBeenCalledWith(
        API_PATH.logout,
        expect.anything(),
      )
    })
  })
})
