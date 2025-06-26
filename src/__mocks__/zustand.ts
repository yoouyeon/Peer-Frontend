// https://velog.io/@9rganizedchaos/Context-활용해서-LTR-테스트하기
// https://github.com/pmndrs/zustand/issues/1059

import { act } from '@testing-library/react'
import { create as createType, StateCreator } from 'zustand'

const zustand = jest.requireActual('zustand')
const actualCreate: typeof createType = zustand.create

// 앱에 선언된 모든 스토어의 초기화 함수가 할당된 변수
const storeResetFns = new Set<() => void>()

// 스토어를 생성할 때, initialState를 취해서, 초기화 함수를 생성한 뒤, 이를 위에 선언된 store에 담아줍니다.
const createImpl = <S>(createState: StateCreator<S>) => {
  const store = actualCreate<S>(createState)
  const initialState = store.getState()
  storeResetFns.add(() => store.setState(initialState, true))
  return store
}

// 커링 지원
export function create<S>(f: StateCreator<S>) {
  return f === undefined ? createImpl : createImpl(f)
}

// 테스트 실행 전 모든 스토어 초기화
beforeEach(() => {
  act(() => storeResetFns.forEach((resetFn) => resetFn()))
})
