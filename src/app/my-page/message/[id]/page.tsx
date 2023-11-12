'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import useSWRMutation from 'swr/mutation'
import { Box, CircularProgress, Typography } from '@mui/material'
import useAxiosWithAuth from '@/api/config'
import CuButton from '@/components/CuButton'
import useMedia from '@/hook/useMedia'
import useModal from '@/hook/useModal'
import { useMessageInfiniteScroll } from '@/hook/useInfiniteScroll'
import { IMessage, IMessageUser } from '@/types/IMessage'
import MessageItem from './panel/MessageItem'
import MessageForm from './panel/MessageForm'
import MessageFormModal from './panel/MessageFormModal'

const MessageChatPage = ({ params }: { params: { id: string } }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const searchParams = useSearchParams()
  const [updatedData, setUpdatedData] = useState<IMessage[] | undefined>()
  const [owner, setOwner] = useState<IMessageUser>()
  const [target, setTarget] = useState<IMessageUser>()
  const [isEnd, setIsEnd] = useState<boolean>(false)
  const [prevScrollHeight, setPrevScrollHeight] = useState<number | undefined>(
    undefined,
  )
  const axiosWithAuth = useAxiosWithAuth()
  const { isOpen, openModal, closeModal } = useModal()
  const { isPc } = useMedia()

  // NOTE : 무한 스크롤에 오류 발생하여 모두 주석처리함
  // const fetchMoreData = useCallback(
  //   async (url: string) => {
  //     try {
  //       const response = await axiosWithAuth.post(url, {
  //         targetId: Number(searchParams.get('target')),
  //         conversationalId: Number(params.id),
  //         earlyMsgId: updatedData?.[0]?.msgId, // FIXME : earlyMsgId 의미 확인 필요함.
  //       })
  //       return response.data.msgList
  //     } catch {
  //       // TODO : 에러 구체화
  //       alert('쪽지를 불러오는데 실패하였습니다.')
  //     }
  //   },
  //   [searchParams, params, updatedData],
  // )

  // const { trigger, data } = useSWRMutation(
  //   '/api/v1/message/conversation-list/more',
  //   fetchMoreData,
  // )

  // const { targetRef, scrollRef, spinner } = useMessageInfiniteScroll({
  //   trigger, // == mutate
  //   isEnd,
  // })

  // const scrollTo = useCallback(
  //   (height: number) => {
  //     if (!scrollRef.current) return
  //     scrollRef.current.scrollTo({ top: height })
  //   },
  //   [scrollRef],
  // )

  useEffect(() => {
    setIsLoading(true)
    const targetId = Number(searchParams.get('target'))
    const conversationalId = Number(params.id)
    axiosWithAuth
      .post('/api/v1/message/conversation-list', {
        targetId,
        conversationalId,
      })
      .then((response) => {
        // TODO : 데이터 순서 논의해보기
        setUpdatedData(response.data.msgList.reverse())
        setOwner(response.data.msgOwner)
        setTarget(response.data.msgTarget)
        setIsEnd(response.data.msgList[0].isEnd)
      })
      .catch(() => {
        // TODO : 에러 구체화
        alert('쪽지를 불러오는데 실패하였습니다.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [searchParams, params])

  // useEffect(() => {
  //   if (!data) return
  //   // data : 새로 불러온 데이터 (예전 메시지)
  //   // currentData : 현재 데이터 (최근 메시지)
  //   setUpdatedData((currentData: IMessage[] | undefined) => {
  //     if (!currentData) return data
  //     return [...data.reverse(), ...currentData]
  //   })
  //   setIsEnd(data[0].isEnd)
  //   setPrevScrollHeight(scrollRef.current?.scrollHeight)
  // }, [data])

  // useEffect(() => {
  //   // FIXME : 깜빡임 현상 해결 필요할듯...
  //   if (!scrollRef.current) return
  //   if (prevScrollHeight) {
  //     scrollTo(scrollRef.current.scrollHeight - prevScrollHeight)
  //     setPrevScrollHeight(undefined)
  //     return
  //   }
  //   scrollTo(scrollRef.current.scrollHeight - scrollRef.current.clientHeight)
  // }, [updatedData])

  const addNewMessage = (newMessage: IMessage) => {
    if (!updatedData) return
    setUpdatedData((currentData: IMessage[] | undefined) => {
      if (!currentData) return [newMessage]
      return [...currentData, newMessage]
    })
  }

  if (isLoading) return <Typography>로딩중... @_@</Typography>
  if (!updatedData || !owner || !target)
    return <Typography>빈 쪽지함 입니다!</Typography>

  return (
    <Box sx={{ width: '100%', height: '50vh' }}>
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          height: '10%',
          padding: '2rem',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '0.5rem',
          backgroundColor: '#D8D8D8',
        }}
      >
        <Typography>{target.userNickname}</Typography>
      </Box>
      <Box
        // ref={scrollRef}
        sx={{ width: '100%', height: '90%', overflowY: 'auto' }}
      >
        {/* <Box ref={targetRef}></Box>
        {spinner && <CircularProgress />} */}
        {updatedData.map((msgObj: IMessage) => (
          <MessageItem
            key={msgObj.msgId}
            msg={msgObj}
            owner={owner}
            target={target}
          />
        ))}
      </Box>
      {isPc ? (
        <MessageForm
          view={'PC_VIEW'}
          targetId={target.userId}
          addNewMessage={addNewMessage}
        />
      ) : (
        <>
          <CuButton
            variant="contained"
            action={() => openModal()}
            message="답하기"
            fullWidth
          />
          <MessageFormModal
            isOpen={isOpen}
            targetId={target.userId}
            addNewMessage={addNewMessage}
            handleClose={closeModal}
          />
        </>
      )}
    </Box>
  )
}

export default MessageChatPage
