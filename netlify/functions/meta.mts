import { json, requireUser } from './_lib/auth.mts'
import { graph } from './_lib/graph.mts'

const INSIGHT_FIELDS = [
  'campaign_id', 'campaign_name', 'adset_id', 'adset_name', 'ad_id', 'ad_name',
  'spend', 'impressions', 'reach', 'frequency', 'clicks', 'inline_link_clicks', 'ctr', 'cpm', 'cpc',
  'actions', 'cost_per_action_type', 'video_play_actions', 'video_thruplay_watched_actions',
].join(',')

type Body =
  | { action: 'insights'; level?: 'campaign' | 'adset' | 'ad'; date_preset?: string }
  | { action: 'set_status'; id: string; status: 'PAUSED' | 'ACTIVE' }
  | { action: 'set_budget'; id: string; daily_budget_cad: number }
  | { action: 'create_campaign'; name: string; daily_budget_cad: number }

function account(): string {
  const id = process.env.META_AD_ACCOUNT_ID
  if (!id) throw new Error('META_AD_ACCOUNT_ID is not configured on the server')
  return id.startsWith('act_') ? id : `act_${id}`
}

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)
  const user = requireUser(req)
  if (user instanceof Response) return user
  const body = (await req.json().catch(() => null)) as Body | null
  if (!body) return json({ error: 'bad request' }, 400)

  try {
    switch (body.action) {
      case 'insights': {
        const level = body.level ?? 'adset'
        const insights = await graph(`${account()}/insights`, {
          level,
          date_preset: body.date_preset ?? 'last_7d',
          fields: INSIGHT_FIELDS,
          limit: '200',
        })
        const adsets = await graph(`${account()}/adsets`, { fields: 'id,name,status,effective_status,daily_budget,campaign_id', limit: '200' })
        return json({ connected: true, insights, adsets })
      }
      case 'set_status':
        return json({ ok: true, result: await graph(body.id, { status: body.status }, 'POST') })
      case 'set_budget':
        // Meta expects the budget in the account currency's minor unit (cents).
        return json({ ok: true, result: await graph(body.id, { daily_budget: String(Math.round(body.daily_budget_cad * 100)) }, 'POST') })
      case 'create_campaign': {
        // Created PAUSED so nothing spends until reviewed in Ads Manager.
        const result = await graph(`${account()}/campaigns`, {
          name: body.name,
          objective: 'OUTCOME_LEADS',
          status: 'PAUSED',
          special_ad_categories: JSON.stringify(['HOUSING']),
          special_ad_category_country: JSON.stringify(['CA']),
          daily_budget: String(Math.round(body.daily_budget_cad * 100)),
          bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
        }, 'POST')
        return json({ ok: true, result })
      }
      default:
        return json({ error: 'unknown action' }, 400)
    }
  } catch (err) {
    return json({ connected: false, error: String(err instanceof Error ? err.message : err) })
  }
}

export const config = { path: '/api/meta' }
