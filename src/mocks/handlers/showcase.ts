import { http, HttpResponse, DefaultBodyType } from 'msw'
import API_PATH from '@/constant/apiPath'
import { IPagination } from '@/types/IPagination'
import { ICardData } from '@/app/showcase/panel/types'

type GetShowcaseParams = {}
type GetShowcaseResponse = IPagination<ICardData[]>

export const handlers = [
  http.get<GetShowcaseParams, DefaultBodyType, GetShowcaseResponse>(
    API_PATH.showcase.get,
    () => {
      return HttpResponse.json<GetShowcaseResponse>({
        content: [],
        pageable: {
          sort: {
            unsorted: true,
            sorted: false,
            empty: true,
          },
          pageSize: 10,
          pageNumber: 0,
          offset: 0,
          paged: true,
          unpaged: false,
        },
        totalPages: 0,
        totalElements: 0,
        last: true,
        numberOfElements: 0,
        first: true,
        size: 5,
        number: 0,
        sort: {
          unsorted: true,
          sorted: false,
          empty: true,
        },
        empty: true,
      })
    },
  ),
]
