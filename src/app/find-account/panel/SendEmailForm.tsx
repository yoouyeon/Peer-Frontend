'use client'
import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import axios from 'axios'
import { Box, Typography, Button, Container } from '@mui/material'
import CuTextFieldLabel from '@/components/CuTextFieldLabel'
import CuTextField from '@/components/CuTextField'
import SendCodeForm from './SendCodeForm'
import useToast from '@/hook/useToast'

const Form = {
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
}

const LabelBox = {
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '8px',
  fontSize: '14px',
}

const SendEmailForm = ({
  setIsCodeSuccessful,
}: {
  setIsCodeSuccessful: (isCodeSuccessful: boolean) => void
}) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const [isEmailSuccessful, setIsEmailSuccessful] = useState(false)

  const { CuToast, isOpen, openToast, closeToast } = useToast()
  const [errorMessage, setErrorMessage] = useState('')

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string }>()

  const onSubmit = async (data: { email: string }) => {
    try {
      const res = await axios.post(`${API_URL}/api/v1/signin/find`, data)
      if (res.status == 200) setIsEmailSuccessful(true)
    } catch (error: any) {
      if (error.response?.status == 404)
        setErrorMessage('존재하지 않는 회원입니다.')
      else if (error.response?.status == 401)
        setErrorMessage('이메일 전송에 실패했습니다. 다시 시도해주세요.')
      else setErrorMessage('알 수 없는 오류가 발생했습니다.')
      openToast()
    }
  }

  return (
    <>
      <Container disableGutters={true}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={Form}>
          <Controller
            name="email"
            control={control}
            defaultValue=""
            rules={{
              required: '이메일을 입력하세요',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                message: '올바른 이메일 형식이 아닙니다',
              },
            }}
            render={({ field }) => (
              <Container sx={LabelBox} disableGutters={true}>
                <CuTextFieldLabel htmlFor="email">이메일</CuTextFieldLabel>
                <CuTextField
                  {...field}
                  id="email"
                  placeholder="이메일을 입력하세요"
                  style={{ width: '100%' }}
                  disabled={isEmailSuccessful}
                />
                {errors.email ? (
                  <Typography color="error">{errors.email?.message}</Typography>
                ) : (
                  <Typography>&nbsp;</Typography>
                )}
              </Container>
            )}
          />
          {!isEmailSuccessful && (
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={isSubmitting}
            >
              코드 발송
            </Button>
          )}
        </Box>
        {isEmailSuccessful && (
          <Box sx={{ display: 'flex', width: '100%' }}>
            <SendCodeForm
              email={
                control._fields.email ? control._fields.email._f.value : ''
              }
              setErrorMessage={setErrorMessage}
              openToast={openToast}
              setIsCodeSuccessful={setIsCodeSuccessful}
            />
          </Box>
        )}
      </Container>
      <CuToast open={isOpen} onClose={closeToast} severity="error">
        <Typography>{errorMessage}</Typography>
      </CuToast>
    </>
  )
}

export default SendEmailForm
