import {
  ITeamComment,
  ITeamNotice,
  ITeamNoticeDetail,
} from '@/types/TeamBoardTypes'

export const MOCK_TEAM_ID = 1
export const MOCK_NOTICE_ID = 2
export const MOCK_POST_ID = 3

export const mockNoticeList: ITeamNotice[] = [
  {
    postId: MOCK_NOTICE_ID,
    title: '스터디 안내',
    nickname: '김개발',
    createdAt: new Date('2025-05-20'),
  },
]

export const mockNoticeDetail: ITeamNoticeDetail = {
  title: '스터디 안내',
  nickname: '김개발',
  content: '다들 안녕하세요! 스터디 안내입니다.',
  createdAt: new Date('2025-05-21T14:02'),
  isAuthor: false,
}

export const mockNoticeComment: Map<number, ITeamComment> = new Map([
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
])
