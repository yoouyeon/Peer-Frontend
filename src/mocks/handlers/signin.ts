import { http, HttpResponse } from 'msw'
import API_PATH from '@/constant/apiPath'
import HTTP_STATUS from '@/constant/httpStatus'
import { MOCK_ACCESS_TOKEN, MOCK_REFRESH_TOKEN } from '../constants'

type ReissueResponse = { accessToken: string } | {}

export const handlers = [
  http.get<never, never, ReissueResponse>(
    API_PATH.signin.reissue,
    ({ cookies }) => {
      const refreshToken = cookies.refreshToken

      if (!refreshToken) {
        return HttpResponse.json({}, { status: HTTP_STATUS.unauthorized })
      }

      if (refreshToken !== MOCK_REFRESH_TOKEN) {
        return HttpResponse.json({}, { status: HTTP_STATUS.unauthorized })
      }

      return HttpResponse.json(
        { accessToken: MOCK_ACCESS_TOKEN },
        { status: HTTP_STATUS.ok },
      )
    },
  ),
]
