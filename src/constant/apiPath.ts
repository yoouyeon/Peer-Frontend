const BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : process.env.NEXT_PUBLIC_CSR_API

const API_PATH = {
  recruit: {
    get: `${BASE_URL}/api/v1/recruit`,
  },
  showcase: {
    get: `${BASE_URL}/api/v1/showcase`,
  },
  signup: {
    email: `${BASE_URL}/api/v1/signup/email`,
    code: `${BASE_URL}/api/v1/signup/code`,
    nickname: `${BASE_URL}/api/v1/signup/nickname`,
  },
  signin: {
    reissue: `${BASE_URL}/api/v1/signin/reissue`,
  },
  profile: {
    get: `${BASE_URL}/api/v1/profile`,
  },
  message: {
    list: `${BASE_URL}/api/v1/message/list`,
    deleteMessage: `${BASE_URL}/api/v1/message/delete-message`,
    searching: `${BASE_URL}/api/v1/message/searching`,
    conversationList: `${BASE_URL}/api/v1/message/conversation-list`,
  },
  myPortfolio: {
    list: `${BASE_URL}/api/v1/myPortfolio/list`,
  },
  noti: {
    summary: `${BASE_URL}/api/v1/noti/summary`,
  },
  // 민감 정보 암호화를 위한 API
  main: {
    init: `${BASE_URL}/api/v1/main/init`,
    get: `${BASE_URL}/api/v1/main/get`,
    receive: `${BASE_URL}/api/v1/main/receive`,
  },
} as const

export default API_PATH
