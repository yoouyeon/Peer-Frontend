import { http, HttpResponse } from 'msw'
import API_PATH from '@/constant/apiPath'
import HTTP_STATUS from '@/constant/httpStatus'
import { IUserProfile } from '@/types/IUserProfile'
import { MOCK_ACCESS_TOKEN, MOCK_SIGN_UP_EMAIL } from '../constants'

type ErrorResponse = {
  message: string
}

export const handlers = [
  http.get<never, never, IUserProfile | ErrorResponse>(
    API_PATH.profile.get,
    ({ request }) => {
      // authorization 헤더 존재 여부 확인
      const authHeader = request.headers.get('Authorization')
      if (!authHeader) {
        return HttpResponse.json(
          { message: '토큰이 존재하지 않습니다.' },
          { status: HTTP_STATUS.unauthorized },
        )
      }

      // 토큰 검증
      const [tokenType, accessToken] = authHeader.split(' ')
      if (tokenType !== 'Bearer' || !accessToken) {
        return HttpResponse.json(
          { message: '유효하지 않은 토큰입니다.' },
          { status: HTTP_STATUS.unauthorized },
        )
      }
      if (accessToken !== MOCK_ACCESS_TOKEN) {
        return HttpResponse.json(
          { message: '유효하지 않은 토큰입니다.' },
          { status: HTTP_STATUS.unauthorized },
        )
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
