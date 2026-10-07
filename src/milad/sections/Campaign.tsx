import { useMemo, useState } from 'react'
import { Download, Pause, Play, RefreshCw, Rocket, TrendingDown, TrendingUp } from 'lucide-react'
import { postJson } from '../api'
import { blueprintCampaign, type CampaignPlan, type Profile } from '../data'
import type { StudioProps } from '../StudioApp'
import { AiButton, Card, CopyButton, ErrorNote, Field, Header, LANGS, download, useAi } from '../ui'

// ---------------- Plan ----------------

function planToText(p: CampaignPlan) {
  const c = p.campaign
  return [
    `CAMPAIGN: ${c.name}`, `Objective: ${c.objective}`, `Special ad category: ${c.special_ad_category}`, `Budget: CA$${c.daily_budget_cad}/day · ${c.budget_strategy}`, `Conversion: ${c.conversion_location}`, `UTM: ${c.utm_template}`, '',
    ...p.ad_sets.map((a) => `AD SET: ${a.name}\n  Audience: ${a.audience}\n  Location: ${a.location}\n  Placements: ${a.placements}\n  Optimization: ${a.optimization}\n  Budget: CA$${a.daily_budget_cad}/day\n  Notes: ${a.notes}`), '',
    ...p.ads.map((a) => `AD: ${a.name} [${a.ad_set}] (${a.format})\n  Creative: ${a.creative_brief}\n  Primary text:\n${a.primary_text}\n  Headline: ${a.headline}\n  Description: ${a.description}\n  CTA: ${a.cta_button}\n  URL: ${a.destination_url}`),
  ].join('\n')
}

function adsCsv(p: CampaignPlan) {
  const esc = (s: string | number) => `"${String(s).replace(/"/g, '""')}"`
  const head = ['Campaign Name', 'Ad Set Name', 'Ad Name', 'Format', 'Primary Text', 'Headline', 'Description', 'Call to Action', 'Website URL', 'Creative Brief']
  const rows = p.ads.map((a) => [p.campaign.name, a.ad_set, a.name, a.format, a.primary_text, a.headline, a.description, a.cta_button, a.destination_url, a.creative_brief].map(esc).join(','))
  return [head.map(esc).join(','), ...rows].join('\n')
}

