import { HttpResponse, StrictRequest, StrictResponse } from 'msw'
import HTTP_STATUS from '@/constant/httpStatus'
import { MOCK_ACCESS_TOKEN } from '@/mocks/constants'

type ValidationResult =
  | {
      isValid: false
      response: StrictResponse<{ message: string }>
    }
  | {
      isValid: true
    }

export const validateAccessToken = (
  request: StrictRequest<any>,
): ValidationResult => {
  // authorization 헤더 존재 여부 확인
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) {
    return {
      isValid: false,
      response: HttpResponse.json(
        { message: '토큰이 존재하지 않습니다.' },
        { status: HTTP_STATUS.unauthorized },
      ),
    }
  }

  // 토큰 검증
  const [tokenType, accessToken] = authHeader.split(' ')
  if (tokenType !== 'Bearer' || !accessToken) {
    return {
      isValid: false,
      response: HttpResponse.json(
        { message: '유효하지 않은 토큰입니다.' },
        { status: HTTP_STATUS.unauthorized },
      ),
    }
  }
  if (accessToken !== MOCK_ACCESS_TOKEN) {
    return {
      isValid: false,
      response: HttpResponse.json(
        { message: '유효하지 않은 토큰입니다.' },
        { status: HTTP_STATUS.unauthorized },
      ),
    }
  }

  return { isValid: true }
}
