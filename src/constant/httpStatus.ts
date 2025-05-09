const HTTP_STATUS = {
  ok: 200,
  badRequest: 400,
  unauthorized: 401,
  conflict: 409,
  internalServerError: 500,
} as const

export default HTTP_STATUS
