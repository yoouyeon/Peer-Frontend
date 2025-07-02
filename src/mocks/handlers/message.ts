import { http, HttpResponse } from 'msw'
import API_PATH from '@/constant/apiPath'
import HTTP_STATUS from '@/constant/httpStatus'
import {
  IConversationList,
  IMessageListData,
  IMessageTarget,
} from '@/types/IMessage'
import { ErrorResponse } from '../types'
import { validateAccessToken } from '../utils'

type ConversationListRequest = {
  targetId: number
  conversationId: number
}

type DeleteMessageRequest = {
  target: {
    conversationId: number
  }[]
}

type SearchUserRequest = {
  keyword: string
}

type NewMessageRequest = {
  targetId: number
  content: string
}

const MOCK_CONVERSATION_ID = 1
export const MOCK_TARGET = {
  userId: 2,
  userEmail: 'kimyounghee@test.com',
  userNickname: '김영희',
  userProfile: '',
  deleted: false,
} as const

let messageList: IMessageListData[] = [
  {
    targetId: MOCK_TARGET.userId,
    conversationId: MOCK_CONVERSATION_ID,
    targetNickname: MOCK_TARGET.userNickname,
    targetProfile: MOCK_TARGET.userProfile,
    unreadMsgNumber: 1,
    latestContent: '안녕하세요',
    latestDate: '2025-05-10',
    latestMsgId: 1,
  },
]

export const handlers = [
  http.get<never, never, IMessageListData[] | ErrorResponse>(
    API_PATH.message.list,
    ({ request }) => {
      const validationResult = validateAccessToken(request)
      if (!validationResult.isValid) {
        return validationResult.response
      }

      return HttpResponse.json(messageList, {
        status: HTTP_STATUS.ok,
      })
    },
  ),

  http.delete<never, DeleteMessageRequest, IMessageListData[] | ErrorResponse>(
    API_PATH.message.deleteMessage,
    async ({ request }) => {
      const validationResult = validateAccessToken(request)
      if (!validationResult.isValid) {
        return validationResult.response
      }

      const { target } = await request.json()
      const targetSet = new Set(target.map((item) => item.conversationId))

      const result = messageList.filter(
        (item) => !targetSet.has(item.conversationId),
      )

      if (result.length === messageList.length) {
        return HttpResponse.json(
          { message: '삭제할 쪽지가 없습니다.' },
          { status: HTTP_STATUS.badRequest },
        )
      }

      messageList = result
      return HttpResponse.json(result, { status: HTTP_STATUS.ok })
    },
  ),

  http.post<never, SearchUserRequest, IMessageTarget[] | ErrorResponse>(
    API_PATH.message.searching,
    async ({ request }) => {
      const validationResult = validateAccessToken(request)
      if (!validationResult.isValid) {
        return validationResult.response
      }

      const { keyword } = await request.json()
      if (!keyword || keyword.trim() === '') {
        return HttpResponse.json(
          { message: '키워드를 입력해주세요' },
          { status: HTTP_STATUS.badRequest },
        )
      }

      // 검색 결과에 해당하는 사용자가 없는 경우
      if (!MOCK_TARGET.userNickname.includes(keyword)) {
        return HttpResponse.json([], {
          status: HTTP_STATUS.ok,
        })
      }

      // 기존 메시지가 없는 경우에만 검색 결과 반환 (1명의 사용자만 존재)
      if (messageList.length === 0) {
        return HttpResponse.json(
          [
            {
              targetId: MOCK_TARGET.userId,
              targetEmail: MOCK_TARGET.userEmail,
              targetNickname: MOCK_TARGET.userNickname,
              targetProfile: MOCK_TARGET.userProfile,
            },
          ],
          {
            status: HTTP_STATUS.ok,
          },
        )
      }

      return HttpResponse.json([], {
        status: HTTP_STATUS.ok,
      })
    },
  ),

  http.post<never, ConversationListRequest, IConversationList | ErrorResponse>(
    API_PATH.message.conversationList,
    async ({ request }) => {
      const validationResult = validateAccessToken(request)
      if (!validationResult.isValid) {
        return validationResult.response
      }

      const { targetId, conversationId } = await request.json()
      if (
        !(
          targetId === MOCK_TARGET.userId &&
          conversationId === MOCK_CONVERSATION_ID
        )
      ) {
        return HttpResponse.json(
          { message: '대화 상대 정보가 유효하지 않습니다.' },
          { status: HTTP_STATUS.badRequest },
        )
      }

      const conversationList: IConversationList = {
        msgOwner: {
          userId: 1,
          userNickname: '길동홍',
          userProfile: '',
        },
        msgTarget: {
          userId: MOCK_TARGET.userId,
          userNickname: MOCK_TARGET.userNickname,
          userProfile: MOCK_TARGET.userProfile,
          deleted: MOCK_TARGET.deleted,
        },
        msgList: [
          {
            userId: 2,
            msgId: 1,
            content: '안녕하세요',
            date: '2025-05-10',
            isEnd: true,
          },
        ],
      }
      return HttpResponse.json(conversationList, {
        status: HTTP_STATUS.ok,
      })
    },
  ),
  http.post<never, NewMessageRequest, IMessageListData[] | ErrorResponse>(
    API_PATH.message.newMessage,
    async ({ request }) => {
      const validationResult = validateAccessToken(request)
      if (!validationResult.isValid) {
        return validationResult.response
      }
      const { targetId, content } = await request.json()
      if (!targetId || !content) {
        return HttpResponse.json(
          { message: '대상 사용자와 내용을 입력해주세요.' },
          { status: HTTP_STATUS.badRequest },
        )
      }
      const newMessage: IMessageListData = {
        targetId: targetId,
        conversationId: MOCK_CONVERSATION_ID,
        targetNickname: MOCK_TARGET.userNickname,
        targetProfile: MOCK_TARGET.userProfile,
        unreadMsgNumber: 1,
        latestContent: content,
        latestDate: new Date().toISOString(),
        latestMsgId: messageList.length + 1, // 새로운 메시지 ID
      }
      messageList.push(newMessage)
      return HttpResponse.json(messageList, {
        status: HTTP_STATUS.created,
      })
    },
  ),
]
