import { screen, render, waitFor, act, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { Suspense } from 'react'
import { http, HttpResponse } from 'msw'
import { SWRConfig } from 'swr'
import TeamBoardPostView from '@/app/teams/[id]/board/@detail/page'
import { MOCK_ACCESS_TOKEN } from '@/mocks/constants'
import {
  MOCK_BOARD_ID,
  MOCK_POST_COMMENT_ID,
  MOCK_POST_ID,
  MOCK_TEAM_ID,
} from '@/mocks/data/teamPage'
import useTeamPageState from '@/states/useTeamPageState'
import { server } from '@/mocks/server'
import API_PATH from '@/constant/apiPath'
import HTTP_STATUS from '@/constant/httpStatus'
import MuiThemeProvider from '@/app/panel/MuiThemeProvider'

jest.mock('@/components/ToastUIViewer', () => ({
  __esModule: true,
  default: ({ initialValue }: { initialValue: string }) => (
    <div data-testid="toast-viewer">{initialValue}</div>
  ),
}))
// 로그인 상태로 테스트하기 위해 useAuthStore를 모킹
jest.mock('@/states/useAuthStore', () => ({
  __esModule: true,
  default: {
    getState: jest.fn(() => ({
      accessToken: MOCK_ACCESS_TOKEN,
      isLogin: true,
    })),
  },
}))

const renderPage = async () => {
  const result = render(
    <Suspense>
      <SWRConfig value={{ provider: () => new Map() }}>
        <MuiThemeProvider>
          <TeamBoardPostView params={{ id: MOCK_TEAM_ID.toString() }} />
        </MuiThemeProvider>
      </SWRConfig>
    </Suspense>,
  )
  await waitFor(() => {
    expect(result.container).toBeInTheDocument()
  })
  return result
}

describe('게시글 상세 내용 페칭', () => {
  beforeEach(async () => {
    await act(async () => {
      useTeamPageState.setState({
        postId: MOCK_POST_ID,
        boardId: MOCK_BOARD_ID,
      })
    })
  })

  test('게시글 상세 데이터를 정상적으로 보여준다.', async () => {
    await renderPage()

    const title = await screen.findByLabelText('제목')
    const content = await screen.findByTestId('toast-viewer')
    const author = await screen.findByLabelText('작성자')

    expect(title).toHaveTextContent('첫번째 게시글')
    expect(content).toHaveTextContent(/^안녕하세요!/)
    expect(author).toHaveTextContent('김개발')
  })

  test('게시글에 해당하는 댓글을 정상적으로 보여준다.', async () => {
    await renderPage()

    const commentItems = await screen.findAllByTestId('comment-item')
    const commentItem = commentItems[0]
    const commentAuthor = within(commentItem).getByLabelText('댓글 작성자')
    const commentContent = within(commentItem).getByTestId('comment-content')

    expect(commentAuthor).toHaveTextContent('김개발')
    expect(commentContent).toHaveTextContent('자유롭게 의견을 남겨주세요!')
  })
})

describe('상호작용 테스트', () => {
  beforeEach(async () => {
    await act(async () => {
      useTeamPageState.setState({
        postId: MOCK_POST_ID,
        boardId: MOCK_BOARD_ID,
      })
    })

    server.use(
      http.get(`${API_PATH.teamPage.post}/${MOCK_POST_ID}`, () =>
        HttpResponse.json(
          {
            postId: MOCK_POST_ID,
            title: '첫번째 게시글',
            nickname: '김개발',
            hit: 100,
            date: new Date(),
            content: '안녕하세요!',
            isAuthor: true, // 수정, 삭제 버튼 활성화를 위한 목데이터
          },
          { status: HTTP_STATUS.ok },
        ),
      ),
    )
  })

  test('이전 페이지로 버튼으로 목록으로 돌아갈 수 있다.', async () => {
    await renderPage()
    const goBackButton = screen.getByRole('button', { name: '이전 페이지' })

    await userEvent.click(goBackButton)

    await waitFor(() => {
      expect(useTeamPageState.getState().boardType).toBe('LIST')
    })
  })

  test('수정 버튼을 클릭하면 수정 페이지로 이동한다.', async () => {
    await renderPage()
    const editButton = screen.getByRole('button', { name: '수정' })

    await userEvent.click(editButton)

    await waitFor(() => {
      expect(useTeamPageState.getState().boardType).toBe('EDIT')
      expect(useTeamPageState.getState().postId).toBe(MOCK_POST_ID)
    })
  })

  test('삭제 버튼을 클릭하면 게시글이 삭제되고 목록으로 돌아간다.', async () => {
    await renderPage()
    const deleteButton = screen.getByRole('button', { name: '삭제' })
    await userEvent.click(deleteButton)

    // 삭제 확인 모달 열림
    const confirmModalButtons = (
      await screen.findAllByTestId('modal-buttons')
    ).find((el) => within(el).queryByRole('button', { name: '삭제' })) // modal-buttons 요소가 1개 이상 등장하기 때문에 삭제 버튼을 가지고 있는 것만 찾아낸다.
    expect(confirmModalButtons).toBeDefined()
    const confirmButton = within(confirmModalButtons!).getByRole('button', {
      name: '삭제',
    })
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
      http.get(`${API_PATH.team.comment}/${MOCK_POST_ID}`, () => {
        return HttpResponse.json(
          [
            {
              commentId: MOCK_POST_COMMENT_ID,
              authorImage: '',
              authorNickname: '김개발',
              content: '모두들 화이팅!',
              createAt: new Date(),
              authorId: 1,
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
      useTeamPageState.setState({
        postId: MOCK_POST_ID,
        boardId: MOCK_BOARD_ID,
      })
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('댓글을 불러올 수 있다.', async () => {
    const EXPECTED_COMMENT_COUNT = 1
    await renderPage()

    // 댓글이 하나 있어야 한다.
    const commentItems = await screen.findAllByTestId('comment-item')
    expect(commentItems).toHaveLength(EXPECTED_COMMENT_COUNT)

    const commentItem = commentItems[0]
    const commentAuthor = within(commentItem).getByLabelText('댓글 작성자')
    const commentContent = within(commentItem).getByTestId('comment-content')
    expect(commentAuthor).toHaveTextContent('김개발')
    expect(commentContent).toHaveTextContent('모두들 화이팅!')
  })

  test('댓글을 등록할 수 있다.', async () => {
    const COMMENT_CONTENT = '댓글을 등록합니다!'
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
        postId: MOCK_POST_ID,
        content: COMMENT_CONTENT,
      }),
    )
  })

  test('댓글을 수정할 수 있다.', async () => {
    global.FormData = class {
      get = (key: string) => {
        if (key === FORM_CONTENT_KEY) return COMMENT_CONTENT
        return null
      }
    } as any
    const COMMENT_CONTENT = '댓글을 수정합니다!'
    const FORM_CONTENT_KEY = 'content'
    const axiosPutSpy = jest.spyOn(axios.Axios.prototype, 'put')
    await renderPage()

    const commentItems = await screen.findAllByTestId('comment-item')
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
      `${API_PATH.team.comment}/${MOCK_POST_COMMENT_ID}`,
      expect.objectContaining({
        content: COMMENT_CONTENT,
      }),
    )
  })

  test('댓글을 삭제할 수 있다.', async () => {
    const axiosDeleteSpy = jest.spyOn(axios.Axios.prototype, 'delete')
    await renderPage()

    const commentItems = await screen.findAllByTestId('comment-item')
    const commentItem = commentItems[0]
    const commentOptionButton = within(commentItem).getByRole('button', {
      name: '댓글 옵션 버튼',
    })
    await userEvent.click(commentOptionButton)

    const deleteMenu = await screen.findByRole('menuitem', { name: '삭제' })
    await userEvent.click(deleteMenu)

    // 삭제 확인 모달이 열렸는지 확인하고 클릭
    const confirmModalButtons = (
      await screen.findAllByTestId('modal-buttons')
    ).find((el) => within(el).queryByRole('button', { name: '삭제' })) // modal-buttons 요소가 1개 이상 등장하기 때문에 삭제 버튼을 가지고 있는 것만 찾아낸다.
    expect(confirmModalButtons).toBeDefined()
    const confirmButton = within(confirmModalButtons!).getByRole('button', {
      name: '삭제',
    })
    await userEvent.click(confirmButton)

    expect(axiosDeleteSpy).toHaveBeenCalledWith(
      `${API_PATH.team.comment}/${MOCK_POST_COMMENT_ID}`,
    )
  })
})
