import {
  ITeamComment,
  ITeamNoticeDetail,
  ITeamPostDetail,
} from '@/types/TeamBoardTypes'

// ANCHOR - 상수 정의
export const POST_TYPE = {
  POST: 'post',
  NOTICE: 'notice',
} as const
export const MOCK_TEAM_ID = 1
export const MOCK_NOTICE_ID = 1
export const MOCK_POST_ID = 2
export const MOCK_BOARD_ID = 1

// ANCHOR - 타입 정의
export type PostType = (typeof POST_TYPE)[keyof typeof POST_TYPE]
export type MockPost = (ITeamPostDetail | ITeamNoticeDetail) & {
  postId: number
  type: PostType
}

// ANCHOR - Mock Post Id 생성기
class MockPostIdGenerator {
  private postId: number = 3
  private commentId: number = 3

  getNextPostId(): number {
    return this.postId++
  }

  getNextCommentId(): number {
    return this.commentId++
  }
}

const mockPostIdGenerator = new MockPostIdGenerator()

// ANCHOR - Mock Post 데이터 클래스

class MockPostDataStore {
  private posts = new Map<number, MockPost>()
  private comments = new Map<number, Map<number, ITeamComment>>()

  constructor() {
    this.initializePosts()
    this.initializeComments()
  }

  private initializePosts() {
    // 공지사항
    this.posts.set(MOCK_NOTICE_ID, {
      type: POST_TYPE.NOTICE,
      postId: MOCK_NOTICE_ID,
      title: '첫번째 공지사항',
      nickname: '김개발',
      hit: 100,
      date: new Date('2025-05-20'),
      content:
        '다들 안녕하세요! 앞으로 이곳에 스터디 공지사항을 올릴 예정입니다.',
      isAuthor: false,
    })

    // 일반 게시글
    this.posts.set(mockPostIdGenerator.getNextPostId(), {
      type: POST_TYPE.POST,
      postId: MOCK_POST_ID,
      title: '첫번째 게시글',
      nickname: '김개발',
      hit: 100,
      date: new Date('2025-05-20'),
      content:
        '안녕하세요! 첫번째 게시글입니다. 스터디 관련 질문이나 의견을 나누는 공간이예요.',
      isAuthor: false,
    })
  }

  private initializeComments() {
    this.comments.set(
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
    )
    this.comments.set(
      MOCK_POST_ID,
      new Map([
        [
          2,
          {
            commentId: 2,
            authorImage: '',
            authorNickname: '김개발',
            content: '자유롭게 의견을 남겨주세요!',
            createAt: new Date('2025-05-21T14:04:04.221961'),
            authorId: 1,
            isAuthor: false,
          },
        ],
      ]),
    )
  }

  // 게시글 관련 메서드
  getPost(postId: number): MockPost | undefined {
    return this.posts.get(postId)
  }

  getAllPosts(): MockPost[] {
    return Array.from(this.posts.values())
  }

  getPostsByType(type: PostType): MockPost[] {
    return Array.from(this.posts.values()).filter((post) => post.type === type)
  }

  createPost(
    postData: Omit<MockPost, 'postId' | 'type'>,
    type: PostType,
  ): number {
    const newPostId = mockPostIdGenerator.getNextPostId()
    const newPost: MockPost = {
      ...postData,
      postId: newPostId,
      createdAt: new Date(),
      type,
    }

    this.posts.set(newPostId, newPost)
    this.comments.set(newPostId, new Map())

    return newPostId
  }

  updatePost(postId: number, updatedData: Partial<MockPost>): boolean {
    const post = this.posts.get(postId)
    if (post) {
      Object.assign(post, updatedData)
      return true
    }
    return false
  }

  deletePost(postId: number): boolean {
    if (this.posts.has(postId)) {
      this.posts.delete(postId)
      this.comments.delete(postId) // 댓글도 함께 삭제
      return true
    }
    return false
  }

  // 댓글 관련 메서드
  getComments(postId: number): ITeamComment[] | undefined {
    const comments = this.comments.get(postId)
    if (comments) {
      return Array.from(comments.values()).sort(
        (a, b) => b.createAt.getTime() - a.createAt.getTime(),
      )
    }
    return undefined
  }

  addComment(
    postId: number,
    commentData: Omit<ITeamComment, 'commentId' | 'createAt' | 'isAuthor'>,
  ): number {
    const comments = this.comments.get(postId) || new Map()
    const newCommentId = mockPostIdGenerator.getNextCommentId()

    const newComment: ITeamComment = {
      ...commentData,
      commentId: newCommentId,
      createAt: new Date(),
      isAuthor: true,
    }

    comments.set(newCommentId, newComment)
    this.comments.set(postId, comments)

    return newCommentId
  }

  updateComment(commentId: number, content: string) {
    for (const comments of this.comments.values()) {
      if (comments.has(commentId)) {
        const comment = comments.get(commentId)
        if (comment) {
          comment.content = content
          return true
        }
      }
    }
    return false
  }

  deleteComment(commentId: number): boolean {
    for (const comments of this.comments.values()) {
      if (comments.has(commentId)) {
        comments.delete(commentId)
        return true
      }
    }
    return false
  }

  // 테스트용 헬퍼 메서드
  addMockPost(count: number, type: PostType) {
    for (let current = 0; current < count; current++) {
      const newPostId = mockPostIdGenerator.getNextPostId()
      this.posts.set(newPostId, {
        type,
        postId: newPostId,
        title: `Mock Post ${newPostId}`,
        nickname: '테스터',
        hit: 0,
        date: new Date(),
        content: `이것은 테스트용 게시글입니다. ID: ${newPostId}`,
        isAuthor: false,
      })
      this.comments.set(newPostId, new Map())
    }
  }
}

export const mockPostDataStore = new MockPostDataStore()
// mockPostDataStore.addMockPost(10, POST_TYPE.NOTICE)
// console.log(
//   mockPostDataStore.getPostsByType(POST_TYPE.NOTICE).length,
//   '공지사항 개수',
// )
export const mockBoardList = [
  {
    boardId: MOCK_BOARD_ID,
    boardName: '기본 게시판',
  },
]
