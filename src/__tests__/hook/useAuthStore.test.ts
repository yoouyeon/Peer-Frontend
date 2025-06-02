import { renderHook } from '@testing-library/react'
import useAuthStore from '@/states/useAuthStore'
import { MOCK_ACCESS_TOKEN } from '@/mocks/constants'
import LocalStorage from '@/states/localStorage'

jest.mock('@/states/localStorage', () => ({
  getItem: jest.fn(),
}))

describe('useAuthStore', () => {
  const renderUseAuthStore = () => {
    return renderHook(() => useAuthStore())
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('로컬스토리지에 값이 없는 경우의 초깃값', () => {
    ;(LocalStorage.getItem as jest.Mock).mockReturnValue(null)
    const { result } = renderUseAuthStore()

    expect(result.current.isLogin).toBe(false)
    expect(result.current.accessToken).toBeNull()
  })

  test('로컬스토리지에 값이 있는 경우의 초깃값', () => {
    // 기존에 저장된 로그인 상태가 있는 경우
    ;(LocalStorage.getItem as jest.Mock).mockReturnValue(
      JSON.stringify({ accessToken: MOCK_ACCESS_TOKEN }),
    )
    const { result } = renderUseAuthStore()

    expect(result.current.isLogin).toBe(true)
    expect(result.current.accessToken).toBe(MOCK_ACCESS_TOKEN)
  })
})
