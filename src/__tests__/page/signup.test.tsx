import { render, waitFor, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import { http, HttpResponse } from 'msw'
import SignUp from '@/app/signup/page'
import useAuthStore from '@/states/useAuthStore'
import useToast from '@/states/useToast'
import { server } from '@/mocks/server'
import { MOCK_VERIFY_CODE, MOCK_VERIFY_SEED } from '@/mocks/constants'
import { darkTheme } from '@/constant/ColorTheme'
import API_PATH from '@/constant/apiPath'
import HTTP_STATUS from '@/constant/httpStatus'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))
jest.mock('@/states/useAuthStore')
jest.mock('@/states/useToast')
jest.mock('@/api/jwtToken', () => ({
  getToken: jest.fn(() => 'mock-token'),
}))

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
  VERIFY_NICKNAME: '중복 확인',
  SIGN_UP: '가입 완료',
} as const

describe('회원가입 페이지', () => {
  const mockGetSearchParams = jest.fn()
  const mockOpenToast = jest.fn()
  const mockCloseToast = jest.fn()
  const mockGetLoginState = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
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

  const renderSignUpPage = () => {
    return render(
      <ThemeProvider theme={darkTheme}>
        <SignUp />
      </ThemeProvider>,
    )
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

  const getSecondStepButtons = () => ({
    verifyNickname: screen.getByRole('button', {
      name: BUTTON_LABELS.VERIFY_NICKNAME,
    }),
    signUp: screen.getByRole('button', { name: BUTTON_LABELS.SIGN_UP }),
  })

  describe('렌더링', () => {
    test('페이지가 정상적으로 랜더링된다.', () => {
      renderSignUpPage()
    })
    test('로그인 상태일 때 메인 페이지로 리다이렉트된다.', () => {
      mockGetLoginState.mockReturnValue({ isLogin: true })

      renderSignUpPage()

      expect(useRouter().replace).toHaveBeenCalledWith('/')
    })
    test('약관 동의 없이 접근한 경우 리다이렉트된다', () => {
      mockGetSearchParams.mockReturnValue(null) // 약관 동의가 없는 경우

      renderSignUpPage()

      expect(useRouter().replace).toHaveBeenCalledWith('/')
    })
  })
  describe('1단계: 이메일/인증코드/비밀번호', () => {
    describe('이메일', () => {
      test('유효한 이메일을 입력하면 인증코드가 전송된다.', async () => {
        renderSignUpPage()
        const { email } = getFirstStepFields()
        const { sendCode } = getFirstStepButtons()

        fireEvent.change(email, { target: { value: 'test@example.com' } })
        fireEvent.click(sendCode)

        await waitFor(() => expect(email).toBeDisabled())
        expect(mockOpenToast).toHaveBeenCalledWith({
          message: expect.stringContaining('인증코드가 발송되었습니다.'),
          severity: 'info',
        })
      })
      test('잘못된 이메일 형식인 경우 에러가 표시된다.', async () => {
        renderSignUpPage()

        const { email } = getFirstStepFields()
        await userEvent.type(email, 'invalid-email')

        // 에러 메시지가 표시되는지 확인
        const errorMessage = screen.getByText('유효한 이메일 형식이 아닙니다')
        expect(errorMessage).toBeInTheDocument()
      })
      test('잘못된 이메일을 전송하는 경우 토스트 메시지가 표시된다.', async () => {
        renderSignUpPage()

        const { email } = getFirstStepFields()
        const { sendCode } = getFirstStepButtons()

        // 잘못된 이메일 입력
        fireEvent.change(email, { target: { value: 'invalid-email' } })
        fireEvent.click(sendCode)

        // 토스트 메시지가 표시되는지 확인
        await waitFor(() =>
          expect(mockOpenToast).toHaveBeenCalledWith({
            message:
              expect.stringContaining('이메일 형식을 다시 확인해주세요.'),
            severity: 'error',
          }),
        )
      })
    })
    describe('인증코드', () => {
      test('인증코드를 입력하면 인증이 완료된다.', async () => {
        await renderSignUpPage()

        const { email, authCode } = getFirstStepFields()
        const { sendCode, verifyCode } = getFirstStepButtons()

        // 이메일 입력 후 인증 코드 전송
        await userEvent.type(email, 'test@example.com')
        await userEvent.click(sendCode)
        // 인증 코드 입력 및 인증 버튼 클릭
        await userEvent.type(authCode, '123456')
        await userEvent.click(verifyCode)

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
        await userEvent.type(email, 'test@example.com')
        await userEvent.click(sendCode)
        // 인증 코드 입력 및 인증 버튼 클릭
        await userEvent.type(authCode, '000000') // 잘못된 인증 코드 입력
        await userEvent.click(verifyCode)

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
        await userEvent.type(email, 'test@example.com')
        await userEvent.click(sendCode)
        // 인증 코드 입력 및 인증 버튼 클릭
        await userEvent.type(authCode, '123456')
        await userEvent.click(verifyCode)
        // 비밀번호 입력
        const { password } = getFirstStepFields()
        await userEvent.type(password, 'ValidPassword123!')

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
        await userEvent.type(email, 'test@example.com')
        await userEvent.click(sendCode)
        // 인증 코드 입력 및 인증 버튼 클릭
        await userEvent.type(authCode, '123456')
        await userEvent.click(verifyCode)

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

        // 비밀번호 입력
        const { password } = getFirstStepFields()
        // CASE 1: 대소문자 조건만 만족하는 경우
        await userEvent.type(password, 'Valid')
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
        await userEvent.clear(password)
        await userEvent.type(password, 'ValidPassword')

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
        await userEvent.clear(password)
        await userEvent.type(password, 'ValidPassword1')
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
        await userEvent.type(email, 'test@example.com')
        await userEvent.click(sendCode)
        // 인증 코드 입력 및 인증 버튼 클릭
        await userEvent.type(authCode, '123456')
        await userEvent.click(verifyCode)
        // 비밀번호 입력 후 다음 버튼 클릭
        await userEvent.type(password, 'ValidPassword123!')
        await userEvent.click(next)

        // 다음 단계 필드가 보이는지 확인
        const { name, nickname } = getSecondStepFields()
        expect(name).toBeInTheDocument()
        expect(nickname).toBeInTheDocument()
      })

      test('입력이 유효하지 않은 경우 에러가 표시된다.', async () => {
        await renderSignUpPage()

        const { next } = getFirstStepButtons()

        // 비밀번호 입력 없이 다음 버튼 클릭
        await userEvent.click(next)

        // 에러 메시지가 표시되는지 확인
        expect(mockOpenToast).toHaveBeenCalledWith({
          message: expect.stringContaining('비밀번호를 확인해주세요'),
          severity: 'error',
        })
      })
    })
  })

  describe('2단계: 이름/닉네임', () => {
    beforeEach(async () => {
      // 1단계를 모두 완료한 상태로 설정
      await renderSignUpPage()
      const { email, authCode, password } = getFirstStepFields()
      const { sendCode, verifyCode, next } = getFirstStepButtons()

      // 이메일 입력 후 인증 코드 전송
      await userEvent.type(email, 'test@example.com')
      await userEvent.click(sendCode)
      // 인증 코드 입력 및 인증 버튼 클릭
      await userEvent.type(authCode, '123456')
      await userEvent.click(verifyCode)
      // 비밀번호 입력 후 다음 버튼 클릭
      await userEvent.type(password, 'ValidPassword123!')
      await userEvent.click(next)
    })

    describe('이름 입력', () => {
      test('이름은 한글 2~4자로 입력해야 한다.', async () => {
        const { name } = getSecondStepFields()

        // 유효한 이름 입력
        await userEvent.type(name, '홍길동')

        const errorMessage = screen.queryByText('한글 2 ~ 4자로 입력하세요')
        expect(errorMessage).not.toBeInTheDocument()
      })

      test('이름이 유효하지 않은 경우 에러 메시지가 표시된다.', async () => {
        const { name } = getSecondStepFields()

        // 유효하지 않은 이름 입력
        await userEvent.type(name, '홍')

        const errorMessage = screen.getByText('한글 2 ~ 4자로 입력하세요')
        expect(errorMessage).toBeInTheDocument()
      })
    })

    describe('닉네임 입력', () => {
      beforeEach(() => {
        jest.clearAllMocks()
      })

      test('닉네임은 한글, 영문, 숫자 2~30자로 입력해야 한다.', async () => {
        const { nickname } = getSecondStepFields()

        // 유효한 닉네임 입력
        await userEvent.type(nickname, '홍길동123')

        const errorMessage =
          screen.queryByText('닉네임은 2자 이상이어야 합니다')
        expect(errorMessage).not.toBeInTheDocument()
      })

      test.each([
        {
          case: '너무 짧은 닉네임',
          nickname: '홍',
          errormessage: '닉네임은 2자 이상이어야 합니다',
        },
        {
          case: '너무 긴 닉네임',
          nickname: 'a'.repeat(31),
          errormessage: '닉네임은 30자 이하여야 합니다',
        },
        {
          case: '특수문자가 포함된 닉네임',
          nickname: '홍길동@123',
          errormessage: '한글, 영문, 숫자만 사용할 수 있습니다',
        },
        {
          case: '빈 닉네임',
          nickname: '',
          errormessage: '닉네임을 입력하세요',
        },
      ])(
        '닉네임이 유효하지 않은 경우 에러 메시지가 표시된다. ($case)',
        async () => {
          const { nickname } = getSecondStepFields()

          await userEvent.clear(nickname)
          await userEvent.type(nickname, '홍')
          const errorMessage =
            screen.getByText('닉네임은 2자 이상이어야 합니다')

          expect(errorMessage).toBeInTheDocument()
        },
      )
    })

    describe('닉네임 중복 확인', () => {
      test('유효하지 않은 닉네임은 에러 토스트 메시지가 표시된다.', async () => {
        const { nickname } = getSecondStepFields()
        const { verifyNickname } = getSecondStepButtons()

        // 유효하지 않은 닉네임 입력
        await userEvent.type(nickname, '홍')
        await userEvent.click(verifyNickname)

        expect(mockOpenToast).toHaveBeenCalledWith({
          message: expect.stringContaining('유효하지 않은 닉네임입니다'),
          severity: 'error',
        })
      })

      test('중복인 닉네임의 경우 에러 토스트 메시지가 표시된다.', async () => {
        const { nickname } = getSecondStepFields()
        const { verifyNickname } = getSecondStepButtons()

        // 중복된 닉네임 입력
        await userEvent.type(nickname, '존재하는닉네임')
        await userEvent.click(verifyNickname)

        expect(mockOpenToast).toHaveBeenCalledWith({
          message: expect.stringContaining('이미 가입된 닉네임입니다'),
          severity: 'error',
        })
      })

      test('중복이 아닌 닉네임의 경우 성공 토스트 메시지가 표시된다.', async () => {
        const { nickname } = getSecondStepFields()
        const { verifyNickname } = getSecondStepButtons()

        // 중복되지 않은 닉네임 입력
        await userEvent.type(nickname, '새로운닉네임')
        await userEvent.click(verifyNickname)

        expect(mockOpenToast).toHaveBeenCalledWith({
          message: expect.stringContaining('닉네임이 확인되었습니다'),
          severity: 'info',
        })
      })
    })

    describe('회원가입 완료', () => {
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

      test('모든 입력이 유효한 경우 회원가입이 완료된다.', async () => {
        const { name, nickname } = getSecondStepFields()
        const { verifyNickname, signUp } = getSecondStepButtons()

        // 이름 입력
        await userEvent.type(name, '홍길동')
        // 닉네임 입력과 중복확인
        await userEvent.type(nickname, '새로운닉네임')
        await userEvent.click(verifyNickname)
        // 회원가입 완료 버튼 클릭
        await userEvent.click(signUp)

        // 성공한 경우 로그인 페이지로 이동
        expect(useRouter().push).toHaveBeenCalledWith('/login')
      })

      test('유효하지 않은 입력이 있는 경우 해당 필드로 포커스가 이동한다.', async () => {
        const { name, nickname } = getSecondStepFields()
        const { signUp } = getSecondStepButtons()

        // CASE 1: 아무것도 입력하지 않은 경우
        await userEvent.click(signUp)

        expect(name).toHaveFocus()
        expect(screen.getByText('이름을 입력하세요')).toBeInTheDocument()

        // CASE 2: 이름만 입력한 경우
        await userEvent.type(name, '홍길동')
        await userEvent.click(signUp)

        expect(nickname).toHaveFocus()
        expect(screen.getByText('닉네임을 입력하세요')).toBeInTheDocument()

        // CASE 3: 유효하지 않은 입력이 있는 경우
        await userEvent.type(nickname, '홍')
        await userEvent.click(signUp)

        expect(nickname).toHaveFocus()
        expect(
          screen.getByText('닉네임은 2자 이상이어야 합니다'),
        ).toBeInTheDocument()
      })
    })
  })
})
