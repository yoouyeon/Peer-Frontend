import { http, HttpResponse } from 'msw'
import API_PATH from '@/constant/apiPath'
import HTTP_STATUS from '@/constant/httpStatus'
import { IUserProfile } from '@/types/IUserProfile'
import { MOCK_SIGN_UP_EMAIL } from '../constants'
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

      const userInfo: IUserProfile = {
        id: 1,
        nickname: '길동홍',
        profileImageUrl: '',
        introduction: '안녕하세요. 홍길동입니다.',
        linkList: [],
        representAchievement: '',
        achievements: [],
        association: null,
        email: MOCK_SIGN_UP_EMAIL,
        skillList: [],
        portfolioVisibility: true,
      }

      return HttpResponse.json(userInfo, { status: HTTP_STATUS.ok })
    },
  ),
]
