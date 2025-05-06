export async function register() {
  if (process.env.NODE_ENV === 'development') {
    const initMswServer = await import('./mocks/initMswServer')
    initMswServer.default()
  }
}
