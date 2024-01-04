import MuiAlert, { AlertColor, AlertProps } from '@mui/material/Alert'
import {
  SlideProps,
  Snackbar,
  Stack,
  SxProps,
  Typography,
  IconButton,
  Slide,
  useTheme,
} from '@mui/material'
import CircleIcon from '@mui/icons-material/Circle'
import React from 'react'
import { CloseIcon } from '@/icons'
import useMedia from '@/hook/useMedia'
import * as style from './CuToast.style'

const hexToDecimalArray = (hex: string | undefined) => {
  if (!hex) {
    return [0, 0, 0]
  }
  hex = hex.replace(/^#/, '')

  const red = parseInt(hex.substring(0, 2), 16)
  const green = parseInt(hex.substring(2, 4), 16)
  const blue = parseInt(hex.substring(4, 6), 16)

  return [red, green, blue]
}

const calculateBlendedColor = (
  topColor: Array<number>,
  topAlpha: number,
  bottomColor: Array<number>,
) => {
  const resultColor = [
    Math.round(topColor[0] * topAlpha + bottomColor[0] * (1 - topAlpha)),
    Math.round(topColor[1] * topAlpha + bottomColor[1] * (1 - topAlpha)),
    Math.round(topColor[2] * topAlpha + bottomColor[2] * (1 - topAlpha)),
  ]

  return `rgb(${resultColor.join(', ')})`
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  function Alert(props, ref) {
    const { severity } = props
    let backgroundColor
    const theme = useTheme()

    if (severity === 'error') {
      backgroundColor = calculateBlendedColor(
        hexToDecimalArray(theme.palette.red.normal),
        0.2,
        hexToDecimalArray(theme.palette.background.primary),
      )
    } else if (severity === 'warning') {
      backgroundColor = calculateBlendedColor(
        hexToDecimalArray(theme.palette.yellow.normal),
        0.2,
        hexToDecimalArray(theme.palette.background.primary),
      )
    } else {
      backgroundColor = calculateBlendedColor(
        hexToDecimalArray(theme.palette.purple.normal),
        0.2,
        hexToDecimalArray(theme.palette.background.primary),
      )
    }
    const { isPc } = useMedia()
    const toastStyle: SxProps = isPc
      ? style.toastPcStyle
      : style.toastMobileStyle

    const customToastStyle: SxProps = {
      ...toastStyle,
      backgroundColor: backgroundColor,
    }

    return (
      <MuiAlert
        elevation={6}
        ref={ref}
        variant="filled"
        iconMapping={{
          error: (
            <CircleIcon sx={{ ...style.iconStyle, color: 'red.strong' }} />
          ),
          warning: (
            <CircleIcon sx={{ ...style.iconStyle, color: 'yellow.strong' }} />
          ),
          info: (
            <CircleIcon sx={{ ...style.iconStyle, color: 'purple.strong' }} />
          ),
        }}
        {...props}
        sx={customToastStyle}
      />
    )
  },
)

function TransitionLeft(props: SlideProps) {
  // 공식 문서 보면 left라고 적혀있는데, 그렇게 적용하면 오른쪽에서 나오길래 반대로 했습니다.
  return <Slide {...props} direction="right" />
}

const CuToast = ({
  open,
  autoHideDuration = 60000,
  onClose,
  severity,
  message,
  subButton,
}: {
  open: boolean
  autoHideDuration?: number
  onClose: (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => void | undefined
  severity?: AlertColor | undefined
  sx?: SxProps
  children?: React.ReactNode
  message?: string
  subButton?: React.ReactNode
}) => {
  const { isPc } = useMedia()
  return (
    <Snackbar
      open={open}
      anchorOrigin={
        isPc
          ? { vertical: 'top', horizontal: 'center' }
          : { vertical: 'bottom', horizontal: 'left' }
      }
      autoHideDuration={autoHideDuration}
      sx={isPc ? style.snackbarPcStyle : style.snackbarMobileStyle}
      TransitionComponent={TransitionLeft}
    >
      <Alert
        onClose={onClose}
        severity={severity === 'success' ? 'info' : severity}
        action={
          <Stack
            flexDirection={'row'}
            spacing={'0.5rem'}
            sx={{ padding: '0 ! important' }}
          >
            {subButton}
            <IconButton
              size="small"
              aria-label="close"
              onClick={onClose}
              sx={style.actionButtonStyle}
            >
              <CloseIcon
                sx={{
                  ...style.closeIconStyle,
                  color: 'text.assistive',
                }}
              />
            </IconButton>
          </Stack>
        }
      >
        {/* 기존에는 타이포그래피를 넣게 하였으나 앞으로는 message prop에 넣는 것으로 처리해야 합니다.*/}
        <Typography variant="Body2">{message}</Typography>
      </Alert>
    </Snackbar>
  )
}

export default CuToast
