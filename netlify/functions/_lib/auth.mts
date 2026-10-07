import { createHmac, timingSafeEqual } from 'node:crypto'

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 14

function secret(): string {
  const s = process.env.STUDIO_SECRET
  if (!s) throw new Error('STUDIO_SECRET is not configured')
  return s
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url')
}

export function issueToken(user: string): string {
  const payload = Buffer.from(JSON.stringify({ u: user, exp: Date.now() + TOKEN_TTL_MS })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

export function verifyToken(token: string | null | undefined): string | null {
  if (!token) return null
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return null
  const expected = Buffer.from(sign(payload))
  const given = Buffer.from(sig)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { u: string; exp: number }
    return data.exp > Date.now() ? data.u : null
  } catch {
    return null
  }
}

export function requireUser(req: Request): string | Response {
  const header = req.headers.get('authorization') ?? ''
  const user = verifyToken(header.replace(/^Bearer\s+/i, ''))
  return user ?? json({ error: 'unauthorized' }, 401)
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}
