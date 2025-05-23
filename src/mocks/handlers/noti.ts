import { http, HttpResponse } from 'msw'
import API_PATH from '@/constant/apiPath'
import HTTP_STATUS from '@/constant/httpStatus'

type NotiSummaryResponse = {
  newAlarm: number
}

export const handlers = [
  http.get<never, never, NotiSummaryResponse>(API_PATH.noti.summary, () => {
    return HttpResponse.json({ newAlarm: 0 }, { status: HTTP_STATUS.ok })
  }),
]
