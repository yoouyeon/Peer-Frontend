import { http, HttpResponse } from 'msw'
import API_PATH from '@/constant/apiPath'
import {
  MOCK_BOARD_ID,
  MOCK_TEAM_ID,
  mockBoardList,
  mockPostMap,
} from '@/mocks/data/teamPage'
import { validateAccessToken } from '@/mocks/utils'
import { mockTeamInfo } from '../data/team'
import HTTP_STATUS from '@/constant/httpStatus'
import { IPagination } from '@/types/IPagination'
import { ITeamNotice, ITeamPost } from '@/types/TeamBoardTypes'

export const handlers = [
  http.get(`${API_PATH.teamPage.simple}/:teamId`, ({ params, request }) => {
    const validationResult = validateAccessToken(request)
    if (!validationResult.isValid) {
      return validationResult.response
    }

    const { teamId } = params

    // teamId가 없거나 잘못된 값일 때
    if (!teamId || isNaN(Number(teamId))) {
      return HttpResponse.json(
        { message: '잘못된 요청입니다.' },
        { status: HTTP_STATUS.badRequest },
      )
    }
    // 존재하지 않는 팀 ID일 때
    const numberTeamId = Number(teamId)
    if (numberTeamId !== MOCK_TEAM_ID) {
      return HttpResponse.json(
        { message: '팀 정보를 찾을 수 없습니다.' },
        { status: HTTP_STATUS.notFound },
      )
    }

    return HttpResponse.json(mockBoardList, {
      status: HTTP_STATUS.ok,
    })
  }),
  http.get(`${API_PATH.teamPage.notice}/:teamId`, ({ params, request }) => {
    const validationResult = validateAccessToken(request)
    if (!validationResult.isValid) {
      return validationResult.response
    }

    const url = new URL(request.url)
    const { teamId } = params
    const keyword = url.searchParams.get('keyword') || ''
    const page = Number(url.searchParams.get('page') || 1)
    const pageSize = Number(url.searchParams.get('pageSize') || 10)

    // teamId가 없거나 잘못된 값일 때
    if (!teamId || isNaN(Number(teamId))) {
      return HttpResponse.json(
        { message: '잘못된 요청입니다.' },
        { status: HTTP_STATUS.badRequest },
      )
    }
    // 존재하지 않는 팀 ID일 때
    if (Number(teamId) !== mockTeamInfo.id) {
      return HttpResponse.json(
        { message: '팀 정보를 찾을 수 없습니다.' },
        { status: HTTP_STATUS.notFound },
      )
    }

    // 필터링
    const noticeList = Array.from(mockPostMap.values()).filter(
      (post) => post.type === 'notice',
    )
    const filteredNoticeList = noticeList.filter((notice) => {
      if (keyword === '') return true
      return notice.title.includes(keyword)
    })

    // 페이지네이션
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedNoticeList = filteredNoticeList.slice(start, end)
    const totalElements = filteredNoticeList.length
    const totalPages = Math.ceil(totalElements / pageSize)
    const last = page >= totalPages - 1

    return HttpResponse.json<IPagination<ITeamNotice[]>>(
      {
        content: paginatedNoticeList as ITeamNotice[],
        pageable: {
          sort: {
            unsorted: true,
            sorted: false,
            empty: true,
          },
          pageNumber: page,
          pageSize,
          offset: start,
          paged: true,
          unpaged: false,
        },
        totalPages,
        totalElements,
        last,
        numberOfElements: paginatedNoticeList.length,
        first: page === 0,
        size: pageSize,
        number: page,
        sort: {
          unsorted: true,
          sorted: false,
          empty: true,
        },
        empty: paginatedNoticeList.length === 0,
      },
      { status: HTTP_STATUS.ok },
    )
  }),

  http.get(`${API_PATH.teamPage.post}/:postId`, ({ params, request }) => {
    const validationResult = validateAccessToken(request)
    if (!validationResult.isValid) {
      return validationResult.response
    }

    const { postId } = params
    // postId가 없거나 잘못된 값일 때
    if (!postId || isNaN(Number(postId))) {
      return HttpResponse.json(
        { message: '잘못된 요청입니다.' },
        { status: HTTP_STATUS.badRequest },
      )
    }

    const numberPostId = Number(postId)
    const post = mockPostMap.get(numberPostId)
    if (post) {
      return HttpResponse.json(post, { status: HTTP_STATUS.ok })
    }

    // 존재하지 않는 게시글 ID일 때
    return HttpResponse.json(
      { message: '게시글을 찾을 수 없습니다.' },
      { status: HTTP_STATUS.notFound },
    )
  }),

  http.get(`${API_PATH.teamPage.posts}/:boardId`, ({ params, request }) => {
    const validationResult = validateAccessToken(request)
    if (!validationResult.isValid) {
      return validationResult.response
    }

    const { boardId } = params
    if (!boardId || isNaN(Number(boardId))) {
      return HttpResponse.json(
        { message: '잘못된 요청입니다.' },
        { status: HTTP_STATUS.badRequest },
      )
    }
    const numberBoardId = Number(boardId)
    // 존재하지 않는 게시판 ID일 때
    if (numberBoardId !== MOCK_BOARD_ID) {
      return HttpResponse.json(
        { message: '게시판을 찾을 수 없습니다.' },
        { status: HTTP_STATUS.notFound },
      )
    }
    const url = new URL(request.url)
    const keyword = url.searchParams.get('keyword') || ''
    const page = Number(url.searchParams.get('page') || 1)
    const pageSize = Number(url.searchParams.get('pageSize') || 10)

    // 게시판은 1개 뿐
    const postList = Array.from(mockPostMap.values()).filter(
      (post) => post.type === 'post',
    )
    // 필터링
    const filteredPostsList = Array.from(postList.values()).filter((post) => {
      if (keyword === '') return true
      return post.title.includes(keyword)
    })

    // 페이지네이션
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedNoticeList = filteredPostsList.slice(start, end)
    const totalElements = filteredPostsList.length
    const totalPages = Math.ceil(totalElements / pageSize)
    const last = page >= totalPages - 1

    return HttpResponse.json<IPagination<ITeamPost[]>>(
      {
        content: paginatedNoticeList as ITeamPost[],
        pageable: {
          sort: {
            unsorted: true,
            sorted: false,
            empty: true,
          },
          pageNumber: page,
          pageSize,
          offset: start,
          paged: true,
          unpaged: false,
        },
        totalPages,
        totalElements,
        last,
        numberOfElements: paginatedNoticeList.length,
        first: page === 0,
        size: pageSize,
        number: page,
        sort: {
          unsorted: true,
          sorted: false,
          empty: true,
        },
        empty: paginatedNoticeList.length === 0,
      },
      { status: HTTP_STATUS.ok },
    )
  }),
]
