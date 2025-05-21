import { http, HttpResponse } from 'msw'
import API_PATH from '@/constant/apiPath'
import {
  MOCK_NOTICE_ID,
  mockNoticeDetail,
  mockNoticeList,
} from '@/mocks/data/teamPage'
import { validateAccessToken } from '@/mocks/utils'
import { mockTeamInfo } from '../data/team'
import HTTP_STATUS from '@/constant/httpStatus'
import { IPagination } from '@/types/IPagination'
import { ITeamNotice } from '@/types/TeamBoardTypes'

export const handlers = [
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
    const filteredNoticeList = mockNoticeList.filter((notice) => {
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
        content: paginatedNoticeList,
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
    // 공지사항 반환
    if (numberPostId === MOCK_NOTICE_ID) {
      return HttpResponse.json(mockNoticeDetail, { status: HTTP_STATUS.ok })
    }

    // 존재하지 않는 게시글 ID일 때
    return HttpResponse.json(
      { message: '게시글을 찾을 수 없습니다.' },
      { status: HTTP_STATUS.notFound },
    )
  }),
]
