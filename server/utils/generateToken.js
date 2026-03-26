import jwt from 'jsonwebtoken'

function setAuthCookie(res, userId) {
  const secret = process.env.JWT_SECRET || 'dev-secret-change-me'
  const token = jwt.sign({ userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })

  const isProd = process.env.NODE_ENV === 'production'

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

export { setAuthCookie }
