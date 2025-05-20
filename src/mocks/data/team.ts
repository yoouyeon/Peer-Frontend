import { ITeamInfo } from '@/app/team-list/page'
import {
  TeamOperationForm,
  TeamStatus,
  TeamType,
} from '@/app/teams/types/types'

export const mockTeamList: ITeamInfo[] = [
  {
    id: '1',
    name: '프론트엔드 개발자 모임',
    dueTo: '2025-10-10',
    status: 'ONGOING' as TeamStatus,
    type: 'STUDY' as TeamType,
    role: ['M'],
    region: '부산',
    operationFormat: 'MIX' as TeamOperationForm,
    isApproved: true,
  },
]
