'use client'

import { useRouter } from 'next/navigation'

const useNoticeRouter = () => {
  const router = useRouter()

  const goBack = () => {
    router.back()
  }

  const goToNoticeList = (teamId: string) => {
    router.push(`/teams/${teamId}/notice`)
  }

  const replaceToNoticeList = (teamId: string) => {
    router.replace(`/teams/${teamId}/notice`)
  }

  const goToNoticeEdit = (teamId: string, noticeId: string) => {
    router.push(`/teams/${teamId}/notice/${noticeId}/edit`)
  }

  const goToNoticeDetail = (teamId: string, noticeId: string) => {
    router.push(`/teams/${teamId}/notice/${noticeId}`)
  }

  return {
    goBack,
    goToNoticeList,
    replaceToNoticeList,
    goToNoticeEdit,
    goToNoticeDetail,
  }
}

export default useNoticeRouter
