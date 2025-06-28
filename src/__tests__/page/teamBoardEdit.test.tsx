import { forwardRef, Suspense, useEffect } from 'react'
import { screen, render, waitFor, act, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { http, HttpResponse } from 'msw'
import { SWRConfig } from 'swr'
import BoardEdit from '@/app/teams/[id]/board/@edit/page'
import useTeamPageState from '@/states/useTeamPageState'
import { MOCK_BOARD_ID, MOCK_TEAM_ID } from '@/mocks/data/teamPage'
import { MOCK_ACCESS_TOKEN } from '@/mocks/constants'
import API_PATH from '@/constant/apiPath'
import { server } from '@/mocks/server'
import HTTP_STATUS from '@/constant/httpStatus'

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
// NOTE : jest.mock의 호이스팅 때문에 CONTENT 상수를 사용할 수 없음 🥹
jest.mock('@/components/DynamicToastEditor', () => {
  const React = require('react')
  const mockEditorInstance = {
    getMarkdown: () => '테스트가 잘 돌아갔으면 좋겠다.',
  }
  const MockEditor = ({ editorRef }: { editorRef: any }) => {
    if (editorRef) {
      editorRef.current = mockEditorInstance
    }
    return React.createElement('div', { 'data-testid': 'toast-editor' })
  }
  return {
    __esModule: true,
    default: MockEditor,
  }
})
window.alert = jest.fn()

const TITLE = '새로운 게시글입니다.'
const CONTENT = '테스트가 잘 돌아갔으면 좋겠다.' // 게시글 내용
const MOCK_POST_ID = 1234 // 수정할 게시글 ID

const renderPage = async () => {
  const result = render(
    <Suspense>
      <SWRConfig value={{ provider: () => new Map() }}>
        <BoardEdit params={{ id: MOCK_TEAM_ID.toString() }} />
      </SWRConfig>
    </Suspense>,
  )

  await waitFor(() => {
    expect(screen.getByTestId('toast-editor')).toBeInTheDocument()
  })

  return result
}

const setupMockTeamPageState = async (mode: 'CREATE' | 'UPDATE') => {
  await act(async () => {
    useTeamPageState.setState({
      postId: mode === 'UPDATE' ? MOCK_POST_ID : undefined,
      boardId: MOCK_BOARD_ID,
    })
  })
}

describe('게시글 작성 페이지', () => {
  let axiosPostSpy: jest.SpyInstance

  beforeEach(async () => {
    await setupMockTeamPageState('CREATE')
    axiosPostSpy = jest.spyOn(axios.Axios.prototype, 'post')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('등록 버튼을 클릭하면 게시글이 등록된다', async () => {
    await renderPage()

    const titleInput = screen.getByPlaceholderText('제목을 입력해주세요.')
    const contentEditor = screen.getByTestId('toast-editor')
    await userEvent.type(titleInput, TITLE)
    await userEvent.type(contentEditor, CONTENT)

    const submitButton = screen.getByRole('button', { name: '등록' })
    await userEvent.click(submitButton)

    expect(axiosPostSpy).toHaveBeenCalledWith(
      API_PATH.teamPage.postsCreate,
      expect.objectContaining({
        title: TITLE,
        content: CONTENT,
        boardId: MOCK_BOARD_ID,
      }),
    )
  })
})

describe('게시글 수정 페이지', () => {
  const ORIGINAL_TITLE = '수정 전 게시글 제목'
  const ORIGINAL_CONTENT = '수정 전 게시글 내용'
  let axiosPutSpy: jest.SpyInstance

  beforeEach(async () => {
    axiosPutSpy = jest.spyOn(axios.Axios.prototype, 'put')
    server.use(
      http.get(`${API_PATH.teamPage.post}/${MOCK_POST_ID}`, () => {
        return HttpResponse.json(
          {
            title: ORIGINAL_TITLE,
            content: ORIGINAL_CONTENT,
          },
          {
            status: HTTP_STATUS.ok,
          },
        )
      }),
    )
    await setupMockTeamPageState('UPDATE')
  })

  afterEach(() => {
    server.resetHandlers()
  })

  test('수정할 게시글을 불러온다.', async () => {
    await renderPage()

    const titleInput = await screen.findByDisplayValue(ORIGINAL_TITLE)

    expect(titleInput).toBeInTheDocument()
  })

  test('완료 버튼을 클릭하면 게시글이 수정된다.', async () => {
    await renderPage()

    await waitFor(() => {
      expect(screen.getByDisplayValue(ORIGINAL_TITLE)).toBeEnabled()
    })
    const titleInput = screen.getByDisplayValue(ORIGINAL_TITLE)
    await userEvent.clear(titleInput)
    await userEvent.type(titleInput, TITLE)
    const contentEditor = screen.getByTestId('toast-editor')
    await userEvent.type(contentEditor, CONTENT)

    const submitButton = screen.getByRole('button', { name: '완료' })
    await userEvent.click(submitButton)

    expect(axiosPutSpy).toHaveBeenCalledWith(
      `${API_PATH.team.modifyPost}/${MOCK_POST_ID}`,
      expect.objectContaining({
        title: TITLE,
        content: CONTENT,
      }),
    )
  })
})
