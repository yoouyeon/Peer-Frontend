import React from 'react'
import '@testing-library/jest-dom'
import { server } from '@/mocks/server'

global.React = React

beforeAll(() => {
  // 테스트 시작 전 MSW 서버 시작
  server.listen()
})

afterEach(() => {
  // 각 테스트 후 핸들러 초기화
  server.resetHandlers()
})

afterAll(() => {
  // 모든 테스트 완료 후 서버 종료
  server.close()
})
