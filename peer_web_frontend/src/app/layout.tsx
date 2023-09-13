import type { Metadata } from 'next'
import "../../styles/global.css"
import "../../styles/reset.css"
import NavBar from './panel/NavBar'
import Header from './panel/Header'
import { Box, Stack } from '@mui/material'

export const metadata: Metadata = {
  title: 'peer',
  description: 'This is a website of the peer, by the peer, for the peer.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head />
      <body>
        <div className="layout">
          <NavBar />
          <Stack flex={1} >
            <Box>
              <Header />
            </Box>
            {children}
          </Stack>
        </div>
      </body>
    </html>
  )
}
