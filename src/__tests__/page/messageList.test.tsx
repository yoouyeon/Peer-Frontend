import { screen, render, waitFor, act, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { SWRConfig } from 'swr'
import MessageListPage from '@/app/my-page/message/page'
import MuiThemeProvider from '@/app/panel/MuiThemeProvider'
import { MOCK_ACCESS_TOKEN } from '@/mocks/constants'

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
