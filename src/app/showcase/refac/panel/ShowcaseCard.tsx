'use client'

import CuButton from '@/components/CuButton'
import PostCard from '@/components/PostCard'
import { CardContent, SxProps, Typography } from '@mui/material'
import { Box, Card, CardHeader, Chip, Stack } from '@mui/material'
import React, { useState } from 'react'
import { ICardData } from '../../panel/types'
import useMedia from '@/hook/useMedia'

const ShowcaseCardBack = ({ postId, sx }: { postId: number; sx?: SxProps }) => {
  const { isPc } = useMedia()
  const cardStyle = {
    backgroundColor: 'background.primary',
    width: isPc ? '20.5rem' : '90vw',
    height: '27rem',
    maxWidth: '20.5rem',
    borderRadius: '0.75rem',
    borderWidth: '2px',
    borderColor: 'line.base',
    borderStyle: 'solid',
    position: 'absolute',
    top: 0,
    left: 0,
  }

  console.log(`ShowcaseCard Back API! ${postId}`)
  return (
    <Card
      sx={{
        ...sx,
        backgroundColor: 'text.normal',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        transform: 'rotateY(180deg)',
        // backfaceVisibility: 'hidden',
      }}
    >
      <CardHeader>
        <Stack direction="row" justifyContent={'space-between'}>
          <Chip label="팀명" />
          <Box sx={{ backgroundColor: 'background.secondary' }}>menu</Box>
        </Stack>
      </CardHeader>
      <CardContent>
        <Typography variant="Body1" color="text.normal">
          title
        </Typography>
      </CardContent>
      <CardContent>
        <Typography variant="Caption" color={'text.alternative'}>
          모집글 요약
        </Typography>
      </CardContent>
      <CardContent>
        <Box sx={{ backgroundColor: 'background.secondary' }}>Avatars</Box>
      </CardContent>
      <CardContent>
        <CuButton message="전체 보기" />
      </CardContent>
    </Card>
  )
}

const ShowcaseCard = ({
  id,
  imageid,
  nameid,
  descriptionid,
  skillid,
  likeid,
  likedid,
  favoriteid,
  teamLogoid,
  startid,
  endid,
}: ICardData) => {
  const [isFlipped, setFlipped] = useState(false)

  return (
    <div
      style={{
        transform: `rotateY(${isFlipped ? '180deg' : '0deg'})`,
        width: '100%',
        height: '100%',
        transition: 'transform 0.5s ease',
      }}
      onClick={() => setFlipped(!isFlipped)}
    >
      <PostCard
        postId={postId}
        authorImage={authorImage}
        teamName={teamName}
        title={title}
        tagList={tagList}
        image={image}
        sx={{
          ...cardStyle,
          backfaceVisibility: 'hidden',
          opacity: isFlipped ? 0 : 1,
          transition: 'opacity 0.5s ease',
        }}
      />
      <ShowcaseCardBack
        postId={postId}
        sx={{
          ...cardStyle,
          opacity: isFlipped ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      />
    </div>
  )
}

export default ShowcaseCard
