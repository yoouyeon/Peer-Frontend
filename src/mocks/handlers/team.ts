import { http, HttpResponse } from 'msw'
import { TeamStatus } from '@/app/teams/types/types'
import API_PATH from '@/constant/apiPath'
import HTTP_STATUS from '@/constant/httpStatus'
import { ITeamInfo } from '@/types/ITeamInfo'
import { mockTeamList, mockTeamInfo, mockTeamMember } from '@/mocks/data/team'
import { validateAccessToken } from '@/mocks/utils'
import { ErrorResponse } from '@/mocks/types'
import { ITeamMemberInfo } from '@/app/teams/[id]/panel/TeamInfoContainer'

type TeamMainParam = {
  teamId: string
}

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

  http.get<TeamMainParam, never, ITeamInfo | ErrorResponse>(
    `${API_PATH.team.main}/:teamId`,
    ({ params, request }) => {
      const validationResult = validateAccessToken(request)
      if (!validationResult.isValid) {
        return validationResult.response
      }

      const { teamId } = params
      // teamId가 없거나 잘못된 값일 때
      if (!teamId || isNaN(Number(teamId))) {
        return HttpResponse.json(
          { message: '잘못된 요청입니다.' },
          { status: HTTP_STATUS.badRequest },
        )
      }

      // 존재하지 않는 팀 ID일 때
      if (Number(teamId) !== mockTeamInfo.id) {
        return HttpResponse.json(
          { message: '팀 정보를 찾을 수 없습니다.' },
          { status: HTTP_STATUS.notFound },
        )
      }

      // 팀 정보를 반환
      return HttpResponse.json(mockTeamInfo, {
        status: HTTP_STATUS.ok,
      })
    },
  ),

  http.get<TeamMainParam, never, Array<ITeamMemberInfo> | ErrorResponse>(
    `${API_PATH.team.member}/:teamId`,
    ({ params, request }) => {
      const validationResult = validateAccessToken(request)
      if (!validationResult.isValid) {
        return validationResult.response
      }

      const { teamId } = params
      // teamId가 없거나 잘못된 값일 때
      if (!teamId || isNaN(Number(teamId))) {
        return HttpResponse.json(
          { message: '잘못된 요청입니다.' },
          { status: HTTP_STATUS.badRequest },
        )
      }

      // 존재하지 않는 팀 ID일 때
      if (Number(teamId) !== mockTeamInfo.id) {
        return HttpResponse.json(
          { message: '팀 정보를 찾을 수 없습니다.' },
          { status: HTTP_STATUS.notFound },
        )
      }

      // 팀원의 정보를 반환
      return HttpResponse.json(mockTeamMember, {
        status: HTTP_STATUS.ok,
      })
    },
  ),
]
