import { http, HttpResponse, PathParams } from 'msw'
import * as jose from 'jose'
import API_PATH from '@/constant/apiPath'
import HTTP_STATUS from '@/constant/httpStatus'
import { EApiType } from '@/types/EApiType'
import {
  MOCK_INIT_CODE,
  MOCK_INIT_SECRET,
  MOCK_VERIFY_CODE,
  MOCK_VERIFY_SEED,
} from '../constants'

type InitResponse = {
  secret: string
  code: string
}

type PostGetBody = {
  code: string
  token: string
}

type PostGetResponse = {
  code: string
  seed: string
}

type ErrorResponse = {
  message: string
}

type ReceiveBody = {
  code: string
  token: string
}

type ReceiveResponse = null

// /receive 에서 처리할 api
let apiType: EApiType | null = null

export const handlers = [
  http.get<never, never, InitResponse>(API_PATH.main.init, () => {
    return HttpResponse.json({
      secret: MOCK_INIT_SECRET,
      code: MOCK_INIT_CODE,
    })
  }),

  // 검증 API
  http.post<PathParams, PostGetBody, PostGetResponse | ErrorResponse>(
    API_PATH.main.get,
    async ({ request }) => {
      const { code, token } = await request.json()

      if (code !== MOCK_INIT_CODE) {
        return HttpResponse.json({} as ErrorResponse, { status: 400 })
      }

      try {
        const secretKey = await new TextEncoder().encode(MOCK_INIT_SECRET)
        const { payload } = await jose.jwtVerify(token, secretKey)

        const receivedApiType = payload.apiType as EApiType

        // apiType이 EApiType에 정의된 값인지 확인
        if (!Object.values(EApiType).includes(receivedApiType as EApiType)) {
          return HttpResponse.json(
            { message: '비정상적인 접근입니다.' },
            { status: HTTP_STATUS.badRequest },
          )
        }

        apiType = receivedApiType as EApiType
        return HttpResponse.json(
          { code: MOCK_VERIFY_CODE, seed: MOCK_VERIFY_SEED },
          { status: HTTP_STATUS.ok },
        )
      } catch (error) {
        return HttpResponse.json(
          { message: '비정상적인 접근입니다.' },
          { status: HTTP_STATUS.badRequest },
        )
      }
    },
  ),

  // 최종 데이터 수신 API
  http.post<PathParams, ReceiveBody, ReceiveResponse | ErrorResponse>(
    '/api/v1/main/receive',
    async ({ request }) => {
      // const { code, token } = await request.json()
      const { code } = await request.json()

      if (code !== MOCK_VERIFY_CODE) {
        return HttpResponse.json(
          { message: '비정상적인 접근입니다.' },
          { status: HTTP_STATUS.badRequest },
        )
      }

      try {
        // JWT 토큰 복호화 - 로그인 시에 사용
        // const secretKey = await new TextEncoder().encode(MOCK_VERIFY_SEED)
        // const { payload } = await jose.jwtVerify(token, secretKey)

        // /get에서 받은 apiType에 따라 분기 처리
        switch (apiType) {
          case EApiType.SIGN_UP:
            return HttpResponse.json(null, { status: HTTP_STATUS.ok })
          default:
            return HttpResponse.json(
              { message: '비정상적인 접근입니다.' },
              { status: HTTP_STATUS.badRequest },
            )
        }
      } catch (error) {
        return HttpResponse.json(
          { message: '비정상적인 접근입니다.' },
          { status: HTTP_STATUS.badRequest },
        )
      }
    },
  ),
]
