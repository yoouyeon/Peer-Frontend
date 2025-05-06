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
} as const

export default API_PATH
