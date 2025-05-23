import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useTargetId from '@/states/useTargetId'
import { numberRegex } from '@/utils/regex'

const isValidConversationId = (
  id: string | string[] | undefined,
): id is string => {
  // 숫자 타입의 파라미터인지 확인
  return typeof id === 'string' && numberRegex.test(id)
}

const useMessageId = () => {
  const { targetId, resetTargetId } = useTargetId()
  const params = useParams()
  const router = useRouter()

  const conversationId = isValidConversationId(params?.conversationId)
    ? Number(params.conversationId)
    : null

  useEffect(() => {
    if (!(conversationId && targetId)) {
      router.replace('/my-page/message')
    }
  }, [conversationId, router, targetId])

  return {
    conversationId,
    targetId,
    resetTargetId,
  }
}

export default useMessageId
