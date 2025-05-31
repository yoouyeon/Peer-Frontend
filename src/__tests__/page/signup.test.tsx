import SignUp from '@/app/signup/page'
import { render, waitFor, screen, act, fireEvent } from '@testing-library/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import useAuthStore from '@/states/useAuthStore'
import useToast from '@/states/useToast'
import { ThemeProvider } from '@mui/material'
import { darkTheme } from '@/constant/ColorTheme'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))
jest.mock('@/states/useAuthStore')
jest.mock('@/states/useToast')

const FIELD_LABELS = {
  EMAIL: '새로운 이메일',
  AUTH_CODE: '인증코드',
  PASSWORD: '비밀번호',
  NAME: '이름',
  NICKNAME: '닉네임',
} as const

const BUTTON_LABELS = {
  SEND_CODE: '코드 전송',
  VERIFY_CODE: '인증하기',
  NEXT: '다음',
} as const

describe('회원가입 페이지', () => {
  const mockGetSearchParams = jest.fn()
  const mockOpenToast = jest.fn()
  const mockCloseToast = jest.fn()
  const mockGetLoginState = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      replace: jest.fn(),
    })
    ;(useAuthStore as any).getState = mockGetLoginState
    mockGetLoginState.mockReturnValue({ isLogin: false })
    mockGetSearchParams.mockImplementation((key: string) => {
      switch (key) {
        case 'service-agreement':
          return '2025-05-31T01:11:58.767Z'
        case 'privacy-agreement':
          return '2025-05-31T01:11:58.767Z'
        case 'social-email':
          return null
        default:
          return null
      }
    })
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: mockGetSearchParams,
    })
    ;(useToast as any).mockReturnValue({
      openToast: mockOpenToast,
      closeToast: mockCloseToast,
    })
  })

  const renderSignUpPage = async () => {
    const result = render(
      <ThemeProvider theme={darkTheme}>
        <Suspense>
          <SignUp />
        </Suspense>
      </ThemeProvider>,
    )
    await waitFor(() => {
      expect(result.container).toBeInTheDocument()
    })
    return result
  }

  const getFirstStepFields = () => ({
    email: screen.getByLabelText(FIELD_LABELS.EMAIL),
    authCode: screen.getByLabelText(FIELD_LABELS.AUTH_CODE),
    password: screen.getByLabelText(FIELD_LABELS.PASSWORD),
  })

  const getFirstStepButtons = () => ({
    sendCode: screen.getByRole('button', { name: BUTTON_LABELS.SEND_CODE }),
    verifyCode: screen.getByRole('button', { name: BUTTON_LABELS.VERIFY_CODE }),
    next: screen.getByRole('button', { name: BUTTON_LABELS.NEXT }),
  })

  const getSecondStepFields = () => ({
    name: screen.getByLabelText(FIELD_LABELS.NAME),
    nickname: screen.getByLabelText(FIELD_LABELS.NICKNAME),
  })

  describe('렌더링', () => {
    test('페이지가 정상적으로 랜더링된다.', async () => {
      await renderSignUpPage()
    })
    test('로그인 상태일 때 메인 페이지로 리다이렉트된다.', async () => {
      mockGetLoginState.mockReturnValue({ isLogin: true })

      await renderSignUpPage()

      expect(useRouter().replace).toHaveBeenCalledWith('/')
    })
    test('약관 동의 없이 접근한 경우 리다이렉트된다', async () => {
      mockGetSearchParams.mockReturnValue(null) // 약관 동의가 없는 경우

      await renderSignUpPage()

      expect(useRouter().replace).toHaveBeenCalledWith('/')
    })
  })
  describe('1단계: 이메일/인증코드/비밀번호', () => {
    describe('이메일', () => {
      test('유효한 이메일을 입력하면 인증코드가 전송된다.', async () => {
        await renderSignUpPage()
        const { email } = getFirstStepFields()
        const { sendCode } = getFirstStepButtons()

        await act(async () => {
          fireEvent.change(email, { target: { value: 'test@example.com' } })
          fireEvent.click(sendCode)
        })

        expect(email).toBeDisabled()
        expect(mockOpenToast).toHaveBeenCalledWith({
          message: expect.stringContaining('인증코드가 발송되었습니다.'),
          severity: 'info',
        })
      })
      test('잘못된 이메일 형식인 경우 에러가 표시된다.', async () => {
        await renderSignUpPage()

        const { email } = getFirstStepFields()

        await act(async () => {
          fireEvent.change(email, { target: { value: 'invalid-email' } })
        })

        // 에러 메시지가 표시되는지 확인
        const errorMessage = screen.getByText('유효한 이메일 형식이 아닙니다')
        expect(errorMessage).toBeInTheDocument()
      })
      test('잘못된 이메일을 전송하는 경우 토스트 메시지가 표시된다.', async () => {
        await renderSignUpPage()

        const { email } = getFirstStepFields()
        const { sendCode } = getFirstStepButtons()

        // 잘못된 이메일 입력
        await act(async () => {
          fireEvent.change(email, { target: { value: 'invalid-email' } })
          fireEvent.click(sendCode)
        })

        // 토스트 메시지가 표시되는지 확인
        expect(mockOpenToast).toHaveBeenCalledWith({
          message: expect.stringContaining('이메일 형식을 다시 확인해주세요.'),
          severity: 'error',
        })
      })
    })
    describe('인증코드', () => {
      test('인증코드를 입력하면 인증이 완료된다.', async () => {
        await renderSignUpPage()

        const { email, authCode } = getFirstStepFields()
        const { sendCode, verifyCode } = getFirstStepButtons()

        // 이메일 입력 후 인증 코드 전송
        await act(async () => {
          fireEvent.change(email, { target: { value: 'test@example.com' } })
          fireEvent.click(sendCode)
        })
        // 인증 코드 입력 및 인증 버튼 클릭
        await act(async () => {
          fireEvent.change(authCode, { target: { value: '123456' } })
          fireEvent.click(verifyCode)
        })

        expect(authCode).toBeDisabled()
        expect(mockOpenToast).toHaveBeenCalledWith({
          message: expect.stringContaining('인증코드가 확인되었습니다.'),
          severity: 'info',
        })
      })
      test('인증코드가 유효하지 않은 경우 에러가 표시된다.', async () => {
        await renderSignUpPage()

        const { email, authCode } = getFirstStepFields()
        const { sendCode, verifyCode } = getFirstStepButtons()

        // 이메일 입력 후 인증 코드 전송
        await act(async () => {
          fireEvent.change(email, { target: { value: 'test@example.com' } })
          fireEvent.click(sendCode)
        })
        // 인증 코드 입력 및 인증 버튼 클릭
        await act(async () => {
          fireEvent.change(authCode, { target: { value: '000000' } })
          fireEvent.click(verifyCode)
        })

        expect(mockOpenToast).toHaveBeenCalledWith({
          message: expect.stringContaining('유효하지 않은 인증코드입니다'),
          severity: 'error',
        })
      })
    })
    describe('비밀번호', () => {
      test('비밀번호가 유효한 경우 유효성 검사 항목이 모두 primary 색상으로 표시된다.', async () => {
        await renderSignUpPage()

        const { email, authCode } = getFirstStepFields()
        const { sendCode, verifyCode } = getFirstStepButtons()

        // 이메일 입력 후 인증 코드 전송
        await act(async () => {
          fireEvent.change(email, { target: { value: 'test@example.com' } })
          fireEvent.click(sendCode)
        })
        // 인증 코드 입력 및 인증 버튼 클릭
        await act(async () => {
          fireEvent.change(authCode, { target: { value: '123456' } })
          fireEvent.click(verifyCode)
        })

        const { password } = getFirstStepFields()

        // 비밀번호 입력
        await act(async () => {
          fireEvent.change(password, { target: { value: 'ValidPassword123!' } })
        })

        const validationItems = {
          대소문자: screen.getByText('대소문자'),
          최소길이: screen.getByText('최소 8자'),
          숫자: screen.getByText('숫자'),
          특수문자: screen.getByText('특수문자'),
        }

        // 모든 조건이 만족하는 경우에는 primary 색상
        Object.values(validationItems).forEach((validationItem) => {
          expect(validationItem).toHaveStyle({
            color: darkTheme.palette.primary.main,
          })
        })
      })
      test('비밀번호가 유효하지 않은 경우 유효성 검사 항목이 assistive 색상으로 표시된다.', async () => {
        await renderSignUpPage()

        const { email, authCode } = getFirstStepFields()
        const { sendCode, verifyCode } = getFirstStepButtons()

        // 이메일 입력 후 인증 코드 전송
        await act(async () => {
          fireEvent.change(email, { target: { value: 'test@example.com' } })
          fireEvent.click(sendCode)
        })
        // 인증 코드 입력 및 인증 버튼 클릭
        await act(async () => {
          fireEvent.change(authCode, { target: { value: '123456' } })
          fireEvent.click(verifyCode)
        })

        const { password } = getFirstStepFields()
        const validationItems = {
          대소문자: screen.getByText('대소문자'),
          최소길이: screen.getByText('최소 8자'),
          숫자: screen.getByText('숫자'),
          특수문자: screen.getByText('특수문자'),
        }

        // 초기에 모든 조건이 만족하지 않는 경우에는 assistive 색상
        Object.values(validationItems).forEach((validationItem) => {
          expect(validationItem).toHaveStyle({
            color: darkTheme.palette.text.assistive,
          })
        })

        // CASE 1: 대소문자 조건만 만족하는 경우
        await act(async () => {
          fireEvent.change(password, { target: { value: 'Valid' } })
        })
        expect(validationItems.대소문자).toHaveStyle({
          color: darkTheme.palette.primary.main,
        })
        expect(validationItems.최소길이).toHaveStyle({
          color: darkTheme.palette.text.assistive,
        })
        expect(validationItems.숫자).toHaveStyle({
          color: darkTheme.palette.text.assistive,
        })
        expect(validationItems.특수문자).toHaveStyle({
          color: darkTheme.palette.text.assistive,
        })

        // CASE 2: 최소길이 조건도 만족하는 경우
        await act(async () => {
          fireEvent.change(password, { target: { value: 'ValidPassword' } })
        })
        expect(validationItems.대소문자).toHaveStyle({
          color: darkTheme.palette.primary.main,
        })
        expect(validationItems.최소길이).toHaveStyle({
          color: darkTheme.palette.primary.main,
        })
        expect(validationItems.숫자).toHaveStyle({
          color: darkTheme.palette.text.assistive,
        })
        expect(validationItems.특수문자).toHaveStyle({
          color: darkTheme.palette.text.assistive,
        })

        // CASE 3: 숫자 조건도 만족하는 경우
        await act(async () => {
          fireEvent.change(password, { target: { value: 'ValidPassword1' } })
        })
        expect(validationItems.대소문자).toHaveStyle({
          color: darkTheme.palette.primary.main,
        })
        expect(validationItems.최소길이).toHaveStyle({
          color: darkTheme.palette.primary.main,
        })
        expect(validationItems.숫자).toHaveStyle({
          color: darkTheme.palette.primary.main,
        })
        expect(validationItems.특수문자).toHaveStyle({
          color: darkTheme.palette.text.assistive,
        })
      })
    })
    describe('다음 버튼', () => {
      test('모든 입력이 유효한 경우 다음 단계로 진행된다.', async () => {
        await renderSignUpPage()

        const { email, authCode, password } = getFirstStepFields()
        const { sendCode, verifyCode, next } = getFirstStepButtons()

        // 이메일 입력 후 인증 코드 전송
        await act(async () => {
          fireEvent.change(email, { target: { value: 'test@example.com' } })
          fireEvent.click(sendCode)
        })
        // 인증 코드 입력 및 인증 버튼 클릭
        await act(async () => {
          fireEvent.change(authCode, { target: { value: '123456' } })
          fireEvent.click(verifyCode)
        })
        // 비밀번호 입력 후 다음 버튼 클릭
        await act(async () => {
          fireEvent.change(password, { target: { value: 'ValidPassword1!' } })
          fireEvent.click(next)
        })

        // 다음 단계 필드가 보이는지 확인
        const { name, nickname } = getSecondStepFields()
        expect(name).toBeInTheDocument()
        expect(nickname).toBeInTheDocument()
      })
      test('입력이 유효하지 않은 경우 에러가 표시된다.', async () => {
        await renderSignUpPage()

        const { next } = getFirstStepButtons()

        // 비밀번호 입력 없이 다음 버튼 클릭
        await act(async () => {
          fireEvent.click(next)
        })

        // 에러 메시지가 표시되는지 확인
        expect(mockOpenToast).toHaveBeenCalledWith({
          message: expect.stringContaining('비밀번호를 확인해주세요'),
          severity: 'error',
        })
      })
    })
  })
  // describe('2단계: ', () => {})
})
