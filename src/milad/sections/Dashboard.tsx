import { useEffect, useState } from 'react'
import { AtSign, ExternalLink, RefreshCw } from 'lucide-react'
import { getJson } from '../api'
import type { StudioProps } from '../StudioApp'
import { AiButton, Card, ErrorNote, Header, useAi } from '../ui'

type IgMedia = { id: string; caption?: string; media_type: string; media_url?: string; thumbnail_url?: string; permalink: string; timestamp: string; like_count?: number; comments_count?: number }
type IgData = { connected: boolean; error?: string; profile?: { username: string; name?: string; biography?: string; followers_count?: number; follows_count?: number; media_count?: number; profile_picture_url?: string; website?: string }; media?: IgMedia[] }

type Audit = { positioning: string; strengths: string[]; gaps: string[]; pillars: { name: string; share_pct: number; examples: string[] }[]; weekly_plan: { day: string; format: string; idea: string }[]; bio_suggestion: string; highlight_covers: string[]; quick_wins: string[] }

export default function Dashboard({ profile, go }: StudioProps) {
  const [ig, setIg] = useState<IgData | null>(null)
  const [loading, setLoading] = useState(false)
  const [audit, setAudit] = useState<Audit | null>(null)
  const ai = useAi(profile)

  const loadIg = () => {
    setLoading(true)
    getJson<IgData>('/api/instagram').then(setIg).catch((e) => setIg({ connected: false, error: String(e.message ?? e) })).finally(() => setLoading(false))
  }
  useEffect(loadIg, [])

  const media = ig?.media ?? []
  const engagement = media.length && ig?.profile?.followers_count
    ? (media.reduce((s, m) => s + (m.like_count ?? 0) + (m.comments_count ?? 0), 0) / media.length / ig.profile.followers_count) * 100
    : null
  const best = [...media].sort((a, b) => (b.like_count ?? 0) + (b.comments_count ?? 0) - ((a.like_count ?? 0) + (a.comments_count ?? 0))).slice(0, 3)

  const runAudit = async () => {
    const result = await ai.run<Audit>('audit', {
      instagram: ig?.profile ?? { username: profile.instagram, note: 'API not connected — infer from the agent profile' },
      recent_posts: media.slice(0, 18).map((m) => ({ type: m.media_type, caption: m.caption?.slice(0, 300), likes: m.like_count, comments: m.comments_count, date: m.timestamp })),
    }, 'Persian (Farsi) for the analysis; example captions/hooks in English')
    if (result) setAudit(result)
  }

  return (
    <>
      <Header title={`سلام ${profile.nameFa.split(' ')[0]} 👋`} subtitle="همه‌چیز پیج، سایت و تبلیغاتت در یک جا" />

      <div className="grid-3">
        <Card className="profile-card">
          <div className="row">
            {profile.photo ? <img className="avatar" src={profile.photo} alt="" /> : <div className="avatar placeholder">MM</div>}
            <div>
              <h3>{profile.name}</h3>
              <div className="muted">{profile.title} · {profile.brokerage}</div>
              <div className="muted" dir="ltr">{profile.phone} · {profile.email}</div>
            </div>
          </div>
          <p className="small" dir="auto">{profile.bio}</p>
          <div className="chip-row"><span className="chip gold">{profile.proof}</span><span className="chip">{profile.languages}</span></div>
          <div className="row">
            <a className="btn ghost sm" href={profile.website} target="_blank" rel="noreferrer"><ExternalLink size={14} /> سایت</a>
            <a className="btn ghost sm" href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noreferrer"><AtSign size={14} /> اینستاگرام</a>
            <button className="btn ghost sm" onClick={() => go('profile')}>ویرایش</button>
          </div>
        </Card>

        <Card title="اینستاگرام" actions={<button className="btn ghost sm" onClick={loadIg} disabled={loading}><RefreshCw size={14} className={loading ? 'spin' : ''} /></button>}>
          {ig?.connected && ig.profile ? (
            <>
              <div className="stats">
                <div><strong>{ig.profile.followers_count?.toLocaleString()}</strong><span>فالوور</span></div>
                <div><strong>{ig.profile.media_count?.toLocaleString()}</strong><span>پست</span></div>
                <div><strong>{engagement ? `${engagement.toFixed(2)}%` : '—'}</strong><span>نرخ تعامل</span></div>
              </div>
              <p className="small" dir="auto">{ig.profile.biography}</p>
            </>
          ) : (
            <div className="small">
              <p>اتصال زنده به اینستاگرام هنوز برقرار نیست{ig?.error ? ` (${ig.error})` : ''}.</p>
              <p className="muted">در «پروفایل و اتصال‌ها» راهنمای گرفتن توکن Instagram Graph API هست. تا آن موقع، همه‌ی ابزارها با اطلاعات پروفایل کار می‌کنند.</p>
              <a className="btn ghost sm" href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noreferrer">@{profile.instagram}</a>
            </div>
          )}
        </Card>

        <Card title="ابزارهای هوش مصنوعی سایت" actions={<button className="btn ghost sm" onClick={() => go('profile')}>ویرایش</button>}>
          <ul className="feature-list">
            {profile.features.map((f) => (
              <li key={f.name}><strong dir="ltr">{f.name}</strong><span className="muted small" dir="ltr">{f.pitch}</span></li>
            ))}
          </ul>
        </Card>
      </div>

      {media.length > 0 && (
        <Card title="آخرین پست‌ها" actions={best.length ? <span className="muted small">پربازدیدترین‌ها با قاب طلایی</span> : undefined}>
          <div className="ig-grid">
            {media.slice(0, 12).map((m) => (
              <a key={m.id} href={m.permalink} target="_blank" rel="noreferrer" className={best.includes(m) ? 'best' : ''}>
                <img src={m.thumbnail_url ?? m.media_url} alt="" loading="lazy" />
                <span>❤ {m.like_count ?? 0} · 💬 {m.comments_count ?? 0}</span>
              </a>
            ))}
          </div>
        </Card>
      )}

      <Card title="شروع سریع">
        <div className="quick">
          <button onClick={() => go('reels')}><strong>۱۰ ریلز آماده</strong><span>هوک، دیالوگ و صحنه برای هر ابزار سایت</span></button>
          <button onClick={() => go('campaign')}><strong>کمپین کامل متا</strong><span>تارگت، بودجه، متن و تیتر + بهینه‌سازی</span></button>
          <button onClick={() => go('atelier')}><strong>آتلیه ویدیو</strong><span>آپلود ویدیو، حذف بکگراند، زیرنویس، خروجی</span></button>
          <button onClick={() => go('posters')}><strong>پوستر</strong><span>Just Listed، Sold، کاور ریلز با عکس تو</span></button>
          <button onClick={() => go('slides')}><strong>کاروسل</strong><span>اسلایدهای آموزشی برای پست و تبلیغ</span></button>
        </div>
      </Card>

      <Card title="تحلیل پیج و استراتژی محتوا با هوش مصنوعی" actions={<AiButton busy={ai.busy} progress={ai.progress} onClick={runAudit}>تحلیل کن</AiButton>}>
        <ErrorNote error={ai.error} />
        {!audit && !ai.busy && <p className="muted small">بر اساس پست‌های اخیر و ابزارهای سایت، جایگاه برند، ستون‌های محتوا و برنامه‌ی هفتگی پیشنهاد می‌شود.</p>}
        {audit && (
          <div className="audit">
            <p><strong>جایگاه برند: </strong>{audit.positioning}</p>
            <div className="grid-2">
              <div><h4>نقاط قوت</h4><ul>{audit.strengths.map((s) => <li key={s}>{s}</li>)}</ul></div>
              <div><h4>کمبودها</h4><ul>{audit.gaps.map((s) => <li key={s}>{s}</li>)}</ul></div>
            </div>
            <h4>ستون‌های محتوا</h4>
            <div className="chip-row">{audit.pillars.map((p) => <span key={p.name} className="chip" title={p.examples.join(' · ')}>{p.name} · {p.share_pct}%</span>)}</div>
            <h4>برنامه‌ی هفتگی</h4>
            <table className="table"><tbody>{audit.weekly_plan.map((d) => <tr key={d.day}><td>{d.day}</td><td>{d.format}</td><td dir="auto">{d.idea}</td></tr>)}</tbody></table>
            <p><strong>بایوی پیشنهادی: </strong><span dir="auto">{audit.bio_suggestion}</span></p>
            <h4>کارهای سریع</h4><ul>{audit.quick_wins.map((s) => <li key={s}>{s}</li>)}</ul>
          </div>
        )}
      </Card>
    </>
  )
}
