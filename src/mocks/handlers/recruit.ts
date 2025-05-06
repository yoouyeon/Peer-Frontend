import { http, HttpResponse, DefaultBodyType } from 'msw'
import API_PATH from '@/constant/apiPath'
import { IPagination } from '@/types/IPagination'
import { IPost } from '@/types/IPostDetail'

type GetRecruitParams = {}
type GetRecruitResponse = IPagination<IPost[]>

export const handlers = [
  http.get<GetRecruitParams, DefaultBodyType, GetRecruitResponse>(
    API_PATH.recruit.get,
    () => {
      return HttpResponse.json<GetRecruitResponse>({
        content: [
          {
            recruit_id: 1,
            title: 'Mock Recruitment Title',
            image: '',
            user_id: 'user123',
            user_nickname: 'Mock User',
            user_thumbnail: '',
            status: 'ACTIVE',
            tagList: [],
            favorite: false,
          },
        ],
        pageable: {
          sort: {
            unsorted: true,
            sorted: false,
            empty: true,
          },
          pageSize: 6,
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
        size: 7,
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
