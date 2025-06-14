import { http, HttpResponse } from 'msw'
import API_PATH from '@/constant/apiPath'
import HTTP_STATUS from '@/constant/httpStatus'
import { validateAccessToken } from '../utils'
import { ErrorResponse } from '../types'

export const handlers = [
  http.get<never, never, ErrorResponse | {}>(API_PATH.logout, ({ request }) => {
    const validateResult = validateAccessToken(request)
    if (validateResult.isValid === false) {
      return validateResult.response
    }

    return HttpResponse.json({}, { status: HTTP_STATUS.ok })
  }),
]
