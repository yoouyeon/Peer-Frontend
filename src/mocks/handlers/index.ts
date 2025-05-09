import { handlers as recruitHandlers } from './recruit'
import { handlers as mainHandlers } from './main'
import { handlers as showcaseHandlers } from './showcase'
import { handlers as signupHandlers } from './signup'

export const handlers = [
  ...recruitHandlers,
  ...mainHandlers,
  ...showcaseHandlers,
  ...signupHandlers,
]
