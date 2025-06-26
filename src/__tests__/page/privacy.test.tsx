import Privacy from '@/app/privacy/page'
import {
  render,
  waitFor,
  screen,
  act,
  RenderResult,
  fireEvent,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

const CHECKBOX_LABELS = {
  ALL_AGREE: '전체동의',
  USAGE: '[필수] peer 이용 약관',
  PRIVACY: '[필수] 개인정보 수집 및 이용',
} as const

const BUTTON_LABELS = {
  NEXT: '다음',
} as const

describe('약관 동의 페이지', () => {
  const mockPush = jest.fn()
  const mockReplace = jest.fn()
  const mockGet = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: mockGet,
    })
    ;(useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
      push: mockPush,
    })
  })

  const renderPrivacyPage = async (): Promise<RenderResult> => {
    const result = render(
      <Suspense>
        <Privacy />
      </Suspense>,
    )

    await waitFor(() => {
      expect(result.container).toBeInTheDocument()
    })

    return result
  }

  const getCheckboxes = () => ({
    allAgree: screen.getByRole('checkbox', { name: CHECKBOX_LABELS.ALL_AGREE }),
    usage: screen.getByRole('checkbox', { name: CHECKBOX_LABELS.USAGE }),
    privacy: screen.getByRole('checkbox', { name: CHECKBOX_LABELS.PRIVACY }),
  })

  const getNextButton = () =>
    screen.getByRole('button', { name: BUTTON_LABELS.NEXT })

  describe('랜더링', () => {
    test('페이지가 정상적으로 랜더링된다.', async () => {
      await renderPrivacyPage()
    })
  })

  describe('체크박스 인터랙션', () => {
    test('전체 동의 체크박스가 정상적으로 동작한다.', async () => {
      await renderPrivacyPage()

      const { allAgree, usage, privacy } = getCheckboxes()

      // when 1 : 전체 동의 체크박스 체크
      await userEvent.click(allAgree)

      // then 1 : 전체 동의 체크박스가 체크되고, privacy와 usage 체크박스도 체크되어야 한다.
      expect(allAgree).toBeChecked()
      expect(privacy).toBeChecked()
      expect(usage).toBeChecked()

      // when 2 : 전체 동의 체크박스 체크 해제
      await userEvent.click(allAgree)

      // then 2 : 전체 동의 체크박스가 체크 해제되고, privacy와 usage 체크박스도 체크 해제되어야 한다.
      expect(allAgree).not.toBeChecked()
      expect(privacy).not.toBeChecked()
      expect(usage).not.toBeChecked()
    })

    test('이용 약관과 개인정보 수집 체크박스가 정상적으로 동작한다', async () => {
      await renderPrivacyPage()

      const { allAgree, usage, privacy } = getCheckboxes()

      // when 1 : privacy, usage 체크박스만 체크
      await userEvent.click(privacy)
      await userEvent.click(usage)

      // then 1 : 전체 동의 체크박스를 포함해서 모든 체크박스가 체크되어야 한다.
      expect(allAgree).toBeChecked()
      expect(privacy).toBeChecked()
      expect(usage).toBeChecked()

      // when 2 : privacy와 usage 체크박스 체크 해제
      await userEvent.click(privacy)
      await userEvent.click(usage)

      // then 2 : 모든 체크박스가 체크 해제되어야 한다.
      expect(allAgree).not.toBeChecked()
      expect(privacy).not.toBeChecked()
      expect(usage).not.toBeChecked()
    })
  })

  describe('버튼 상태', () => {
    test('모든 필수 약관에 동의해야 다음 버튼이 활성화된다.', async () => {
      await renderPrivacyPage()

      const { usage, privacy } = getCheckboxes()

      // when
      await userEvent.click(usage)
      await userEvent.click(privacy)

      // then
      const nextButton = getNextButton()
      expect(nextButton).toBeEnabled()
    })
  })
})
