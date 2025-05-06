import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import useTargetId from '@/states/useTargetId'

const useMessageNavigation = () => {
  const router = useRouter()
  const { resetTargetId, setTargetId } = useTargetId()

  const goToMessageList = useCallback(() => {
    resetTargetId()
    router.push('/my-page/message')
  }, [resetTargetId, router])

  const goToMessageDetail = (conversationId: number, targetId: number) => {
    setTargetId(targetId)
    router.push(`/my-page/message/${conversationId}`)
  }

  return { goToMessageList, goToMessageDetail }
}

export default useMessageNavigation
