import { http, HttpResponse } from 'msw'
import { TeamStatus } from '@/app/teams/types/types'
import API_PATH from '@/constant/apiPath'
import HTTP_STATUS from '@/constant/httpStatus'
import { mockTeamList } from '@/mocks/data/team'
import { validateAccessToken } from '../utils'

export const handlers = [
  http.get(API_PATH.team.list, ({ request }) => {
    const validationResult = validateAccessToken(request)
    if (!validationResult.isValid) {
      return validationResult.response
    }

    const url = new URL(request.url)
    const teamStatus = url.searchParams.get('teamStatus') as TeamStatus
    // teamStatus가 없거나 비어있을 때
    if (!teamStatus || teamStatus.trim() === '') {
      return HttpResponse.json(
        { message: '잘못된 요청입니다.' },
        { status: HTTP_STATUS.badRequest },
      )
    }
    // teamStatus에 해당하는 팀 목록 필터링
    const filteredTeamList = mockTeamList.filter((team) => {
      return team.status === teamStatus
    })
    return HttpResponse.json(filteredTeamList, { status: HTTP_STATUS.ok })
  }),
]
