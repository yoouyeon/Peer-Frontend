import { http, HttpResponse } from 'msw'
import { TeamStatus } from '@/app/teams/types/types'
import API_PATH from '@/constant/apiPath'
import HTTP_STATUS from '@/constant/httpStatus'
import { ITeamInfo } from '@/types/ITeamInfo'
import { mockTeamList, mockTeamInfo, mockTeamMember } from '@/mocks/data/team'
import { validateAccessToken } from '@/mocks/utils'
import { ErrorResponse } from '@/mocks/types'
import { ITeamMemberInfo } from '@/app/teams/[id]/panel/TeamInfoContainer'
import {
  MOCK_NOTICE_ID,
  MOCK_TEAM_ID,
  mockNoticeComment,
} from '@/mocks/data/teamPage'

type TeamMainParam = {
  teamId: string
}

type PostCommentBody = {
  teamId: number
  postId: number
  content: string
}

type PutCommentParam = {
  commentId: string
}

type PutCommentBody = {
  content: string
}

type DeleteCommentParam = {
  commentId: string
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
  http.get(`${API_PATH.team.comment}/:postId`, ({ params, request }) => {
    const validationResult = validateAccessToken(request)
    if (!validationResult.isValid) {
      return validationResult.response
    }

    const { postId } = params
    // postId가 없거나 잘못된 값일 때
    if (!postId || isNaN(Number(postId))) {
      return HttpResponse.json(
        { message: '잘못된 요청입니다.' },
        { status: HTTP_STATUS.badRequest },
      )
    }

    const numberPostId = Number(postId)
    // 공지사항 댓글 반환
    if (numberPostId === MOCK_NOTICE_ID) {
      // 공지사항 댓글을 배열로 변환
      const noticeComments = Array.from(mockNoticeComment.values()).sort(
        (a, b) => a.commentId - b.commentId,
      )
      return HttpResponse.json(noticeComments, {
        status: HTTP_STATUS.ok,
      })
    }

    // 존재하지 않는 게시글 ID일 때
    return HttpResponse.json(
      { message: '게시글을 찾을 수 없습니다.' },
      { status: HTTP_STATUS.notFound },
    )
  }),

  http.post<never, PostCommentBody, never>(
    API_PATH.team.comment,
    async ({ request }) => {
      const validationResult = validateAccessToken(request)
      if (!validationResult.isValid) {
        return validationResult.response
      }

      const { teamId, postId, content } = await request.json()

      if (teamId !== MOCK_TEAM_ID) {
        return HttpResponse.json(
          { message: '팀 정보를 찾을 수 없습니다.' },
          { status: HTTP_STATUS.notFound },
        )
      }

      // 공지사항 댓글 등록
      if (postId === MOCK_NOTICE_ID) {
        if (!content) {
          return HttpResponse.json(
            {
              message: '댓글을 입력해주세요.',
            },
            { status: HTTP_STATUS.badRequest },
          )
        }
        const newCommentId = mockNoticeComment.size + 1
        mockNoticeComment.set(newCommentId, {
          commentId: newCommentId,
          authorImage: '',
          authorNickname: '길동홍',
          content,
          createAt: new Date(),
          authorId: 2,
          isAuthor: true,
        })
        return HttpResponse.json(
          {
            message: '댓글이 등록되었습니다.',
          },
          { status: HTTP_STATUS.created },
        )
      }
    },
  ),
  http.put<PutCommentParam, PutCommentBody, never>(
    `${API_PATH.team.comment}/:commentId`,
    async ({ params, request }) => {
      const validationResult = validateAccessToken(request)
      if (!validationResult.isValid) {
        return validationResult.response
      }

      const { commentId } = params
      // commentId가 없거나 잘못된 값일 때
      if (!commentId || isNaN(Number(commentId))) {
        return HttpResponse.json(
          { message: '잘못된 요청입니다.' },
          { status: HTTP_STATUS.badRequest },
        )
      }

      const { content } = await request.json()
      const numberCommentId = Number(commentId)
      // 공지사항 댓글 수정
      const targetComment = mockNoticeComment.get(numberCommentId)
      if (targetComment) {
        targetComment.content = content
        mockNoticeComment.set(numberCommentId, targetComment)
        return HttpResponse.json(
          {
            message: '댓글이 수정되었습니다.',
          },
          { status: HTTP_STATUS.ok },
        )
      }

      // TODO : 게시물 댓글 수정

      // 존재하지 않는 댓글 ID일 때
      return HttpResponse.json(
        { message: '댓글을 찾을 수 없습니다.' },
        { status: HTTP_STATUS.notFound },
      )
    },
  ),

  http.delete<DeleteCommentParam, never, never>(
    `${API_PATH.team.comment}/:commentId`,
    ({ params, request }) => {
      const validationResult = validateAccessToken(request)
      if (!validationResult.isValid) {
        return validationResult.response
      }

      const { commentId } = params
      // commentId가 없거나 잘못된 값일 때
      if (!commentId || isNaN(Number(commentId))) {
        return HttpResponse.json(
          { message: '잘못된 요청입니다.' },
          { status: HTTP_STATUS.badRequest },
        )
      }

      const numberCommentId = Number(commentId)
      if (mockNoticeComment.has(numberCommentId)) {
        mockNoticeComment.delete(numberCommentId)
        return HttpResponse.json(
          {
            message: '댓글이 삭제되었습니다.',
          },
          { status: HTTP_STATUS.ok },
        )
      }

      // TODO : 게시물 댓글 삭제
      // 존재하지 않는 댓글 ID일 때
      return HttpResponse.json(
        { message: '댓글을 찾을 수 없습니다.' },
        { status: HTTP_STATUS.notFound },
      )
    },
  ),
]
