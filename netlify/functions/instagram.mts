import { json, requireUser } from './_lib/auth.mts'
import { graph } from './_lib/graph.mts'

const PROFILE_FIELDS = 'username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website'
const MEDIA_FIELDS = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count'

export default async (req: Request) => {
  const user = requireUser(req)
  if (user instanceof Response) return user
  try {
    const igUserId = process.env.IG_USER_ID
    // Instagram Graph API via a Facebook Page (IG_USER_ID) or Instagram Login (graph.instagram.com/me).
    const host = igUserId ? 'graph.facebook.com' : 'graph.instagram.com'
    const id = igUserId ?? 'me'
    const profile = await graph(id, { fields: PROFILE_FIELDS }, 'GET', host)
    const media = (await graph(`${id}/media`, { fields: MEDIA_FIELDS, limit: '24' }, 'GET', host)) as { data?: unknown[] }
    return json({ connected: true, profile, media: media.data ?? [] })
  } catch (err) {
    return json({ connected: false, error: String(err instanceof Error ? err.message : err) })
  }
}

export const config = { path: '/api/instagram' }
