'use client'
import useSWR from 'swr'
import { Stack } from '@mui/material'
import useAxiosWithAuth from '@/api/config'
import {
  DetailPage,
  DetailContentCotainer,
  StatusMessage,
  DetailContent,
} from '@/components/board/DetailPanel'
import CuButton from '@/components/CuButton'
import useMedia from '@/hook/useMedia'
import useToast from '@/states/useToast'
import { ITeamNoticeDetail } from '@/types/TeamBoardTypes'
import CommentList from '@/components/board/CommentList'
import { CommentForm } from '@/components/board/CommentForm'
import CuTextModal from '@/components/CuTextModal'
import useModal from '@/hook/useModal'
import useNoticeRouter from '../hook/useNoticeRouter'

interface ITeamNoticeViewParams {
  id: string
  noticeId: string
}

const TeamNoticeView = ({ params }: { params: ITeamNoticeViewParams }) => {
  const { id: teamId, noticeId } = params
  const axiosWithAuth = useAxiosWithAuth()
  const { isOpen, openModal, closeModal } = useModal()
  const { data, error, isLoading } = useSWR<ITeamNoticeDetail>(
    `/api/v1/team-page/post/${noticeId}`,
    (url: string) => axiosWithAuth.get(url).then((res) => res.data),
  )
  const { isPc } = useMedia()
  const { openToast } = useToast()
  const { goBack, replaceToNoticeList, goToNoticeEdit } = useNoticeRouter()

  const handleDelete = () => {
    axiosWithAuth
      .delete(`/api/v1/team/post/${noticeId}`)
      .then(() => {
        alert('공지사항을 삭제했습니다.')
        replaceToNoticeList(teamId)
      })
      .catch(() => {
        openToast({
          severity: 'error',
          message: '공지사항을 삭제하지 못했습니다.',
        })
      })
  }

  if (isLoading)
    return (
      <StatusMessage
        boardType={'NOTICE'}
        message={'공지사항을 불러오는 중입니다...'}
        onClickEditButton={() => goToNoticeEdit(teamId, noticeId)}
        author={!!data?.isAuthor}
      />
    )

  if (!data || error)
    return (
      <StatusMessage
        boardType={'NOTICE'}
        message={'문제가 발생했습니다.'}
        onClickEditButton={() => goToNoticeEdit(teamId, noticeId)}
        author={!!data?.isAuthor}
      />
    )

  return (
    <>
      <DetailPage boardType={'NOTICE'}>
        {isPc && (
          <CuButton
            message={'이전 페이지'}
            action={goBack}
            variant={'text'}
            TypographyProps={{
              color: 'text.strong',
              variant: 'Body2Emphasis',
            }}
            style={{ width: 'fit-content' }}
          />
        )}
        <DetailContentCotainer
          containerTitle={'공지사항'}
          onClickEditButton={() => goToNoticeEdit(teamId, noticeId)}
          author={data.isAuthor}
        >
          <DetailContent
            title={data.title}
            createdAt={data.createdAt}
            authorNickname={data.nickname}
            content={data.content}
          />
          {data.isAuthor && (
            <Stack alignItems={'flex-end'}>
              <CuButton
                message={'삭제'}
                action={openModal}
                variant={'text'}
                TypographyProps={{
                  color: 'red.normal',
                  variant: 'Caption',
                }}
                style={{ width: 'fit-content' }}
              />
            </Stack>
          )}
        </DetailContentCotainer>
        <Stack>
          <CommentList postId={parseInt(noticeId)} />
          <CommentForm postId={parseInt(noticeId)} teamId={parseInt(teamId)} />
        </Stack>
      </DetailPage>
      <CuTextModal
        open={isOpen}
        title={'공지사항을 삭제할까요?'}
        onClose={closeModal}
        content={'공지사항을 삭제하면 복구할 수 없어요.'}
        containedButton={{
          text: '삭제',
          onClick: handleDelete,
        }}
        textButton={{
          text: '취소',
          onClick: closeModal,
        }}
      />
    </>
  )
}

export default TeamNoticeView
