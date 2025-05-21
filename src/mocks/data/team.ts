import { ITeamInfo as ITeamListInfo } from '@/app/team-list/page'
import { ITeamMemberInfo } from '@/app/teams/[id]/panel/TeamInfoContainer'
import {
  TeamOperationForm,
  TeamStatus,
  TeamType,
} from '@/app/teams/types/types'
import { ITeamInfo } from '@/types/ITeamInfo'

export const mockTeamList: ITeamListInfo[] = [
  {
    id: '1',
    name: '프론트엔드 개발자 모임',
    dueTo: '2025-10-10',
    status: 'ONGOING' as TeamStatus,
    type: 'STUDY' as TeamType,
    role: ['Member'],
    region: '부산',
    operationFormat: 'MIX' as TeamOperationForm,
    isApproved: true,
  },
]

export const mockTeamInfo: ITeamInfo = {
  id: 1,
  name: '프론트엔드 개발자 모임',
  teamPicturePath: null,
  status: 'ONGOING' as TeamStatus,
  memberCount: 2,
  leaderName: '김개발',
  createdAt: '2025.05.20',
}

export const mockTeamMember: Array<ITeamMemberInfo> = [
  { id: 1, name: '김개발', role: 'LEADER' },
  { id: 2, name: '길동홍', role: 'MEMBER' },
]
