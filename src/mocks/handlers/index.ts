import { handlers as logoutHanders } from './logout'
import { handlers as messageHandlers } from './message'
import { handlers as myPortfolioHandlers } from './myPortfolio'
import { handlers as notiHandlers } from './noti'
import { handlers as profileHandlers } from './profile'
import { handlers as recruitHandlers } from './recruit'
import { handlers as mainHandlers } from './main'
import { handlers as showcaseHandlers } from './showcase'
import { handlers as signupHandlers } from './signup'
import { handlers as signinHandlers } from './signin'
import { handlers as teamHandlers } from './team'
import { handlers as teamPageHandlers } from './teamPage'

export const handlers = [
  ...logoutHanders,
  ...messageHandlers,
  ...myPortfolioHandlers,
  ...notiHandlers,
  ...profileHandlers,
  ...recruitHandlers,
  ...mainHandlers,
  ...showcaseHandlers,
  ...signupHandlers,
  ...signinHandlers,
  ...teamHandlers,
  ...teamPageHandlers,
]
