import { act, render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import TeamNotice from '@/app/teams/[id]/notice/@list/page'
import useTeamPageState from '@/states/useTeamPageState'
import {
  MOCK_NOTICE_ID,
  MOCK_TEAM_ID,
  mockPostDataStore,
  POST_TYPE,
} from '@/mocks/data/teamPage'
import { MOCK_ACCESS_TOKEN } from '@/mocks/constants'
import { server } from '@/mocks/server'
import HTTP_STATUS from '@/constant/httpStatus'
import API_PATH from '@/constant/apiPath'

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
window.alert = jest.fn()

window.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn(),
  root: null,
  rootMargin: '0px',
  thresholds: [0],
}))

const setNoticeSpy = jest.spyOn(useTeamPageState.getState(), 'setNotice')

const renderPage = () => {
  return render(<TeamNotice params={{ id: MOCK_TEAM_ID.toString() }} />)
}

// NOTE : 위치를 변경하는 경우 잘 테스트되지 않음. (server.use()가 의도한대로 동작하지 않음)
describe('에러 처리 테스트', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
  })

  afterEach(() => {
    server.resetHandlers()
  })

  test('403 에러 발생 시 알림을 띄우고 팀 리스트 페이지로 이동한다. ', async () => {
    server.use(
      http.get(`${API_PATH.teamPage.notice}/:teamId`, () => {
        return HttpResponse.json(
          { message: '접근 권한이 없습니다.' },
          { status: HTTP_STATUS.forbidden },
        )
      }),
    )

    renderPage()

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        '팀 페이지에 접근할 권한이 없습니다.',
      )
      expect(mockPush).toHaveBeenCalledWith('/team-list')
    })
  })

  test('그 외의 에러 발생 시 알림을 띄우고 팀 리스트 페이지로 이동한다.', async () => {
    server.use(
      http.get(`${API_PATH.teamPage.notice}/:teamId`, () => {
        return HttpResponse.json(
          { message: '문제가 발생했습니다.' },
          { status: HTTP_STATUS.internalServerError },
        )
      }),
    )

    renderPage()

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        '팀 페이지에 접근할 수 없습니다.',
      )
      expect(mockPush).toHaveBeenCalledWith('/team-list')
    })
  })
})

describe('데이터 페칭 테스트', () => {
  beforeAll(() => {
    // mock 공지사항을 10개 추가
    mockPostDataStore.addMockPost(10, POST_TYPE.NOTICE)
  })

  test('공지사항 목록을 정상적으로 가져온다.', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('첫번째 공지사항')).toBeInTheDocument()
      expect(screen.getAllByTestId('post-list-item')).toHaveLength(10) // 한 페이지에 10개 공지사항이 랜더링 되어야 함
    })
  })

  test('키워드로 검색했을 때 필터링 된 데이터를 가져온다.', async () => {
    renderPage()
    // 데이터가 로드될 때까지 기다림
    await waitFor(() => {
      expect(screen.getByText('첫번째 공지사항')).toBeInTheDocument()
    })
    const searchIconButton = screen.getByRole('button', { name: '검색창 열기' })
    await act(async () => {
      searchIconButton.click()
    })
    // 검색창이 열릴 때까지 기다림
    await waitFor(() => {
      expect(
        screen.getByRole('textbox', { name: '검색어 입력' }),
      ).toBeInTheDocument()
    })
    const searchInput = screen.getByRole('textbox', { name: '검색어 입력' })
    const searchButton = screen.getByRole('button', { name: '검색' })
    const KEYWORD = '첫번째 공지사항'
    await userEvent.type(searchInput, KEYWORD)
    await userEvent.click(searchButton)
    await waitFor(() => {
      expect(screen.getByText(KEYWORD)).toBeInTheDocument()
      expect(screen.getAllByTestId('post-list-item')).toHaveLength(1) // 검색어에 해당하는 공지사항이 1개여야 함
    })
  })
  // 🚨 안됨
  // test('스크롤 시 추가 데이터를 가져온다.', async () => {
  //   renderPage()
  //   await waitFor(() => {
  //     expect(screen.getByText('첫번째 공지사항')).toBeInTheDocument()
  //   })
  //   // FIXME : 무한스크롤 요청이 되지 않음.
  //   await waitFor(() => {
  //     expect(screen.getAllByTestId('post-list-item')).toHaveLength(11)
  //   })
  // })
})

describe('사용자 인터렉션 테스트', () => {
  const getNewPostButton = () => {
    return screen.getByRole('button', { name: '새 글쓰기' })
  }

  test('새 글쓰기 버튼을 클릭하면 공지사항 작성 페이지로 이동한다.', async () => {
    renderPage()

    const newPostButton = getNewPostButton()
    await act(async () => {
      newPostButton.click()
    })

    expect(setNoticeSpy).toHaveBeenCalledWith('EDIT')
    expect(useTeamPageState.getState().boardType).toBe('EDIT')
  })

  test('게시글 클릭 시 상세 보기 페이지로 이동한다.', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('첫번째 공지사항')).toBeInTheDocument()
    })

    const firstPost = screen.getAllByTestId('post-list-item')[0]
    await act(async () => {
      firstPost.click()
    })

    expect(setNoticeSpy).toHaveBeenCalledWith('DETAIL', MOCK_NOTICE_ID)
    expect(useTeamPageState.getState().boardType).toBe('DETAIL')
  })
})
