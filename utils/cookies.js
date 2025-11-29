// Cookie Utilities untuk Session Management
import cookie from 'cookie';

export function setAuthCookie(res, token) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/'
  };

  res.setHeader(
    'Set-Cookie',
    cookie.serialize('auth_token', token, cookieOptions)
  );
}

export function clearAuthCookie(res) {
  res.setHeader(
    'Set-Cookie',
    cookie.serialize('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })
  );
}

export function getAuthToken(req) {
  if (!req.headers.cookie) return null;
  
  const cookies = cookie.parse(req.headers.cookie);
  return cookies.auth_token || null;
}
