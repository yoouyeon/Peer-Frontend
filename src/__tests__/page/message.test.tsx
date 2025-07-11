import userEvent from '@testing-library/user-event'
import { render, screen, waitFor, act, within } from '@testing-library/react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import MessageChatPage from '@/app/my-page/message/[conversationId]/page'
import MuiThemeProvider from '@/app/panel/MuiThemeProvider'
import { MOCK_CONVERSATION_ID, MOCK_TARGET } from '@/mocks/handlers/message'
import { MOCK_ACCESS_TOKEN } from '@/mocks/constants'
import useMedia from '@/hook/useMedia'
import API_PATH from '@/constant/apiPath'

jest.mock('@/hook/useMedia', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    isPc: false,
    isTablet: false,
    isLargeTablet: false,
    isOverTablet: false,
    isMobile: true,
  })),
}))

jest.mock('src/states/useTargetId', () => ({
  __esModule: true,
  default: () => ({
    targetId: MOCK_TARGET.userId,
    resetTargetId: jest.fn(),
  }),
}))

jest.mock('@/states/useAuthStore', () => ({
  getState: () => ({
    accessToken: MOCK_ACCESS_TOKEN,
    logout: jest.fn(),
    login: jest.fn(),
  }),
}))

window.IntersectionObserver = jest.fn(() => {
  return {
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
    takeRecords: jest.fn(),
    root: null,
    rootMargin: '0px',
    thresholds: [0],
  }
})

window.alert = jest.fn()

const mockUseMedia = useMedia as jest.MockedFunction<typeof useMedia>
const mockAsPc = () => {
  mockUseMedia.mockReturnValue({
    isPc: true,
    isTablet: false,
    isLargeTablet: false,
    isOverTablet: false,
  })
}

const mockAsMobile = () => {
  mockUseMedia.mockReturnValue({
    isPc: false,
    isTablet: false,
    isLargeTablet: false,
    isOverTablet: false,
  })
}

const renderPage = async (type: 'PC' | 'MOBILE' = 'MOBILE') => {
  if (type === 'PC') {
    mockAsPc()
  } else {
    mockAsMobile()
  }
  const result = await act(async () => {
    return render(
      <MuiThemeProvider>
        <MessageChatPage />
      </MuiThemeProvider>,
    )
  })
  return result
}

describe('쪽지 페이지', () => {
  const axiosPostSpy = jest.spyOn(axios.Axios.prototype, 'post')

  beforeEach(() => {
    jest.clearAllMocks()
    Element.prototype.scrollTo = jest.fn()
    ;(useParams as jest.Mock).mockReturnValue({
      conversationId: MOCK_CONVERSATION_ID.toString(),
    })
  })

  test('targetId와 conversationId에 해당하는 쪽지 데이터를 보여준다.', async () => {
    await renderPage()

    await waitFor(() => {
      expect(screen.getByText(MOCK_TARGET.userNickname)).toBeInTheDocument()
      expect(screen.getByText('안녕하세요'))
    })
  })

  test('PC 화면에서 쪽지를 보낼 수 있다.', async () => {
    await renderPage('PC')
    // 랜더링 대기
    await waitFor(() => {
      expect(screen.getByText(MOCK_TARGET.userNickname)).toBeInTheDocument()
    })

    // 쪽지 입력
    const messageContent = '반가워요 (PC)'
    const messageInput = await screen.findByPlaceholderText('내용을 입력하세요')
    await userEvent.type(messageInput, messageContent)
    // 쪽지 보내기 버튼 클릭
    const sendButton = await screen.findByRole('button', { name: '보내기' })
    await act(async () => {
      await userEvent.click(sendButton)
    })

    await waitFor(() => {
      expect(axiosPostSpy).toHaveBeenLastCalledWith(
        API_PATH.message.backMessage,
        expect.objectContaining({
          targetId: MOCK_TARGET.userId,
          content: messageContent,
        }),
      )
      expect(screen.getByText(messageContent)).toBeInTheDocument()
    })
  })

  test('모바일 화면에서 쪽지를 보낼 수 있다.', async () => {
    await renderPage('MOBILE')
    // 랜더링 대기
    await waitFor(() => {
      expect(screen.getByText(MOCK_TARGET.userNickname)).toBeInTheDocument()
    })

    // 쪽지 입력 모달 열기
    const openMessageButton = screen.getByRole('button', {
      name: '쪽지 보내기',
    })
    await userEvent.click(openMessageButton)
    const modalButtons = await screen.findByTestId('modal-buttons')
    // 쪽지 입력하기
    const messageInput = screen.getByPlaceholderText('내용을 입력하세요')
    const sendButton = within(modalButtons).getByRole('button', {
      name: '보내기',
    })
    const messageContent = '반가워요 (모바일)'
    await userEvent.type(messageInput, messageContent)
    // 쪽지 보내기
    await act(async () => {
      await userEvent.click(sendButton)
    })

    await waitFor(() => {
      expect(axiosPostSpy).toHaveBeenLastCalledWith(
        API_PATH.message.backMessage,
        expect.objectContaining({
          targetId: MOCK_TARGET.userId,
          content: messageContent,
        }),
      )
      expect(screen.getByText(messageContent)).toBeInTheDocument()
    })
  })
})
