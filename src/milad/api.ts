import type { Profile } from './data'

const TOKEN_KEY = 'mm-studio-token'

export function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}
export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch { /* storage unavailable */ }
}

export class AuthError extends Error {}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(path, {
    ...init,
    headers: { 'content-type': 'application/json', authorization: `Bearer ${getToken() ?? ''}`, ...(init.headers ?? {}) },
  })
  if (res.status === 401) {
    setToken(null)
    window.dispatchEvent(new Event('mm-logout'))
    throw new AuthError('نشست شما منقضی شده؛ دوباره وارد شوید.')
  }
  return res
}

export async function login(username: string, password: string): Promise<void> {
  const res = await fetch('/api/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username, password }) })
  const data = (await res.json().catch(() => ({}))) as { token?: string; error?: string }
  if (!res.ok || !data.token) throw new Error(data.error === 'invalid credentials' ? 'نام کاربری یا رمز عبور درست نیست.' : data.error ?? 'ورود ناموفق بود.')
  setToken(data.token)
}

async function readJson<T>(res: Response): Promise<T> {
  try {
    return (await res.json()) as T
  } catch {
    throw new Error(`سرور پاسخ معتبر نداد (${res.status}) — توابع Netlify در دسترس نیستند.`)
  }
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  return readJson<T>(await request(path, { method: 'POST', body: JSON.stringify(body) }))
}

export async function getJson<T>(path: string): Promise<T> {
  return readJson<T>(await request(path))
}

export type AiTask = 'reels' | 'campaign' | 'caption' | 'edit-plan' | 'carousel' | 'optimize' | 'audit' | 'poster-copy'

/** Streams a Claude generation and returns the parsed JSON object. */
export async function generate<T>(task: AiTask, input: unknown, profile: Profile, onProgress?: (chars: number) => void, language?: string): Promise<T> {
  const { photo: _photo, ...profileForAi } = profile
  const res = await request('/api/ai', { method: 'POST', body: JSON.stringify({ task, input, profile: profileForAi, language }) })
  if (!res.ok || !res.body) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? `خطای سرور (${res.status})`)
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let text = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    text += decoder.decode(value, { stream: true })
    onProgress?.(text.length)
  }
  const marker = text.indexOf('\u0000')
  if (marker >= 0) {
    const tail = text.slice(marker + 1)
    if (tail.startsWith('REFUSAL')) throw new Error('مدل این درخواست را رد کرد؛ متن درخواست را تغییر دهید.')
    throw new Error(tail.replace(/^ERROR\s*/, ''))
  }
  return parseJson<T>(text)
}

export function parseJson<T>(text: string): T {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start < 0 || end < start) throw new Error('پاسخ هوش مصنوعی قابل خواندن نبود؛ دوباره تلاش کنید.')
  return JSON.parse(text.slice(start, end + 1)) as T
}
