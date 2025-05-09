import { http, HttpResponse } from 'msw'
import API_PATH from '@/constant/apiPath'
import HTTP_STATUS from '@/constant/httpStatus'
import { isEmail, isValidNickname } from '@/utils/regex'
import { ErrorResponse } from '../types'
import {
  EXISTING_EMAIL,
  EXISTING_NICKNAME,
  FAIL_EMAIL,
  MOCK_CODE,
} from '../constants'

type EmailRequest = {
  email: string
}

type EmailResponse = {
  code: string
}

type CodeRequest = {
  email: string
  code: string
}

type NicknameRequest = {
  nickname: string
}
export const handlers = [
  // 이메일 인증 요청
  http.post<never, EmailRequest, EmailResponse | ErrorResponse>(
    API_PATH.signup.email,
    async ({ request }) => {
      const { email } = await request.json()

      // 이메일이 비어있을 때
      if (!email || email.trim() === '') {
        return HttpResponse.json(
          { message: '인증 코드를 받을 이메일을 입력해주세요.' },
          { status: HTTP_STATUS.badRequest },
        )
      }

      // 이메일 형식이 올바르지 않은 경우
      if (!isEmail.test(email)) {
        return HttpResponse.json(
          { message: '이메일 형식을 다시 확인해주세요.' },
          { status: HTTP_STATUS.badRequest },
        )
      }

      // 이미 가입된 이메일인 경우
      if (email === EXISTING_EMAIL) {
        return HttpResponse.json(
          { message: '이미 존재하는 이메일입니다.' },
          { status: HTTP_STATUS.conflict },
        )
      }

      // 이메일 전송에 실패한 경우
      if (email === FAIL_EMAIL) {
        return HttpResponse.json(
          { message: '이메일 전송에 실패했습니다.' },
          { status: HTTP_STATUS.internalServerError }, // 실제 서버는 403 반환, 하지만 이메일 전송 오류는 500에 더 가까운 것 같음
        )
      }

      // 이메일 전송 성공
      // 테스트 환경에서는 이메일 전송을 생략하고 코드를 바로 응답
      return HttpResponse.json({ code: MOCK_CODE }, { status: HTTP_STATUS.ok })
    },
  ),

  // 인증코드 확인
  http.post<never, CodeRequest, null | ErrorResponse>(
    API_PATH.signup.code,
    async ({ request }) => {
      const { email, code } = await request.json()

      // 이메일이 올바르지 않은 경우
      if (!email || email.trim() === '' || !isEmail.test(email)) {
        return HttpResponse.json(
          { message: '잘못된 이메일입니다!' },
          { status: HTTP_STATUS.badRequest },
        )
      }

      // 인증코드가 올바르지 않은 경우
      if (code !== MOCK_CODE) {
        return HttpResponse.json(
          { message: '잘못된 인증 코드입니다!' },
          { status: HTTP_STATUS.unauthorized },
        )
      }

      // 인증코드 확인 성공
      return HttpResponse.json(null, { status: HTTP_STATUS.ok })
    },
  ),

  // 닉네임 중복 확인
  http.post<never, NicknameRequest, null | ErrorResponse>(
    API_PATH.signup.nickname,
    async ({ request }) => {
      const { nickname } = await request.json()

      // 닉네임 형식이 올바르지 않은 경우
      if (!isValidNickname.test(nickname)) {
        return HttpResponse.json(
          { message: '유효하지 않은 닉네임입니다.' },
          { status: HTTP_STATUS.badRequest },
        )
      }

      // 이미 사용중인 닉네임인 경우
      if (nickname === EXISTING_NICKNAME) {
        return HttpResponse.json(
          { message: '이미 사용중인 닉네임입니다.' },
          { status: HTTP_STATUS.conflict },
        )
      }

      // 닉네임 중복 확인 성공
      return HttpResponse.json(null, { status: HTTP_STATUS.ok })
    },
  ),
]
