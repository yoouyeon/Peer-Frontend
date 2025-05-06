'use client'

import { Suspense, use } from 'react'

const initMswWorker =
  typeof window !== 'undefined'
    ? import('./browser').then(async ({ worker }) => {
        await worker.start({ onUnhandledRequest: 'bypass' })
      })
    : Promise.resolve()

function InnerMswProvider({ children }: { children: React.ReactNode }) {
  use(initMswWorker)
  return children
}

export function MswProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <InnerMswProvider>{children}</InnerMswProvider>
    </Suspense>
  )
}
