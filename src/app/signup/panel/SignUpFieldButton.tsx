import Button from '@mui/material/Button'

import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { IconButton } from '@mui/material'

const SignUpFieldButton = ({
  name,
  type,
  onClick,
  buttonText,
  isSubmitting,
}: {
  name: 'email' | 'code' | 'password' | 'nickName' | 'name'
  type: 'text' | 'password'
  onClick?: () => void
  buttonText?: string
  isSubmitting?: boolean
}) => {
  if (name === 'password') {
    return (
      <IconButton
        onClick={onClick}
        aria-label="toggle password visibility"
        edge="end"
      >
        {type === 'password' ? <VisibilityIcon /> : <VisibilityOffIcon />}
      </IconButton>
    )
  }
  return (
    <Button variant="contained" disabled={isSubmitting} onClick={onClick}>
      {buttonText}
    </Button>
  )
}

export default SignUpFieldButton