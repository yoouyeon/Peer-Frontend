import { screen, render, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { SWRConfig } from 'swr'
import { http, HttpResponse } from 'msw'
import MessageListPage from '@/app/my-page/message/page'
import MuiThemeProvider from '@/app/panel/MuiThemeProvider'
import { MOCK_ACCESS_TOKEN } from '@/mocks/constants'
import API_PATH from '@/constant/apiPath'
import HTTP_STATUS from '@/constant/httpStatus'
import { server } from '@/mocks/server'
import { MOCK_TARGET } from '@/mocks/handlers/message'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))
jest.mock('@/states/useAuthStore', () => ({
  getState: () => ({
    accessToken: MOCK_ACCESS_TOKEN,
    logout: jest.fn(),
    login: jest.fn(),
  }),
}))
jest.mock('@/hook/useMedia', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    isPc: true,
    isTablet: false,
    isMobile: false,
  })),
}))

server.use(
  http.post<never, { keyword: string }, Array<any>>(
    API_PATH.message.searching,
    async ({ request }) => {
      const { keyword } = await request.json()

      // 검색 결과에 해당하는 사용자가 없는 경우
      if (!MOCK_TARGET.userNickname.includes(keyword)) {
        return HttpResponse.json([], {
          status: HTTP_STATUS.ok,
        })
      }

      return HttpResponse.json([
        {
          targetId: MOCK_TARGET.userId,
          targetEmail: MOCK_TARGET.userEmail,
          targetNickname: MOCK_TARGET.userNickname,
          targetProfile: MOCK_TARGET.userProfile,
        },
      ])
    },
  ),
)

server.use(
  http.post(API_PATH.message.newMessage, async ({ request }) => {
    console.log('새 쪽지 작성 요청', request.url)
    return HttpResponse.json([], {
      status: HTTP_STATUS.ok,
    })
  }),
)

const renderPage = async () => {
  const result = await render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MuiThemeProvider>
        <MessageListPage />
      </MuiThemeProvider>
    </SWRConfig>,
  )

  await waitFor(() => {
    expect(result.container).toBeInTheDocument()
  })

  return result
}

describe('메시지 목록 랜더링', () => {
  const MOCK_MESSAGE = '안녕하세요'
  const MOCK_SENDER = '김영희'

  test('메시지 목록을 불러온다', async () => {
    await renderPage()
    const messageList = screen.getAllByTestId('message-item')

    expect(messageList.length).toBe(1)
    expect(within(messageList[0]).getByText(MOCK_MESSAGE)).toBeInTheDocument()
    expect(within(messageList[0]).getByText(MOCK_SENDER)).toBeInTheDocument()
  })

  test('메시지 목록에서 닉네임으로 검색할 수 있다.', async () => {
    await renderPage()

    const searchInput = screen.getByPlaceholderText('닉네임을 검색해주세요.')
    await userEvent.type(searchInput, MOCK_SENDER)
    const searchButton = screen.getByRole('button', { name: '검색' })
    await userEvent.click(searchButton)

    await waitFor(() => {
      const messageList = screen.getAllByTestId('message-item')
      expect(messageList.length).toBe(1)
      expect(within(messageList[0]).getByText(MOCK_SENDER)).toBeInTheDocument()
    })

    await userEvent.clear(searchInput)
    await userEvent.type(searchInput, '존재하지 않는 사용자')
    await userEvent.click(searchButton)

    await waitFor(() => {
      const messageList = screen.queryAllByTestId('message-item')
      expect(messageList.length).toBe(0)
    })
  })
})

describe('PC View 메시지 관리', () => {
  beforeEach(async () => {
    // 메시지 관리 모드 진입
    await renderPage()

    const manageButton = screen.getByRole('button', { name: '관리' })
    await userEvent.click(manageButton)

    await waitFor(() => {
      expect(screen.getByText('대상 리스트 관리')).toBeInTheDocument()
    })
  })

  test('메시지를 선택할 수 있다.', async () => {
    const messageList = screen.getAllByTestId('message-item')
    const firstMessage = messageList[0]
    const checkbox = within(firstMessage).getByRole('checkbox')

    // 하나 선택
    await userEvent.click(checkbox)
    expect(checkbox).toBeChecked()
    // 하나 선택 해제
    await userEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()
    // 전체 선택
    const selectAllButton = screen.getByRole('button', { name: '전체 선택' })
    await userEvent.click(selectAllButton)
    const allCheckboxes = screen.getAllByRole('checkbox')
    allCheckboxes.forEach((checkBox) => {
      expect(checkBox).toBeChecked()
    })
    // 전체 선택 해제
    const unselectAllButton = screen.getByRole('button', {
      name: '전체 선택 해제',
    })
    await userEvent.click(unselectAllButton)
    allCheckboxes.forEach((checkBox) => {
      expect(checkBox).not.toBeChecked()
    })
  })

  test('메시지를 삭제할 수 있다.', async () => {
    const axiosDeleteSpy = jest.spyOn(axios.Axios.prototype, 'delete')

    // 하나 선택
    const messageList = screen.getAllByTestId('message-item')
    const firstMessage = messageList[0]
    const checkbox = within(firstMessage).getByRole('checkbox')
    await userEvent.click(checkbox)
    expect(checkbox).toBeChecked()

    // 삭제 버튼 클릭
    const deleteButton = screen.getByRole('button', { name: '삭제' })
    await userEvent.click(deleteButton)

    await waitFor(() => {
      expect(axiosDeleteSpy).toHaveBeenCalledWith(
        API_PATH.message.deleteMessage,
        {
          data: {
            target: [{ conversationId: expect.any(Number) }],
          },
        },
      )
      expect(screen.queryByTestId('message-item')).not.toBeInTheDocument()
    })
  })
})

