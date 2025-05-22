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
  getNextCommentId,
  MOCK_TEAM_ID,
  mockCommentMap,
  mockPostMap,
} from '@/mocks/data/teamPage'
import { ITeamComment } from '@/types/TeamBoardTypes'

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

type PutPostParam = {
  postId: string
}

type PutPostBody = {
  title: string
  content: string
  image: null
}

type DeletePostParam = {
  postId: string
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

    // 댓글 반환 (공지사항 & 게시판)
    const postComments = mockCommentMap.get(numberPostId)
    if (postComments) {
      const comments = Array.from(postComments.values()).sort(
        (a, b) => a.commentId - b.commentId,
      )
      return HttpResponse.json(comments, {
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

      // 댓글 등록 (공지사항 & 게시판)
      const postComments = mockCommentMap.get(postId)
      if (postComments) {
        if (!content) {
          return HttpResponse.json(
            {
              message: '댓글을 입력해주세요.',
            },
            { status: HTTP_STATUS.badRequest },
          )
        }
        const newCommentId = getNextCommentId()
        postComments.set(newCommentId, {
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

      return HttpResponse.json(
        { message: '게시물을 찾을 수 없습니다.' },
        { status: HTTP_STATUS.notFound },
      )
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

      // 댓글 수정 (공지사항 & 게시판)
      const commentAndPostId = findCommentById(numberCommentId)
      if (commentAndPostId) {
        const { comment, postId } = commentAndPostId
        const postComments = mockCommentMap.get(postId)
        if (postComments) {
          comment.content = content
          postComments.set(numberCommentId, comment)
          mockCommentMap.set(postId, postComments)
          return HttpResponse.json(
            {
              message: '댓글이 수정되었습니다.',
            },
            { status: HTTP_STATUS.ok },
          )
        }
      }

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

      // commentId가 없거나 잘못된 값일 때
      const { commentId } = params
      if (!commentId || isNaN(Number(commentId))) {
        return HttpResponse.json(
          { message: '잘못된 요청입니다.' },
          { status: HTTP_STATUS.badRequest },
        )
      }

      // 댓글 삭제 (공지사항 & 게시판)
      const numberCommentId = Number(commentId)
      const commentAndPostId = findCommentById(numberCommentId)
      if (commentAndPostId) {
        const { postId } = commentAndPostId
        const postComments = mockCommentMap.get(postId)
        if (postComments) {
          postComments.delete(numberCommentId)
          mockCommentMap.set(postId, postComments)
          return HttpResponse.json(
            {
              message: '댓글이 삭제되었습니다.',
            },
            { status: HTTP_STATUS.ok },
          )
        }
      }

      // 존재하지 않는 댓글 ID일 때
      return HttpResponse.json(
        { message: '댓글을 찾을 수 없습니다.' },
        { status: HTTP_STATUS.notFound },
      )
    },
  ),

  http.put<PutPostParam, PutPostBody, null | ErrorResponse>(
    `${API_PATH.team.modifyPost}/:postId`,
    async ({ params, request }) => {
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
      const { title, content } = await request.json()
      // 게시글 수정
      const post = mockPostMap.get(numberPostId)
      if (post) {
        if (!title || !content) {
          return HttpResponse.json(
            {
              message: '제목과 내용을 입력해주세요.',
            },
            { status: HTTP_STATUS.badRequest },
          )
        }
        post.title = title
        post.content = content
        mockPostMap.set(numberPostId, post)
        return HttpResponse.json(
          { message: '게시글이 수정되었습니다.' },
          { status: HTTP_STATUS.ok },
        )
      }
      // 존재하지 않는 게시글 ID일 때
      return HttpResponse.json(
        { message: '게시글을 찾을 수 없습니다.' },
        { status: HTTP_STATUS.notFound },
      )
    },
  ),

  http.delete<DeletePostParam, never, null | ErrorResponse>(
    `${API_PATH.team.modifyPost}/:postId`,
    ({ params, request }) => {
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
      // 게시글 삭제
      const post = mockPostMap.get(numberPostId)
      if (post) {
        mockPostMap.delete(numberPostId)
        return HttpResponse.json(
          { message: '게시글이 삭제되었습니다.' },
          { status: HTTP_STATUS.ok },
        )
      }
      // 존재하지 않는 게시글 ID일 때
      return HttpResponse.json(
        { message: '게시글을 찾을 수 없습니다.' },
        { status: HTTP_STATUS.notFound },
      )
    },
  ),
]

export const findCommentById = (
  commentId: number,
):
  | {
      comment: ITeamComment
      postId: number
    }
  | undefined => {
  // 게시판 댓글 검색
  const entries = Array.from(mockCommentMap.entries())
  for (const [postId, postComments] of entries) {
    const comment = postComments.get(commentId)
    if (comment) {
      return {
        comment,
        postId,
      }
    }
  }
  return undefined
}
