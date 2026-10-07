import { issueToken, json, safeEqual } from './_lib/auth.mts'

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)
  const { username, password } = (await req.json().catch(() => ({}))) as { username?: string; password?: string }
  const expectedUser = process.env.STUDIO_USERNAME ?? 'milad'
  const expectedPass = process.env.STUDIO_PASSWORD
  if (!expectedPass) return json({ error: 'STUDIO_PASSWORD is not configured on the server' }, 500)
  if (!username || !password || !safeEqual(username.trim().toLowerCase(), expectedUser.toLowerCase()) || !safeEqual(password, expectedPass)) {
    return json({ error: 'invalid credentials' }, 401)
  }
  return json({ token: issueToken(expectedUser), user: expectedUser })
}

export const config = { path: '/api/login' }