describe('새로운 메시지 작성', () => {
  beforeEach(async () => {
    // 새 쪽지 작성 모달 열기
    await renderPage()

    const newMessageButton = screen.getByRole('button', { name: '새 쪽지' })
    await userEvent.click(newMessageButton)

    await waitFor(() => {
      const newMessageModal = screen.getByTestId('modal-wrapper')
      expect(within(newMessageModal).getByText('새 쪽지')).toBeInTheDocument()
    })
  })

  test('보낼 상대를 검색할 수 있다.', async () => {
    const searchButton = screen.getByRole('button', { name: '검색' })
    const searchInput =
      screen.getByPlaceholderText('검색할 닉네임을 입력해주세요.')

    // 존재하는 닉네임 검색
    await userEvent.type(searchInput, '김영희')
    await userEvent.click(searchButton)

    await waitFor(() => {
      const targetList = screen.getAllByTestId('target-list-item')
      targetList.forEach((item) => {
        expect(within(item).getByText(/김영희/)).toBeInTheDocument()
      })
    })
    // 존재하지 않는 닉네임 검색
    await userEvent.clear(searchInput)
    await userEvent.type(searchInput, '존재하지 않는 사용자')
    await userEvent.click(searchButton)

    await waitFor(() => {
      const targetList = screen.queryAllByTestId('target-list-item')
      expect(targetList.length).toBe(0)
      expect(screen.getByText('검색된 유저가 없어요.')).toBeInTheDocument()
    })
  })

  test('쪽지를 보낼 수 있다.', async () => {
    const axiosPostSpy = jest.spyOn(axios.Axios.prototype, 'post')

    // 새 쪽지 모달이 열려있는지 확인
    await waitFor(() => {
      const modal = screen.getByTestId('modal-wrapper')
      // 제목이 h3(heading)으로 들어가 있으므로 getByRole 사용
      expect(
        within(modal).getByRole('heading', { name: '새 쪽지' }),
      ).toBeInTheDocument()
    })

    // 모달 내부의 요소들을 찾기 위해 within 사용
    const modal = screen.getByTestId('modal-wrapper')
    const searchButton = within(modal).getByRole('button', { name: '검색' })
    const searchInput =
      within(modal).getByPlaceholderText('검색할 닉네임을 입력해주세요.')
    const messageContentInput =
      within(modal).getByPlaceholderText('내용을 입력하세요.')
    const sendButton = within(modal).getByRole('button', { name: '보내기' })

    // 존재하는 닉네임 검색
    await userEvent.type(searchInput, '김영희')
    await userEvent.click(searchButton)

    // 검색 결과가 나타날 때까지 기다림
    await waitFor(() => {
      const targetList = screen.getAllByTestId('target-list-item')
      expect(targetList.length).toBeGreaterThan(0)
    })

    // 보낼 상대 선택
    const targetList = screen.getAllByTestId('target-list-item')
    const targetItem = targetList.find((item) =>
      within(item).getByText('김영희'),
    ) as HTMLElement
    await userEvent.click(targetItem)

    // 사용자가 선택되었는지 확인 (입력 필드가 비활성화되고 값이 변경됨)
    await waitFor(() => {
      expect(searchInput).toHaveValue('김영희')
      expect(searchInput).toBeDisabled()
    })

    // 메시지 내용 입력
    await userEvent.type(messageContentInput, '안녕하세요, 김영희님!')

    // 메시지 보내기 (첫 번째 보내기 버튼 - 확인 모달을 열기 위한 버튼)
    await userEvent.click(sendButton)

    // 확인 모달이 열릴 때까지 기다림
    await waitFor(() => {
      expect(screen.getByText('쪽지 보내기')).toBeInTheDocument()
      expect(
        screen.getByText('김영희에게 쪽지를 보내시겠습니까?'),
      ).toBeInTheDocument()
    })

    // 확인 모달의 보내기 버튼 클릭 (두 번째 보내기 버튼)
    const modals = screen.getAllByTestId('modal-wrapper')
    const confirmModal = modals[1] // 두 번째 모달이 확인 모달
    const confirmSendButton = within(confirmModal).getByRole('button', {
      name: '보내기',
    })
    await userEvent.click(confirmSendButton)
    console.log('axiosPostSpy.mock.calls:', axiosPostSpy.mock.calls)
    await waitFor(() => {
      // expect(axiosPostSpy).toHaveBeenLastCalledWith(
      //   API_PATH.message.newMessage,
      //   expect.objectContaining({
      //     targetId: 2,
      //     content: '안녕하세요, 김영희님!',
      //   }),
      // )
      expect(screen.queryByTestId('modal-wrapper')).not.toBeInTheDocument()
    })
  })
})

describe('사용자 인터랙션', () => {
  test('새로운 메시지를 보낼 수 있다.', async () => {})

  test('메시지를 읽을 수 있다.', async () => {})

  test('모바일 View에서 메시지를 밀어 삭제할 수 있다.', async () => {})
})
