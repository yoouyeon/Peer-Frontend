import { http, HttpResponse, PathParams } from 'msw'
import * as jose from 'jose'
import API_PATH from '@/constant/apiPath'
import HTTP_STATUS from '@/constant/httpStatus'
import { EApiType } from '@/types/EApiType'
import { ErrorResponse } from '../types'
import {
  MOCK_ACCESS_TOKEN,
  MOCK_INIT_CODE,
  MOCK_INIT_SECRET,
  MOCK_REFRESH_TOKEN,
  MOCK_SIGN_UP_EMAIL,
  MOCK_SIGN_UP_PASSWORD,
  MOCK_VERIFY_CODE,
  MOCK_VERIFY_SEED,
  REFRESH_TOKEN_EXPIRATION_TIME,
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

type ReceiveBody = {
  code: string
  token: string
}

type ReceiveResponse = null | {
  accessToken: string
}

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
      const { code, token } = await request.json()

      if (code !== MOCK_VERIFY_CODE) {
        return HttpResponse.json(
          { message: '비정상적인 접근입니다.' },
          { status: HTTP_STATUS.badRequest },
        )
      }

      try {
        // JWT 토큰 복호화
        const secretKey = await new TextEncoder().encode(MOCK_VERIFY_SEED)
        const { payload } = await jose.jwtVerify(token, secretKey)

        // /get에서 받은 apiType에 따라 분기 처리
        switch (apiType) {
          case EApiType.SIGN_UP:
            return HttpResponse.json(null, { status: HTTP_STATUS.ok })
          case EApiType.SIGN_IN: {
            const { userEmail, password } = payload
            if (
              !(
                userEmail === MOCK_SIGN_UP_EMAIL &&
                password === MOCK_SIGN_UP_PASSWORD
              )
            ) {
              return HttpResponse.json(
                { message: 'Email 혹은 비밀번호가 잘못되었습니다!' },
                { status: HTTP_STATUS.unauthorized },
              )
            }
            return HttpResponse.json(
              { accessToken: MOCK_ACCESS_TOKEN },
              {
                status: HTTP_STATUS.ok,
                headers: {
                  'Set-Cookie': `refreshToken=${MOCK_REFRESH_TOKEN}; Path=/; HttpOnly; Secure; Max-Age=${
                    REFRESH_TOKEN_EXPIRATION_TIME / 1000
                  }`,
                },
              },
            )
          }
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
