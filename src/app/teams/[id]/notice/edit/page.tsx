'use client'

import { EditPage, EditBox } from '@/components/board/EditPanel'
import NoticeEditForm from '../panel/NoticeEditForm'

const NoticeEdit = ({ params }: { params: { id: string } }) => {
  const { id } = params

  return (
    <EditPage title={'공지사항 작성'}>
      <EditBox>
        <NoticeEditForm teamId={id} type={'new'} />
      </EditBox>
    </EditPage>
  )
}

export default NoticeEdit
