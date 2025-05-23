import { http, HttpResponse } from 'msw'
import { IMyPortfolio } from '@/app/my-page/profile/panel/MyPortfolio'
import API_PATH from '@/constant/apiPath'
import HTTP_STATUS from '@/constant/httpStatus'
import { validateAccessToken } from '../utils'
import { ErrorResponse } from '../types'

export const handlers = [
  http.get<never, never, IMyPortfolio[] | ErrorResponse>(
    API_PATH.myPortfolio.list,
    ({ request }) => {
      const validationResult = validateAccessToken(request)
      if (validationResult.isValid === false) {
        return validationResult.response
      }

      return HttpResponse.json([], { status: HTTP_STATUS.ok })
    },
  ),
]
