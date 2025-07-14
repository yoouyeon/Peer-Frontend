import Login from '@/app/login/page'
import useAuthStore from '@/states/useAuthStore'
import useToast from '@/states/useToast'
import { useRouter, useSearchParams } from 'next/navigation'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  MOCK_USER_PROFILE,
  MOCK_SIGN_UP_PASSWORD,
  MOCK_VERIFY_CODE,
  MOCK_VERIFY_SEED,
} from '@/mocks/constants'
import { server } from '@/mocks/server'
import API_PATH from '@/constant/apiPath'
import { http, HttpResponse } from 'msw'
import HTTP_STATUS from '@/constant/httpStatus'

// 기본 AuthStore 상태 설정
const mockAuthStore = {
  isLogin: false,
  accessToken: null,
  login: jest.fn(),
  logout: jest.fn(),
}

jest.mock('@/states/useToast')
jest.mock('@/states/useAuthStore', () => {
  return Object.assign(
    jest.fn(() => mockAuthStore),
    { getState: jest.fn(() => mockAuthStore) },
  )
})
jest.mock('@/api/jwtToken', () => ({
  getToken: jest.fn(() => 'mock-token'),
}))

const BUTTON_LABELS = {
  LOGIN: '로그인',
}

describe('로그인 페이지', () => {
  const mockPush = jest.fn()
  const mockGetSearchParams = jest.fn()
  const mockOpenToast = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    // 라우터 모킹
    mockGetSearchParams.mockImplementation(() => null)
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: mockGetSearchParams,
    })
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
    })

    // ToastStore 모킹
    ;(useToast as any).mockReturnValue({
      openToast: mockOpenToast,
      closeToast: jest.fn(),
    })

    // AuthStore 모킹
    ;(useAuthStore as any).mockReturnValue(mockAuthStore)
  })

  const renderLoginPage = () => render(<Login />)

  const getFields = () => ({
    email: screen.getByPlaceholderText(
      '이메일을 입력하세요.',
    ) as HTMLInputElement,
    password: screen.getByPlaceholderText(
      '비밀번호를 입력하세요.',
    ) as HTMLInputElement,
  })

  const getButtons = () => ({
    login: screen.getByRole('button', { name: BUTTON_LABELS.LOGIN }),
  })

  describe('렌더링', () => {
    test('로그인 페이지가 정상적으로 랜더링된다.', () => {
      renderLoginPage()
    })

    test('로그인페이지로 리다이렉트 된 경우 토스트 메시지가 표시된다.', () => {
      mockGetSearchParams.mockImplementation(() => 'some-redirect-url')
      renderLoginPage()

      expect(mockOpenToast).toHaveBeenCalledWith({
        message: '로그인이 필요한 서비스입니다.',
        severity: 'error',
      })
    })

    test('이미 로그인된 경우 메인 페이지로 이동한다.', () => {
      // eslint-disable-next-line no-extra-semi
      ;(useAuthStore as any).mockReturnValue({
        ...mockAuthStore,
        isLogin: true,
        accessToken: 'mock-token',
      })
      renderLoginPage()
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  describe('로그인', () => {
    beforeEach(() => {
      server.use(
        http.post(API_PATH.main.get, () => {
          return HttpResponse.json(
            { code: MOCK_VERIFY_CODE, seed: MOCK_VERIFY_SEED },
            { status: HTTP_STATUS.ok },
          )
        }),
        http.post(API_PATH.main.receive, () => {
          return HttpResponse.json(
            { accessToken: 'mock-access-token' },
            { status: HTTP_STATUS.ok },
          )
        }),
      )
    })

    test('유효한 이메일과 비밀번호로 로그인하는 경우 성공한 뒤 메인 페이지로 이동한다.', async () => {
      renderLoginPage()
      const { email: userEmail } = MOCK_USER_PROFILE

      const { email, password } = getFields()
      const { login } = getButtons()
      const user = userEvent.setup()

      await user.type(email, userEmail)
      await user.type(password, MOCK_SIGN_UP_PASSWORD)
      await user.click(login)

      await waitFor(
        () => {
          expect(mockPush).toHaveBeenCalledWith('/')
        },
        {
          timeout: 2000,
        },
      )
    })

    test('입력이 유효하지 않은 경우 에러 메시지를 표시한다.', async () => {
      renderLoginPage()
      const { email: userEmail } = MOCK_USER_PROFILE

      const { email, password } = getFields()
      const { login } = getButtons()
      const user = userEvent.setup()

      await user.type(email, 'invalid-email')
      await user.type(password, MOCK_SIGN_UP_PASSWORD)
      await user.click(login)

      expect(screen.getByText('이메일 형식이 아닙니다')).toBeInTheDocument()

      await user.type(email, userEmail)
      await user.clear(password)
      await user.click(login)
      expect(screen.getByText('비밀번호를 입력해주세요')).toBeInTheDocument()
    })

    test('로그인 실패 시 에러 메시지를 표시한다.', async () => {
      server.use(
        http.post(API_PATH.main.receive, () => {
          return HttpResponse.json(
            { message: '로그인 실패' },
            { status: HTTP_STATUS.badRequest },
          )
        }),
      )
      const { email: userEmail } = MOCK_USER_PROFILE
      renderLoginPage()

      const { email, password } = getFields()
      const { login } = getButtons()
      const user = userEvent.setup()

      await user.type(email, userEmail)
      await user.type(password, MOCK_SIGN_UP_PASSWORD)
      await user.click(login)

      await waitFor(() => {
        expect(mockOpenToast).toHaveBeenCalledWith({
          message: '로그인 실패',
          severity: 'error',
        })
      })
    })
  })
})
