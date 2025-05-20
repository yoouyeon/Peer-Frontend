import { http, HttpResponse, DefaultBodyType } from 'msw'
import API_PATH from '@/constant/apiPath'
import HTTP_STATUS from '@/constant/httpStatus'
import { IPagination } from '@/types/IPagination'
import { IPost, ProjectType, TPostStatus } from '@/types/IPostDetail'
import { ErrorResponse } from '@/mocks/types'
import { validateAccessToken } from '@/mocks/utils'
import { mockRecruits } from '@/mocks/data/recruit'

type GetRecruitParams = {
  type: ProjectType
  page: string
  pageSize: string
  keyword: string
  due: string
  region1: string
  region2: string
  place: string
  status: TPostStatus
  tag: string
}
type GetRecruitResponse = IPagination<IPost[]>

export const handlers = [
  http.get<GetRecruitParams, DefaultBodyType, GetRecruitResponse>(
    API_PATH.recruit.get,
    ({ request }) => {
      const url = new URL(request.url)
      const type = url.searchParams.get('type') as ProjectType
      const page = Number(url.searchParams.get('page')) || 1
      const pageSize = Number(url.searchParams.get('pageSize')) || 6
      const keyword = url.searchParams.get('keyword') || ''
      const status = url.searchParams.get('status') as TPostStatus
      const tag = url.searchParams.get('tag') || ''

      // 필터링 로직
      const filteredRecruits = mockRecruits.filter((recruit) => {
        const isTypeMatch = type === 'ALL' || recruit.type === type
        const isKeywordMatch = recruit.title.includes(keyword)
        const isStatusMatch = !status || recruit.status === status
        const isTagMatch = !tag || recruit.tagList.some((t) => t.name === tag)

        return isTypeMatch && isKeywordMatch && isStatusMatch && isTagMatch
      })

      // 페이지네이션 로직
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const paginatedRecruits = filteredRecruits.slice(start, end)
      const totalElements = filteredRecruits.length
      const totalPages = Math.ceil(totalElements / pageSize)
      const last = page >= totalPages - 1

      return HttpResponse.json<GetRecruitResponse>({
        content: paginatedRecruits,
        pageable: {
          sort: {
            unsorted: true,
            sorted: false,
            empty: true,
          },
          pageSize,
          pageNumber: page,
          offset: start,
          paged: true,
          unpaged: false,
        },
        totalPages,
        totalElements,
        last,
        numberOfElements: paginatedRecruits.length,
        first: page === 0,
        size: pageSize,
        number: page,
        sort: {
          unsorted: true,
          sorted: false,
          empty: true,
        },
        empty: paginatedRecruits.length === 0,
      })
    },
  ),
  http.post<never, never, null | ErrorResponse>(
    `${API_PATH.recruit.favorite}/:recruitId`,
    ({ request }) => {
      const tokenValidationResult = validateAccessToken(request)
      if (tokenValidationResult.isValid === false)
        return tokenValidationResult.response

      return HttpResponse.json(null, { status: HTTP_STATUS.ok })
    },
  ),
]
