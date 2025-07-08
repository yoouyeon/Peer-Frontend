import { render, waitFor, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { SWRConfig } from 'swr'
import { http, HttpResponse } from 'msw'
import axios from 'axios'
import TeamBoard from '@/app/teams/[id]/board/@list/page'
import API_PATH from '@/constant/apiPath'
import {
  MOCK_BOARD_ID,
  MOCK_POST_ID,
  MOCK_TEAM_ID,
  mockPostDataStore,
  POST_TYPE,
} from '@/mocks/data/teamPage'
import { server } from '@/mocks/server'
import { MOCK_ACCESS_TOKEN } from '@/mocks/constants'
import useTeamPageState from '@/states/useTeamPageState'

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
window.alert = jest.fn()
let mockCallback: IntersectionObserverCallback
window.IntersectionObserver = jest.fn((callback) => {
  mockCallback = callback
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

const renderPage = () => {
  return render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <TeamBoard params={{ id: MOCK_TEAM_ID.toString() }} />
    </SWRConfig>,
  )
}

describe('게시판 데이터 페칭', () => {
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

  test('팀 게시판이 존재하는 경우에는 해당 게시판 데이터를 가져온다.', async () => {
    const axiosGetSpy = jest.spyOn(axios.Axios.prototype, 'get')
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('게시판 관리')).toBeInTheDocument()
      expect(axiosGetSpy).toHaveBeenLastCalledWith(
        `${API_PATH.teamPage.posts}/${MOCK_BOARD_ID}?&size=10&keyword=&page=1`,
      )
    })
  })

  test('팀 게시판이 존재하지 않는 경우에는 안내 메시지를 띄운다.', async () => {
    server.use(
      http.get(`${API_PATH.teamPage.simple}/${MOCK_TEAM_ID}`, () => {
        return HttpResponse.json([], { status: 200 })
      }),
    )
    renderPage()
    await waitFor(() => {
      expect(
        screen.getByText('게시판이 존재하지 않습니다.', { exact: false }),
      ).toBeInTheDocument()
    })
  })

  test('에러가 발생한 경우에는 alert를 띄우고 팀 리스트 페이지로 이동한다.', async () => {
    server.use(
      http.get(`${API_PATH.teamPage.simple}/${MOCK_TEAM_ID}`, () => {
        return HttpResponse.json([], { status: 403 })
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
})

describe('게시글 목록 페칭', () => {
  const BASE_POST_COUNT = 10
  beforeAll(() => {
    // mock 게시글을 10개 추가
    mockPostDataStore.addMockPost(BASE_POST_COUNT, POST_TYPE.POST)
  })
  test('게시글 목록을 정상적으로 불러온다.', async () => {
    const EXPECTED_POST_COUNT = BASE_POST_COUNT
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('첫번째 게시글')).toBeInTheDocument()
      expect(screen.getAllByTestId('post-list-item')).toHaveLength(
        EXPECTED_POST_COUNT,
      )
    })
  })
  test('키워드로 검색했을 때 필터링된 게시글 목록을 불러온다.', async () => {
    const EXPECTED_POST_COUNT = 1 // 검색어에 해당하는 게시글이 1개여야 함
    renderPage()

    // 검색창 열어 검색어 입력
    const searchIconButton = await screen.findByRole('button', {
      name: '검색창 열기',
    })
    await userEvent.click(searchIconButton)
    const searchInput = await screen.findByRole('textbox', {
      name: '검색어 입력',
    })
    const searchButton = await screen.findByRole('button', {
      name: '검색',
    })
    const KEYWORD = '첫번째 게시글'
    await userEvent.type(searchInput, KEYWORD)
    await userEvent.click(searchButton)

    await waitFor(() => {
      expect(screen.getByText(KEYWORD)).toBeInTheDocument()
      expect(screen.getAllByTestId('post-list-item')).toHaveLength(
        EXPECTED_POST_COUNT,
      )
    })
  })
  test('스크롤 시 추가 데이터를 가져온다.', async () => {
    const EXPECTED_POST_COUNT = BASE_POST_COUNT + 1 // 스크롤 시 1개가 추가되어 총 11개가 되어야 함
    renderPage()
    // 데이터가 로드될 때까지 기다림
    await waitFor(() => {
      expect(screen.getAllByTestId('post-list-item')).toHaveLength(
        BASE_POST_COUNT,
      )
    })
    // 스크롤 이벤트 발생
    act(() => {
      mockCallback(
        [{ isIntersecting: true, target: {} } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })
    await waitFor(() => {
      expect(screen.getAllByTestId('post-list-item')).toHaveLength(
        EXPECTED_POST_COUNT,
      )
    })
  })
})

describe('사용자 인터랙션', () => {
  let setBoardSpy: jest.SpyInstance

  beforeEach(() => {
    setBoardSpy = jest.spyOn(useTeamPageState.getState(), 'setBoard')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('새 글쓰기 버튼을 클릭하면 새 글 작성 페이지로 이동한다.', async () => {
    renderPage()
    const newPostButton = await screen.findByRole('button', {
      name: '새 글쓰기',
    })
    await userEvent.click(newPostButton)

    expect(setBoardSpy).toHaveBeenLastCalledWith('EDIT', MOCK_BOARD_ID)
    expect(useTeamPageState.getState().boardType).toBe('EDIT')
  })
  test('게시글을 클릭하면 게시글 상세 페이지로 이동한다.', async () => {
    renderPage()
    const postItems = await screen.findAllByTestId('post-list-item')
    await userEvent.click(postItems[0])

    expect(setBoardSpy).toHaveBeenLastCalledWith(
      'DETAIL',
      MOCK_BOARD_ID,
      MOCK_POST_ID,
    )
    expect(useTeamPageState.getState().boardType).toBe('DETAIL')
  })
})
