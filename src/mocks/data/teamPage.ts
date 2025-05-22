import {
  ITeamComment,
  ITeamNoticeDetail,
  ITeamPostDetail,
} from '@/types/TeamBoardTypes'

export const MOCK_TEAM_ID = 1
export const MOCK_NOTICE_ID = 1
export const MOCK_POST_ID = 2
export const MOCK_BOARD_ID = 1

let globalPostId = 3
export const getNextPostId = () => {
  return globalPostId++
}

let globalCommentId = 3
export const getNextCommentId = () => {
  return globalCommentId++
}

export const mockPostMap: Map<
  number,
  (ITeamPostDetail | ITeamNoticeDetail) & {
    postId: number
    type: 'post' | 'notice'
  }
> = new Map([
  [
    MOCK_NOTICE_ID,
    {
      type: 'notice',
      postId: MOCK_NOTICE_ID,
      title: '스터디 안내',
      nickname: '김개발',
      hit: 100,
      date: new Date('2025-05-20'),
      content: '다들 안녕하세요! 스터디 안내입니다.',
      isAuthor: false,
    },
  ],
  [
    MOCK_POST_ID,
    {
      type: 'post',
      postId: MOCK_POST_ID,
      title: '스터디 일정',
      nickname: '김개발',
      hit: 100,
      date: new Date('2025-05-20'),
      content: '스터디 일정은 매주 월요일입니다.',
      isAuthor: false,
    },
  ],
])

export const mockCommentMap: Map<number, Map<number, ITeamComment>> = new Map([
  [
    MOCK_NOTICE_ID,
    new Map([
      [
        1,
        {
          commentId: 1,
          authorImage: '',
          authorNickname: '김개발',
          content: '모두들 화이팅!',
          createAt: new Date('2025-05-21T14:04:04.221961'),
          authorId: 1,
          isAuthor: false,
        },
      ],
    ]),
  ],
  [
    MOCK_POST_ID,
    new Map([
      [
        2,
        {
          commentId: 2,
          authorImage: '',
          authorNickname: '김개발',
          content: '매주 월요일에 봐요!',
          createAt: new Date('2025-05-21T14:04:04.221961'),
          authorId: 1,
          isAuthor: false,
        },
      ],
    ]),
  ],
])

export const mockBoardList = [
  {
    boardId: MOCK_BOARD_ID,
    boardName: '기본 게시판',
  },
]
