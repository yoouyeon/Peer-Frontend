import { IPagination } from '@/types/IPagination'
import { IPost } from '@/types/IPostDetail'
import useSWR from 'swr'
import { defaultGetFetcher } from '@/api/fetchers'
import useMainOptions from '@/hook/main-page/useMainOptions'
import useAuthStore from '@/states/useAuthStore'
import useAxiosWithAuth from '@/api/config'
import API_PATH from '@/constant/apiPath'

const useMainCards = (initData: IPagination<IPost[]>) => {
  const { optionsQuery } = useMainOptions()
  const { isLogin } = useAuthStore()
  const axiosInstance = useAxiosWithAuth()

  const { data, isLoading, error } = useSWR<IPagination<IPost[]>>(
    API_PATH.recruit.get + optionsQuery,
    isLogin
      ? (url: string) =>
          axiosInstance.get(url).then((res) => {
            return res.data
          })
      : defaultGetFetcher,
    {
      fallbackData: initData,
      keepPreviousData: true,
    },
  )

  const noContent = !isLoading
    ? error
      ? '에러 발생'
      : data?.content?.length == 0
        ? '데이터가 없습니다'
        : null
    : null

  return { data, isLoading, error, noContent }
}

export default useMainCards
