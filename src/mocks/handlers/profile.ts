import { http, HttpResponse } from 'msw'
import API_PATH from '@/constant/apiPath'
import HTTP_STATUS from '@/constant/httpStatus'
import { IUserProfile } from '@/types/IUserProfile'
import { MOCK_USER_PROFILE } from '../constants'
import { validateAccessToken } from '../utils'
import { ErrorResponse } from '../types'

export const handlers = [
  http.get<never, never, IUserProfile | ErrorResponse>(
    API_PATH.profile.get,
    ({ request }) => {
      const validationResult = validateAccessToken(request)
      if (validationResult.isValid === false) {
        return validationResult.response
      }

      return HttpResponse.json(MOCK_USER_PROFILE, { status: HTTP_STATUS.ok })
    },
  ),
]
