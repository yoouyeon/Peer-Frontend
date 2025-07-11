import { screen, render, waitFor, act, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { Suspense } from 'react'
import { http, HttpResponse } from 'msw'
import { SWRConfig } from 'swr'
import TeamNoticeView from '@/app/teams/[id]/notice/@detail/page'
import { MOCK_ACCESS_TOKEN } from '@/mocks/constants'
import {
  MOCK_NOTICE,
  MOCK_NOTICE_COMMENT,
  MOCK_POST,
  MOCK_TEAM_ID,
} from '@/mocks/data/teamPage'
import useTeamPageState from '@/states/useTeamPageState'
import { server } from '@/mocks/server'
import API_PATH from '@/constant/apiPath'
import HTTP_STATUS from '@/constant/httpStatus'
import MuiThemeProvider from '@/app/panel/MuiThemeProvider'

jest.mock('@/states/useAuthStore', () => ({
  getState: () => ({
    accessToken: MOCK_ACCESS_TOKEN,
    logout: jest.fn(),
    login: jest.fn(),
  }),
}))
window.alert = jest.fn()
jest.mock('@/components/ToastUIViewer', () => ({
  __esModule: true,
  default: ({ initialValue }: { initialValue: string }) => (
    <div data-testid="toast-viewer">{initialValue}</div>
  ),
}))

const renderPage = async () => {
  const result = render(
    <Suspense>
      {/* 테스트별로 캐시를 분리하기 위함 */}
      <SWRConfig value={{ provider: () => new Map() }}>
        <MuiThemeProvider>
          <TeamNoticeView params={{ id: MOCK_TEAM_ID.toString() }} />
        </MuiThemeProvider>
      </SWRConfig>
    </Suspense>,
  )

  await waitFor(() => {
    expect(result.container).toBeInTheDocument()
  })

  return result
}

describe('데이터 페칭 테스트', () => {
  beforeEach(async () => {
    await act(async () => {
      useTeamPageState.setState({ postId: MOCK_NOTICE.postId })
    })
  })

  test('공지사항 상세 데이터를 정상적으로 보여준다.', async () => {
    await renderPage()

    await waitFor(() => {
      // 제목
      expect(screen.getByLabelText('제목')).toHaveTextContent(MOCK_NOTICE.title)
      // 내용
      expect(screen.getByText(MOCK_NOTICE.content)).toBeInTheDocument()
      expect(screen.getByLabelText('작성자')).toHaveTextContent(
        MOCK_NOTICE.nickname,
      )
    })
  })

  test('공지사항에 해당하는 댓글을 정상적으로 보여준다.', async () => {
    await renderPage()

    await waitFor(() => {
      // 작성자
      const commentAuthors = screen.getAllByLabelText('댓글 작성자')
      expect(commentAuthors[0]).toHaveTextContent(
        MOCK_NOTICE_COMMENT.authorNickname,
      )
      // 댓글 내용
      expect(screen.getByText(MOCK_NOTICE_COMMENT.content)).toBeInTheDocument()
    })
  })
})

describe('상호작용 테스트', () => {
  beforeEach(async () => {
    server.resetHandlers()

    await act(async () => {
      useTeamPageState.setState({ postId: MOCK_NOTICE.postId })
    })

    server.use(
      http.get(`${API_PATH.teamPage.post}/:postId`, () => {
        return HttpResponse.json(
          {
            ...MOCK_POST,
            isAuthor: true, // 수정, 삭제 버튼 활성화를 위한 목데이터
          },
          { status: HTTP_STATUS.ok },
        )
      }),
    )
  })

  test('이전 페이지로 버튼으로 공지사항 목록으로 돌아갈 수 있다.', async () => {
    await renderPage()

    const goBackButton = screen.getByRole('button', {
      name: '이전 페이지',
    })

    await userEvent.click(goBackButton)

    await waitFor(() => {
      expect(useTeamPageState.getState().boardType).toBe('LIST')
    })
  })

  test('공지사항 수정 버튼을 클릭하면 수정 페이지로 이동한다.', async () => {
    await renderPage()

    const editButton = screen.getByRole('button', { name: '수정' })

    await userEvent.click(editButton)

    await waitFor(() => {
      expect(useTeamPageState.getState().boardType).toBe('EDIT')
      expect(useTeamPageState.getState().postId).toBe(MOCK_NOTICE.postId)
    })
  })

  test('공지사항 삭제 버튼을 클릭하면 공지사항이 삭제되고 목록으로 돌아간다', async () => {
    await renderPage()

    const deleteButton = screen.getByRole('button', { name: '삭제' })
    await userEvent.click(deleteButton)

    // 삭제 확인 모달 열림
    await waitFor(() => {
      expect(screen.getByText('공지사항을 삭제할까요?')).toBeInTheDocument()
    })
    const confirmButton = screen.getByRole('button', { name: '삭제' })

    await userEvent.click(confirmButton)
    await waitFor(() => {
      expect(useTeamPageState.getState().boardType).toBe('LIST')
      expect(useTeamPageState.getState().postId).toBeUndefined()
    })
  })
})

describe('댓글 기능 테스트', () => {
  beforeAll(() => {
    server.use(
      http.get(`${API_PATH.team.comment}/:postId`, () => {
        return HttpResponse.json(
          [
            {
              ...MOCK_NOTICE_COMMENT,
              isAuthor: true, // 수정, 삭제 버튼 활성화를 위한 목데이터
            },
          ],
          { status: HTTP_STATUS.ok },
        )
      }),
    )
  })

  beforeEach(async () => {
    await act(async () => {
      useTeamPageState.setState({ postId: MOCK_NOTICE.postId })
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('댓글 데이터가 화면에 표시된다', async () => {
    await renderPage()

    await waitFor(() => {
      const commentItems = screen.getAllByTestId('comment-item')
      expect(commentItems.length).toBeGreaterThanOrEqual(1) // 댓글이 하나 이상 있어야 한다.
      const myComment = commentItems[0]
      expect(myComment).toHaveTextContent(MOCK_NOTICE_COMMENT.content)
      expect(myComment).toHaveTextContent(MOCK_NOTICE_COMMENT.authorNickname)
    })
  })

  test('댓글을 등록할 수 있다.', async () => {
    const COMMENT_CONTENT = '댓글을 등록할 수 있어요.'
    const FORM_CONTENT_KEY = 'new-content'
    const axiosPostSpy = jest.spyOn(axios.Axios.prototype, 'post')
    global.FormData = class {
      get = (key: string) => {
        if (key === FORM_CONTENT_KEY) return COMMENT_CONTENT
        return null
      }
    } as any
    await renderPage()

    const commentInput = screen.getByPlaceholderText('댓글을 작성해주세요.')
    const commentSubmitButton = screen.getByRole('button', {
      name: '댓글 등록',
    })

    await userEvent.type(commentInput, COMMENT_CONTENT)
    await userEvent.click(commentSubmitButton)

    expect(axiosPostSpy).toHaveBeenCalledWith(
      `${API_PATH.team.comment}`,
      expect.objectContaining({
        teamId: MOCK_TEAM_ID,
        postId: MOCK_NOTICE.postId,
        content: COMMENT_CONTENT,
      }),
    )
  })

  test('댓글을 수정할 수 있다.', async () => {
    const COMMENT_CONTENT = '댓글을 수정할 수 있어요.'
    const FORM_CONTENT_KEY = 'content'
    const axiosPutSpy = jest.spyOn(axios.Axios.prototype, 'put')
    global.FormData = class {
      get = (key: string) => {
        if (key === FORM_CONTENT_KEY) return COMMENT_CONTENT
        return null
      }
    } as any

    await renderPage()

    const commentItems = screen.getAllByTestId('comment-item')
    const commentItem = commentItems[0]
    const commentOptionButton = within(commentItem).getByRole('button', {
      name: '댓글 옵션 버튼',
    })
    await userEvent.click(commentOptionButton)
    const editMenu = await screen.findByRole('menuitem', { name: '수정' })
    await userEvent.click(editMenu)
    const commentEditInput =
      await within(commentItem).findByPlaceholderText('댓글을 작성해주세요.')
    const commentEditButton = within(commentItem).getByRole('button', {
      name: '수정',
    })
    await userEvent.type(commentEditInput, COMMENT_CONTENT)
    await userEvent.click(commentEditButton)

    expect(axiosPutSpy).toHaveBeenCalledWith(
      `${API_PATH.team.comment}/${MOCK_NOTICE_COMMENT.commentId}`,
      expect.objectContaining({
        content: COMMENT_CONTENT,
      }),
    )
  })

  test('댓글을 삭제할 수 있다.', async () => {
    const axiosDeleteSpy = jest.spyOn(axios.Axios.prototype, 'delete')

    await renderPage()

    const commentItems = screen.getAllByTestId('comment-item')
    const commentItem = commentItems[0]
    const commentOptionButton = within(commentItem).getByRole('button', {
      name: '댓글 옵션 버튼',
    })
    await userEvent.click(commentOptionButton)
    const deleteMenu = await screen.findByRole('menuitem', { name: '삭제' })
    await userEvent.click(deleteMenu)
    await waitFor(() => {
      // 삭제 확인 모달이 열렸는지 확인.
      expect(screen.getByText('댓글을 삭제할까요?')).toBeInTheDocument()
    })
    const confirmButton = screen.getByRole('button', {
      name: '삭제',
    })
    await userEvent.click(confirmButton)

    expect(axiosDeleteSpy).toHaveBeenCalledWith(
      `${API_PATH.team.comment}/${MOCK_NOTICE_COMMENT.commentId}`,
    )
  })
})
