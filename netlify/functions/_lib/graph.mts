export const GRAPH_VERSION = process.env.META_GRAPH_VERSION ?? 'v23.0'

export async function graph(path: string, params: Record<string, string> = {}, method: 'GET' | 'POST' = 'GET', host = 'graph.facebook.com') {
  const token = host === 'graph.instagram.com' ? process.env.IG_ACCESS_TOKEN ?? process.env.META_ACCESS_TOKEN : process.env.META_ACCESS_TOKEN
  if (!token) throw new Error('META_ACCESS_TOKEN is not configured on the server')
  const url = new URL(`https://${host}/${GRAPH_VERSION}/${path.replace(/^\//, '')}`)
  const body = new URLSearchParams({ ...params, access_token: token })
  let res: Response
  if (method === 'GET') {
    body.forEach((v, k) => url.searchParams.set(k, v))
    res = await fetch(url)
  } else {
    res = await fetch(url, { method: 'POST', body })
  }
  const data = (await res.json()) as { error?: { message: string } }
  if (!res.ok || data.error) throw new Error(data.error?.message ?? `Graph API ${res.status}`)
  return data
}
