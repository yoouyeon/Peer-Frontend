'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Stack, Container, Box, useMediaQuery } from '@mui/material'
import useMedia from '@/hook/useMedia'
import TeamSidebar from './panel/NavBar'
import * as style from '@/components/NavBarLayout.style'

const TeamLayout = ({
  params,
  children,
}: {
  params: { id: string }
  children: ReactNode
}) => {
  const id = params.id
  const isFourRow = useMediaQuery('(min-width:997px)')
  const { isPc } = useMedia()
  const pathname = usePathname()

  const isFullPage = pathname.includes('/edit')

  if (isFullPage) {
    return (
      <Container sx={style.container}>
        <Box sx={style.fullPageContentBox}>{children}</Box>
      </Container>
    )
  }

  return (
    <Container sx={style.container}>
      <Stack
        justifyContent={'space-between'}
        direction={isFourRow ? 'row' : 'column'}
        alignItems={isFourRow ? 'flex-start' : 'center'}
        sx={style.stack}
      >
        <TeamSidebar id={id} />
        <Box
          sx={{
            ...style.contentBox,
            width: isFourRow ? undefined : isPc ? '70%' : '100%',
          }}
        >
          {children}
        </Box>
      </Stack>
    </Container>
  )
}

export default TeamLayout
