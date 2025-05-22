async function initMswServer() {
  if (
    process.env.NEXT_RUNTIME === 'nodejs' &&
    process.env.NODE_ENV === 'development'
  ) {
    if (typeof window === 'undefined') {
      const { server } = await import('./server')
      await server.listen({ onUnhandledRequest: 'bypass' })
    }
  }
}

export default initMswServer
