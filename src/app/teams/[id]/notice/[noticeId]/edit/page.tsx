'use client'

import { EditPage, EditBox } from '@/components/board/EditPanel'
import NoticeEditForm from '../../panel/NoticeEditForm'

interface INoticeEditParams {
  id: string
  noticeId: string
}

const NoticeEdit = ({ params }: { params: INoticeEditParams }) => {
  const { id: teamId, noticeId } = params

  return (
    <EditPage title={'공지사항 수정'}>
      <EditBox>
        <NoticeEditForm
          teamId={teamId}
          postId={parseInt(noticeId)}
          type={'edit'}
        />
      </EditBox>
    </EditPage>
  )
}

export default NoticeEdit
