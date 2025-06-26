import { IUserProfile } from '@/types/IUserProfile'

export const EXISTING_EMAIL = 'existing@example.com'
export const FAIL_EMAIL = 'fail@example.com'
export const MOCK_CODE = '123456'
export const EXISTING_NICKNAME = '존재하는닉네임'

export const MOCK_INIT_CODE = 'mock_init_code'
export const MOCK_INIT_SECRET = 'mock_init_secret'
export const MOCK_VERIFY_CODE = 'mock_verify_code'
export const MOCK_VERIFY_SEED = 'mock_verify_seed'

export const MOCK_SIGN_UP_PASSWORD = 'Password123!'
export const MOCK_ACCESS_TOKEN = 'mock_access_token'
export const MOCK_REFRESH_TOKEN = 'mock_refresh_token'
export const REFRESH_TOKEN_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 7 // 7일

export const MOCK_USER_PROFILE: IUserProfile = {
  id: 1,
  nickname: '고양이',
  profileImageUrl: '',
  introduction: '고양이와 함께 개발을',
  linkList: [],
  representAchievement: '',
  achievements: [],
  association: null,
  email: 'test@example.com',
  skillList: [],
  portfolioVisibility: true,
}