function PlanView({ plan, profile }: { plan: CampaignPlan; profile: Profile }) {
  const [creating, setCreating] = useState('')
  const createInMeta = async () => {
    if (!confirm(`کمپین «${plan.campaign.name}» به حالت متوقف (PAUSED) در حساب تبلیغاتی ساخته شود؟ تا وقتی خودت در Ads Manager فعالش نکنی هزینه‌ای نمی‌شود.`)) return
    setCreating('…')
    type Res = { ok?: boolean; error?: string; result?: { id: string } }
    const res = await postJson<Res>('/api/meta', { action: 'create_campaign', name: plan.campaign.name, daily_budget_cad: plan.campaign.daily_budget_cad }).catch((e): Res => ({ error: String(e.message ?? e) }))
    setCreating(res.ok ? `ساخته شد ✓ (ID ${res.result?.id}) — ad set ها و تبلیغات را با همین متن‌ها در Ads Manager اضافه کن.` : `خطا: ${res.error}`)
  }
  const c = plan.campaign
  return (
    <>
      <Card title="ساختار کمپین" actions={<>
        <CopyButton value={planToText(plan)} label="کپی کل کمپین" />
        <button className="btn ghost sm" onClick={() => download('meta-ads-copy.csv', adsCsv(plan), 'text/csv')}><Download size={14} /> CSV متن تبلیغات</button>
        <button className="btn primary sm" onClick={createInMeta}><Rocket size={14} /> ساخت در Meta (متوقف)</button>
      </>}>
        {creating && <div className="note">{creating}</div>}
        <div className="kv" dir="ltr">
          <div><span>Name</span><b>{c.name}</b></div>
          <div><span>Objective</span><b>{c.objective}</b></div>
          <div><span>Special category</span><b>{c.special_ad_category}</b></div>
          <div><span>Budget</span><b>CA${c.daily_budget_cad}/day · {c.budget_strategy}</b></div>
          <div><span>Conversion</span><b>{c.conversion_location}</b></div>
          <div><span>Pixel events</span><b>{c.pixel_events.join(' · ')}</b></div>
          <div><span>UTM</span><b><code>{c.utm_template}</code></b></div>
        </div>
        <div className="kpis">
          <div><strong>CA${plan.kpis.target_cpl_cad}</strong><span>هدف CPL</span></div>
          <div><strong>{plan.kpis.target_ctr_pct}%</strong><span>CTR لینک</span></div>
          <div><strong>{plan.kpis.max_frequency}</strong><span>حداکثر فرکانس</span></div>
          <div><strong>{plan.kpis.target_hook_rate_pct}%</strong><span>Hook rate (۳ ثانیه)</span></div>
        </div>
      </Card>

      <Card title={`گروه‌های تبلیغاتی و مخاطب (${plan.ad_sets.length})`}>
        <div className="grid-3">
          {plan.ad_sets.map((a) => (
            <div key={a.name} className="adset" dir="ltr">
              <h4>{a.name}</h4>
              <div className="budget">CA${a.daily_budget_cad}/day</div>
              <p><b>Audience:</b> {a.audience}</p>
              <p><b>Location:</b> {a.location}</p>
              <p><b>Placements:</b> {a.placements}</p>
              <p><b>Optimize for:</b> {a.optimization}</p>
              <p className="muted">{a.notes}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title={`تبلیغات (${plan.ads.length}) — متن، تیتر، توضیح، دکمه`}>
        <div className="ads">
          {plan.ads.map((a) => (
            <div key={a.name} className="ad-preview">
              <div className="ad-top">
                {profile.photo ? <img src={profile.photo} alt="" /> : <div className="avatar placeholder sm">MM</div>}
                <div dir="ltr"><b>{profile.name}</b><span>Sponsored · {a.ad_set}</span></div>
              </div>
              <p className="primary-text" dir="auto">{a.primary_text}</p>
              <div className="creative" dir="ltr"><span>{a.format}</span><small>{a.creative_brief}</small></div>
              <div className="ad-bottom" dir="ltr">
                <div><small>{a.destination_url.replace(/^https?:\/\//, '').split('?')[0]}</small><b dir="auto">{a.headline}</b><small dir="auto">{a.description}</small></div>
                <span className="cta">{a.cta_button}</span>
              </div>
              <div className="row"><CopyButton value={a.primary_text} label="متن" /><CopyButton value={a.headline} label="تیتر" /><CopyButton value={a.destination_url} label="لینک" /></div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid-2">
        {plan.instant_form && (
          <Card title="فرم لید (Instant Form)">
            <div dir="ltr" className="small">
              <p><b>{plan.instant_form.intro_headline}</b></p>
              <ol>{plan.instant_form.questions.map((q) => <li key={q}>{q}</li>)}</ol>
              <p>Privacy: {plan.instant_form.privacy_note}</p>
              <p>Thank-you: {plan.instant_form.thank_you}</p>
            </div>
          </Card>
        )}
        <Card title="قوانین خودکار بهینه‌سازی">
          <table className="table small" dir="ltr"><tbody>{plan.rules.map((r) => <tr key={r.if}><td>IF {r.if}</td><td><b>→ {r.then}</b></td></tr>)}</tbody></table>
        </Card>
        <Card title="چک‌لیست قبل از انتشار">
          <ul className="small checklist" dir="ltr">{plan.launch_checklist.map((x) => <li key={x}><label><input type="checkbox" /> {x}</label></li>)}</ul>
        </Card>
        <Card title="برنامه‌ی ۴ هفته">
          <table className="table small" dir="ltr"><tbody>{plan.week_by_week.map((w) => <tr key={w.week}><td><b>{w.week}</b></td><td>{w.actions}</td></tr>)}</tbody></table>
        </Card>
      </div>
    </>
  )
}

// ---------------- Optimizer ----------------

type Row = { id?: string; name: string; level: 'campaign' | 'ad_set' | 'ad'; spend: number; impressions: number; clicks: number; ctr: number; cpm: number; frequency: number; leads: number; status?: string; dailyBudget?: number }
type Decision = { level: string; name: string; id: string; action: string; new_daily_budget_cad: number | null; reason: string }
type Analysis = { summary: string; health: 'good' | 'watch' | 'bad'; decisions: Decision[]; creative_insights: string[]; audience_insights: string[]; next_tests: string[] }

const LEAD_ACTIONS = ['lead', 'onsite_conversion.lead_grouped', 'offsite_conversion.fb_pixel_lead', 'leadgen_grouped']

type Insight = { adset_id?: string; adset_name?: string; spend?: string; impressions?: string; inline_link_clicks?: string; ctr?: string; cpm?: string; frequency?: string; actions?: { action_type: string; value: string }[] }

function fromApi(insights: Insight[], adsets: { id: string; status: string; daily_budget?: string }[]): Row[] {
  return insights.map((r) => {
    const leads = (r.actions ?? []).filter((a) => LEAD_ACTIONS.includes(a.action_type)).reduce((s, a) => Math.max(s, Number(a.value)), 0)
    const meta = adsets.find((a) => a.id === r.adset_id)
    return {
      id: r.adset_id, name: r.adset_name ?? '', level: 'ad_set', spend: Number(r.spend ?? 0), impressions: Number(r.impressions ?? 0), clicks: Number(r.inline_link_clicks ?? 0),
      ctr: Number(r.ctr ?? 0), cpm: Number(r.cpm ?? 0), frequency: Number(r.frequency ?? 0), leads, status: meta?.status, dailyBudget: meta?.daily_budget ? Number(meta.daily_budget) / 100 : undefined,
    }
  })
}

function parseCsv(textValue: string): Row[] {
  const lines = textValue.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []
  const split = (l: string) => (l.match(/("([^"]|"")*"|[^,\t]+|(?<=[,\t])(?=[,\t]|$))/g) ?? []).map((c) => c.replace(/^"|"$/g, '').replace(/""/g, '"').trim())
  const head = split(lines[0]).map((h) => h.toLowerCase())
  const col = (...names: string[]) => head.findIndex((h) => names.some((n) => h.includes(n)))
  const ix = { name: col('ad set name', 'ad name', 'campaign name', 'name'), spend: col('amount spent', 'spend'), imp: col('impressions'), clicks: col('link clicks', 'clicks'), ctr: col('ctr'), cpm: col('cpm'), freq: col('frequency'), leads: col('leads', 'results') }
  const num = (s?: string) => Number((s ?? '').replace(/[^0-9.-]/g, '')) || 0
  return lines.slice(1).map((l) => {
    const c = split(l)
    const impressions = num(c[ix.imp])
    const clicks = num(c[ix.clicks])
    const spend = num(c[ix.spend])
    return { name: c[ix.name] ?? '?', level: 'ad_set', spend, impressions, clicks, ctr: ix.ctr >= 0 ? num(c[ix.ctr]) : impressions ? (clicks / impressions) * 100 : 0, cpm: ix.cpm >= 0 ? num(c[ix.cpm]) : impressions ? (spend / impressions) * 1000 : 0, frequency: num(c[ix.freq]), leads: num(c[ix.leads]) }
  })
}

function ruleCheck(r: Row, target: number): { tone: 'good' | 'watch' | 'bad'; text: string } {
  const cpl = r.leads ? r.spend / r.leads : Infinity
  if (!r.leads && r.spend > target * 2) return { tone: 'bad', text: `بدون لید با CA$${r.spend.toFixed(0)} هزینه → متوقف کن` }
  if (cpl > target * 1.5 && r.spend > target * 2) return { tone: 'bad', text: `CPL ${cpl.toFixed(0)}$ (بیش از ۱.۵ برابر هدف) → بودجه ۳۰٪ کم یا متوقف` }
  if (r.frequency > 3) return { tone: 'watch', text: `فرکانس ${r.frequency.toFixed(1)} → کریتیو جدید یا شعاع بیشتر` }
  if (r.impressions > 2000 && r.ctr < 0.8) return { tone: 'watch', text: `CTR ${r.ctr.toFixed(2)}% → هوک ۲ ثانیه‌ی اول را عوض کن` }
  if (r.leads >= 5 && cpl < target * 0.7) return { tone: 'good', text: `CPL ${cpl.toFixed(0)}$ عالی → بودجه +۲۰٪` }
  if (r.spend < target) return { tone: 'watch', text: 'داده کافی نیست — صبر کن (فاز یادگیری)' }
  return { tone: 'good', text: 'در محدوده‌ی هدف — نگه دار' }
}

function Optimizer({ profile, plan }: { profile: Profile; plan: CampaignPlan }) {
  const ai = useAi(profile)
  const [rows, setRows] = useState<Row[]>([])
  const [csv, setCsv] = useState('')
  const [range, setRange] = useState('last_7d')
  const [status, setStatus] = useState('')
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const target = plan.kpis.target_cpl_cad

  const fetchMeta = async () => {
    setStatus('در حال دریافت از Meta…')
    const res = await postJson<{ connected: boolean; error?: string; insights?: { data: Insight[] }; adsets?: { data: { id: string; status: string; daily_budget?: string }[] } }>('/api/meta', { action: 'insights', level: 'adset', date_preset: range }).catch((e) => ({ connected: false, error: String(e.message ?? e) }))
    if (!res.connected || !('insights' in res) || !res.insights) { setStatus(`اتصال به Meta برقرار نشد: ${res.error ?? ''} — می‌توانی خروجی CSV از Ads Manager را پایین بچسبانی.`); return }
    setRows(fromApi(res.insights.data, res.adsets?.data ?? []))
    setStatus('')
  }

  const act = async (row: Row, action: 'pause' | 'activate' | 'budget', budget?: number) => {
    if (!row.id) return
    const label = action === 'budget' ? `بودجه‌ی روزانه‌ی «${row.name}» به CA$${budget} تغییر کند؟` : `«${row.name}» ${action === 'pause' ? 'متوقف' : 'فعال'} شود؟`
    if (!confirm(label)) return
    const body = action === 'budget' ? { action: 'set_budget', id: row.id, daily_budget_cad: budget } : { action: 'set_status', id: row.id, status: action === 'pause' ? 'PAUSED' : 'ACTIVE' }
    type Res = { ok?: boolean; error?: string }
    const res = await postJson<Res>('/api/meta', body).catch((e): Res => ({ error: String(e.message ?? e) }))
    setStatus(res.ok ? 'انجام شد ✓' : `خطا: ${res.error}`)
    if (res.ok) fetchMeta()
  }

  const totals = useMemo(() => rows.reduce((t, r) => ({ spend: t.spend + r.spend, leads: t.leads + r.leads, imp: t.imp + r.impressions, clicks: t.clicks + r.clicks }), { spend: 0, leads: 0, imp: 0, clicks: 0 }), [rows])

  const analyze = async () => {
    const res = await ai.run<Analysis>('optimize', { kpis: plan.kpis, date_range: range, rows: rows.map((r) => ({ ...r, cpl: r.leads ? +(r.spend / r.leads).toFixed(2) : null })) }, 'Persian (Farsi) for summary, reasons and insights')
    if (res) setAnalysis(res)
  }

  return (
    <>
      <Card title="نتایج تبلیغات" actions={<>
        <select value={range} onChange={(e) => setRange(e.target.value)}><option value="today">امروز</option><option value="yesterday">دیروز</option><option value="last_7d">۷ روز</option><option value="last_14d">۱۴ روز</option><option value="last_30d">۳۰ روز</option></select>
        <button className="btn ghost sm" onClick={fetchMeta}><RefreshCw size={14} /> دریافت از Meta</button>
      </>}>
        {status && <div className="note">{status}</div>}
        <details>
          <summary className="small">یا: خروجی CSV از Ads Manager را اینجا بچسبان</summary>
          <textarea rows={5} dir="ltr" value={csv} onChange={(e) => setCsv(e.target.value)} placeholder="Ad set name,Amount spent (CAD),Impressions,Link clicks,CTR (link click-through rate),Frequency,Leads" />
          <button className="btn ghost sm" onClick={() => setRows(parseCsv(csv))}>خواندن CSV</button>
        </details>
        {rows.length > 0 && (
          <>
            <div className="kpis">
              <div><strong>CA${totals.spend.toFixed(0)}</strong><span>هزینه</span></div>
              <div><strong>{totals.leads}</strong><span>لید</span></div>
              <div><strong>{totals.leads ? `CA$${(totals.spend / totals.leads).toFixed(1)}` : '—'}</strong><span>CPL (هدف {target}$)</span></div>
              <div><strong>{totals.imp ? `${((totals.clicks / totals.imp) * 100).toFixed(2)}%` : '—'}</strong><span>CTR لینک</span></div>
            </div>
            <div className="table-wrap">
              <table className="table" dir="ltr">
                <thead><tr><th>Ad set</th><th>Spend</th><th>Leads</th><th>CPL</th><th>CTR</th><th>CPM</th><th>Freq</th><th>تشخیص</th><th /></tr></thead>
                <tbody>
                  {rows.map((r) => {
                    const check = ruleCheck(r, target)
                    return (
                      <tr key={r.id ?? r.name}>
                        <td>{r.name}{r.status ? <small className="muted"> · {r.status}</small> : null}</td>
                        <td>${r.spend.toFixed(0)}</td><td>{r.leads}</td><td>{r.leads ? `$${(r.spend / r.leads).toFixed(1)}` : '—'}</td>
                        <td>{r.ctr.toFixed(2)}%</td><td>${r.cpm.toFixed(1)}</td><td>{r.frequency.toFixed(1)}</td>
                        <td dir="rtl"><span className={`tone ${check.tone}`}>{check.text}</span></td>
                        <td className="row nowrap">
                          {r.id && (r.status === 'PAUSED'
                            ? <button className="btn ghost sm" onClick={() => act(r, 'activate')} title="فعال"><Play size={14} /></button>
                            : <button className="btn ghost sm" onClick={() => act(r, 'pause')} title="توقف"><Pause size={14} /></button>)}
                          {r.id && r.dailyBudget !== undefined && <>
                            <button className="btn ghost sm" onClick={() => act(r, 'budget', Math.round(r.dailyBudget! * 1.2))} title="+۲۰٪"><TrendingUp size={14} /></button>
                            <button className="btn ghost sm" onClick={() => act(r, 'budget', Math.max(5, Math.round(r.dailyBudget! * 0.7)))} title="-۳۰٪"><TrendingDown size={14} /></button>
                          </>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <AiButton busy={ai.busy} progress={ai.progress} onClick={analyze}>تحلیل و تصمیم امروز</AiButton>
          </>
        )}
        <ErrorNote error={ai.error} />
      </Card>

      {analysis && (
        <Card title="تحلیل مدیا‌باینگ">
          <p><span className={`tone ${analysis.health}`}>{analysis.health === 'good' ? 'سالم' : analysis.health === 'watch' ? 'نیاز به توجه' : 'بحرانی'}</span> {analysis.summary}</p>
          <table className="table small"><thead><tr><th>سطح</th><th>نام</th><th>اقدام</th><th>دلیل</th><th /></tr></thead><tbody>
            {analysis.decisions.map((d, i) => {
              const row = rows.find((r) => r.id === d.id || r.name === d.name)
              return (
                <tr key={i}>
                  <td>{d.level}</td><td dir="ltr">{d.name}</td><td><b>{d.action}</b>{d.new_daily_budget_cad ? ` → CA$${d.new_daily_budget_cad}` : ''}</td><td>{d.reason}</td>
                  <td>{row?.id && d.action === 'pause' && <button className="btn ghost sm" onClick={() => act(row, 'pause')}>اجرا</button>}
                    {row?.id && d.new_daily_budget_cad && <button className="btn ghost sm" onClick={() => act(row, 'budget', d.new_daily_budget_cad!)}>اجرا</button>}</td>
                </tr>
              )
            })}
          </tbody></table>
          <div className="grid-3">
            <div><h4>کریتیو</h4><ul className="small">{analysis.creative_insights.map((x) => <li key={x}>{x}</li>)}</ul></div>
            <div><h4>مخاطب</h4><ul className="small">{analysis.audience_insights.map((x) => <li key={x}>{x}</li>)}</ul></div>
            <div><h4>تست‌های بعدی</h4><ul className="small">{analysis.next_tests.map((x) => <li key={x}>{x}</li>)}</ul></div>
          </div>
        </Card>
      )}
    </>
  )
}

export default function Campaign({ profile }: StudioProps) {
  const [tab, setTab] = useState<'plan' | 'optimize'>('plan')
  const [plan, setPlan] = useState<CampaignPlan>(() => blueprintCampaign(profile))
  const [source, setSource] = useState<'blueprint' | 'ai'>('blueprint')
  const ai = useAi(profile)
  const [focus, setFocus] = useState('All site AI tools — sellers first, then buyers')
  const [budget, setBudget] = useState(profile.dailyBudget)
  const [lang, setLang] = useState(LANGS[1].value)
  const [extra, setExtra] = useState('')

  const build = async () => {
    const res = await ai.run<CampaignPlan>('campaign', { focus, daily_budget_cad: budget, target_cpl_cad: profile.targetCpl, market: profile.areas, notes: extra }, lang)
    if (res?.campaign) { setPlan(res); setSource('ai') }
  }

  return (
    <>
      <Header title="کمپین متا" subtitle="کمپین کامل لید: هدف، مخاطب، بودجه، متن، تیتر، فرم و قوانین بستن/افزایش بودجه" actions={
        <div className="tabs">
          <button className={tab === 'plan' ? 'active' : ''} onClick={() => setTab('plan')}>طراحی کمپین</button>
          <button className={tab === 'optimize' ? 'active' : ''} onClick={() => setTab('optimize')}>تحلیل و بهینه‌سازی</button>
        </div>
      } />
      {tab === 'plan' ? (
        <>
          <Card title="ساخت کمپین اختصاصی با هوش مصنوعی" actions={<>
            {source === 'ai' && <button className="btn ghost sm" onClick={() => { setPlan(blueprintCampaign(profile)); setSource('blueprint') }}>برگشت به نقشه‌ی پایه</button>}
            <AiButton busy={ai.busy} progress={ai.progress} onClick={build}>طراحی کمپین</AiButton>
          </>}>
            <div className="form-grid four">
              <Field label="تمرکز"><select value={focus} onChange={(e) => setFocus(e.target.value)}>
                <option>All site AI tools — sellers first, then buyers</option>
                {profile.features.map((f) => <option key={f.name}>{`Feature: ${f.name}`}</option>)}
                <option>Single listing promotion</option>
                <option>Persian-speaking community in the GTA</option>
                <option>Investors (multiplex / pre-construction)</option>
              </select></Field>
              <Field label="بودجه‌ی روزانه (CAD)"><input type="number" min={10} value={budget} onChange={(e) => setBudget(Number(e.target.value))} /></Field>
              <Field label="زبان تبلیغ"><select value={lang} onChange={(e) => setLang(e.target.value)}>{LANGS.map((l) => <option key={l.label} value={l.value}>{l.label}</option>)}</select></Field>
            </div>
            <Field label="جزئیات (اختیاری)"><textarea rows={2} value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="مثلاً آدرس لیستینگ، پیشنهاد ویژه، فصل، رقبا…" /></Field>
            <ErrorNote error={ai.error} />
            {source === 'blueprint' && <p className="muted small">پایین، نقشه‌ی پایه‌ی آماده بر اساس ابزارهای سایت و ریلزهای کتابخانه است — همین الان قابل اجراست.</p>}
          </Card>
          <PlanView plan={plan} profile={profile} />
        </>
      ) : (
        <Optimizer profile={profile} plan={plan} />
      )}
    </>
  )
}
