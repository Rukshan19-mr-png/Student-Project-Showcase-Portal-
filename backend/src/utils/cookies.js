export const JWT_COOKIE_NAME = 'jwt';
export const JWT_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const getJwtCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: JWT_COOKIE_MAX_AGE_MS,
  path: '/',
});

export const getClearJwtCookieOptions = () => {
  const { maxAge, ...options } = getJwtCookieOptions();
  return options;
};
