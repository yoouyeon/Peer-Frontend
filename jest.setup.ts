import React from 'react'
import '@testing-library/jest-dom'
import { randomUUID } from 'crypto'
import { server } from '@/mocks/server'

global.React = React

// crypto.randomUUID polyfill
if (!global.crypto) {
  global.crypto = {} as Crypto
}
if (!global.crypto.randomUUID) {
  global.crypto.randomUUID = () => randomUUID()
}
// next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  useParams: jest.fn(),
}))

beforeAll(() => {
  // 테스트 시작 전 MSW 서버 시작
  server.listen()
})

afterEach(() => {
  server.restoreHandlers()
})

afterAll(() => {
  // 모든 테스트 완료 후 서버 종료
  server.close()
})
