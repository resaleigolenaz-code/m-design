import Anthropic from '@anthropic-ai/sdk'
import { json, requireUser } from './_lib/auth.mts'

const MODEL = 'claude-opus-5-5'

const BASE_SYSTEM = `You are the in-house creative director, Meta ads media buyer and short-form video editor for a Toronto-area (GTA) real estate agent.
You know the 2026 Instagram Reels and Meta Ads landscape: Advantage+ audiences, Advantage+ placements, Instant Forms vs. website conversions, Conversions API, housing Special Ad Category rules (no targeting by age, gender, postal code or narrow radius; minimum 15 km radius; no detailed targeting exclusions), creative-led targeting, hook-rate / hold-rate metrics and 9:16 safe zones.
All ad copy must respect Canadian real-estate advertising rules (RECO / TRESA): name the brokerage, no misleading claims, no guaranteed outcomes.
Write like a top performer, not like a template: concrete, local, specific to this agent's real tools and listings.
When asked for JSON, reply with one JSON object only — no markdown fences, no commentary.`

type Task = 'reels' | 'campaign' | 'caption' | 'edit-plan' | 'carousel' | 'optimize' | 'audit' | 'poster-copy'

const TASKS: Record<Task, string> = {
  reels: `Create a set of Instagram Reels concepts that drive leads to the agent's website features.
Return JSON: {"reels":[{"title":string,"goal":string,"feature":string,"length_sec":number,"hook_visual":string,"hook_line_en":string,"hook_line_fa":string,
"scenes":[{"t":string,"shot":string,"on_screen_text":string,"dialogue_en":string,"dialogue_fa":string,"broll":string}],
"cta":string,"caption":string,"hashtags":string[],"music_mood":string,"thumbnail_text":string,"why_it_works":string}]}
Each reel must be filmable by the agent alone, standing and talking to camera (we will remove/replace the background in editing). Hooks must land in the first 1.5 seconds.`,
  campaign: `Build a complete, launch-ready Meta Ads lead-generation campaign.
Return JSON: {"campaign":{"name":string,"objective":string,"special_ad_category":string,"buying_type":string,"budget_strategy":string,"daily_budget_cad":number,"conversion_location":string,"pixel_events":string[],"utm_template":string},
"ad_sets":[{"name":string,"audience":string,"location":string,"placements":string,"optimization":string,"daily_budget_cad":number,"notes":string}],
"ads":[{"name":string,"ad_set":string,"format":string,"creative_brief":string,"primary_text":string,"headline":string,"description":string,"cta_button":string,"destination_url":string}],
"instant_form":{"intro_headline":string,"questions":string[],"privacy_note":string,"thank_you":string},
"kpis":{"target_cpl_cad":number,"target_ctr_pct":number,"max_frequency":number,"target_hook_rate_pct":number},
"rules":[{"if":string,"then":string}],"launch_checklist":string[],"week_by_week":[{"week":string,"actions":string}]}
Respect the housing special ad category (no age/gender/postcode targeting, radius ≥ 15 km). Give at least 3 ad sets and 6 ads with distinct angles.`,
  caption: `Write captions and Meta ad copy for the given video or idea.
Return JSON: {"variants":[{"angle":string,"instagram_caption":string,"primary_text":string,"headline":string,"description":string,"cta_button":string,"hashtags":string[]}],"first_comment":string,"story_text":string}
Give 3 variants with different angles.`,
  'edit-plan': `The agent filmed a single talking-head video. Plan the edit.
Return JSON: {"title":string,"hook_text":string,"captions":[{"start":number,"end":number,"text":string}],"overlays":[{"start":number,"end":number,"text":string,"style":"hook"|"stat"|"cta"|"lower-third"}],"zoom_points":number[],"background":string,"music_mood":string,"cta_text":string,"caption":string,"hashtags":string[],"notes":string}
If a transcript is provided, cut captions from it into 2–5 word chunks timed across the duration. Otherwise write a script that fits the duration and caption that. Keep times within the video duration.`,
  carousel: `Create an Instagram carousel / slide deck.
Return JSON: {"title":string,"slides":[{"kicker":string,"title":string,"body":string}],"caption":string,"hashtags":string[]}
6–9 slides. Slide 1 is a scroll-stopping hook, the last slide is a CTA to the website feature. Body text max 28 words per slide.`,
  optimize: `Analyse these Meta Ads results like a senior media buyer and decide what to do today.
Return JSON: {"summary":string,"health":"good"|"watch"|"bad","decisions":[{"level":"campaign"|"ad_set"|"ad","name":string,"id":string,"action":"pause"|"scale"|"decrease"|"keep"|"refresh_creative"|"change_audience","new_daily_budget_cad":number|null,"reason":string}],"creative_insights":string[],"audience_insights":string[],"next_tests":string[]}
Be decisive. Use the agent's KPI targets if given; otherwise use GTA real-estate lead-gen benchmarks (CPL ~CA$15–45, CTR > 1%, frequency < 3).`,
  audit: `Audit this Instagram account for a real estate agent and give a content strategy.
Return JSON: {"positioning":string,"strengths":string[],"gaps":string[],"pillars":[{"name":string,"share_pct":number,"examples":string[]}],"weekly_plan":[{"day":string,"format":string,"idea":string}],"bio_suggestion":string,"highlight_covers":string[],"quick_wins":string[]}`,
  'poster-copy': `Write poster copy.
Return JSON: {"options":[{"kicker":string,"headline":string,"subline":string,"cta":string}]}
Give 4 options, headline max 6 words.`,
}

function contextBlock(profile: unknown): string {
  return `AGENT PROFILE (source of truth — use these names, tools and URLs):\n${JSON.stringify(profile, null, 2)}`
}

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)
  const user = requireUser(req)
  if (user instanceof Response) return user
  if (!process.env.ANTHROPIC_API_KEY) return json({ error: 'ANTHROPIC_API_KEY is not configured on the server' }, 500)

  const body = (await req.json().catch(() => null)) as { task?: Task; input?: unknown; profile?: unknown; language?: string } | null
  if (!body?.task || !(body.task in TASKS)) return json({ error: 'unknown task' }, 400)

  const client = new Anthropic()
  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 32000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: body.task === 'optimize' || body.task === 'campaign' ? 'medium' : 'low' },
    system: [
      { type: 'text', text: BASE_SYSTEM },
      { type: 'text', text: contextBlock(body.profile), cache_control: { type: 'ephemeral' } },
    ],
    messages: [
      {
        role: 'user',
        content: `${TASKS[body.task]}\n\nOutput language preference: ${body.language ?? 'English ad copy, Persian (Farsi) notes where useful'}.\n\nREQUEST:\n${JSON.stringify(body.input ?? {}, null, 2)}`,
      },
    ],
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
        const final = await stream.finalMessage()
        if (final.stop_reason === 'refusal') controller.enqueue(encoder.encode('\n\u0000REFUSAL'))
      } catch (err) {
        const message = err instanceof Anthropic.APIError ? `API error ${err.status}: ${err.message}` : String(err)
        controller.enqueue(encoder.encode(`\n\u0000ERROR ${message}`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' } })
}

export const config = { path: '/api/ai' }
