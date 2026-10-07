import { useState } from 'react'
import { ChevronDown, Film } from 'lucide-react'
import { REEL_LIBRARY, type Reel } from '../data'
import type { StudioProps } from '../StudioApp'
import { AiButton, Card, CopyButton, ErrorNote, Field, Header, LANGS, useAi } from '../ui'

const GOALS = ['Seller leads (listings)', 'Buyer leads', 'Investor leads', 'Persian-speaking community', 'Brand awareness / followers', 'Promote a specific listing']
const STYLES = ['Talking head + text pops', 'Myth vs. fact', 'Story / client case', 'Green-screen over website demo', 'POV humour', 'Fast listicle', 'Street interview style (solo)']

function scriptText(r: Reel) {
  return [
    `🎬 ${r.title} (${r.length_sec}s) — ${r.goal}`,
    `HOOK (0–1.5s): ${r.hook_line_en}`,
    `هوک: ${r.hook_line_fa}`,
    '',
    ...r.scenes.map((s) => `[${s.t}] ${s.shot}\n  TEXT: ${s.on_screen_text}\n  EN: ${s.dialogue_en}\n  FA: ${s.dialogue_fa}${s.broll ? `\n  B-ROLL: ${s.broll}` : ''}`),
    '',
    `CTA: ${r.cta}`,
    `CAPTION: ${r.caption}`,
    r.hashtags.join(' '),
  ].join('\n')
}

function ReelCard({ reel, onAtelier }: { reel: Reel; onAtelier: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`reel ${open ? 'open' : ''}`}>
      <button className="reel-head" onClick={() => setOpen(!open)}>
        <div className="reel-thumb" dir="auto">{reel.thumbnail_text}</div>
        <div className="reel-meta">
          <strong dir="auto">{reel.title}</strong>
          <span className="muted small" dir="ltr">{reel.feature} · {reel.length_sec}s · {reel.goal}</span>
          <span className="hook" dir="auto">«{reel.hook_line_fa}»</span>
        </div>
        <ChevronDown size={18} className="chev" />
      </button>
      {open && (
        <div className="reel-body">
          <p className="small"><strong>تصویر هوک: </strong><span dir="auto">{reel.hook_visual}</span></p>
          <p className="small" dir="ltr"><strong>Hook: </strong>{reel.hook_line_en}</p>
          <div className="table-wrap">
            <table className="table scenes">
              <thead><tr><th>زمان</th><th>نما</th><th>متن روی صفحه</th><th>دیالوگ</th><th>B-roll</th></tr></thead>
              <tbody>
                {reel.scenes.map((s) => (
                  <tr key={s.t}>
                    <td dir="ltr">{s.t}</td><td dir="auto">{s.shot}</td><td dir="auto"><b>{s.on_screen_text}</b></td>
                    <td><div dir="ltr">{s.dialogue_en}</div><div className="fa">{s.dialogue_fa}</div></td>
                    <td dir="auto" className="muted">{s.broll}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small"><strong>CTA: </strong><span dir="auto">{reel.cta}</span></p>
          <p className="small caption" dir="auto">{reel.caption}<br /><span className="muted">{reel.hashtags.join(' ')}</span></p>
          <p className="small muted">🎵 {reel.music_mood} · 💡 {reel.why_it_works}</p>
          <div className="row">
            <CopyButton value={scriptText(reel)} label="کپی کل اسکریپت" />
            <CopyButton value={`${reel.caption}\n\n${reel.hashtags.join(' ')}`} label="کپی کپشن" />
            <button className="btn primary sm" onClick={onAtelier}><Film size={14} /> ببر به آتلیه</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Reels({ profile, sendToAtelier }: StudioProps) {
  const ai = useAi(profile)
  const [generated, setGenerated] = useState<Reel[]>([])
  const [feature, setFeature] = useState(profile.features[0]?.name ?? '')
  const [goal, setGoal] = useState(GOALS[0])
  const [style, setStyle] = useState(STYLES[0])
  const [count, setCount] = useState(4)
  const [extra, setExtra] = useState('')
  const [lang, setLang] = useState(LANGS[0].value)

  const create = async () => {
    const res = await ai.run<{ reels: Reel[] }>('reels', {
      count, feature, goal, style,
      constraints: 'Milad films alone, standing, talking to camera. 15–35 seconds. Hook in first 1.5s. Ending CTA to the website feature.',
      notes: extra,
    }, lang)
    if (res?.reels) setGenerated([...res.reels, ...generated])
  }

  return (
    <>
      <Header title="ایده و سناریوی ریلز" subtitle="هوک، دیالوگ انگلیسی و فارسی، صحنه‌بندی، CTA و کپشن — آماده‌ی فیلم‌برداری و تبلیغ" />

      <Card title="ساخت ریلز جدید با هوش مصنوعی" actions={<AiButton busy={ai.busy} progress={ai.progress} onClick={create}>بساز</AiButton>}>
        <div className="form-grid four">
          <Field label="ابزار سایت"><select value={feature} onChange={(e) => setFeature(e.target.value)}>{profile.features.map((f) => <option key={f.name}>{f.name}</option>)}<option value="Any — pick the best mix">ترکیبی</option></select></Field>
          <Field label="هدف"><select value={goal} onChange={(e) => setGoal(e.target.value)}>{GOALS.map((g) => <option key={g}>{g}</option>)}</select></Field>
          <Field label="سبک"><select value={style} onChange={(e) => setStyle(e.target.value)}>{STYLES.map((g) => <option key={g}>{g}</option>)}</select></Field>
          <Field label="زبان"><select value={lang} onChange={(e) => setLang(e.target.value)}>{LANGS.map((l) => <option key={l.label} value={l.value}>{l.label}</option>)}</select></Field>
          <Field label="تعداد"><input type="number" min={1} max={8} value={count} onChange={(e) => setCount(Number(e.target.value))} /></Field>
        </div>
        <Field label="توضیح اضافه (اختیاری)"><textarea rows={2} value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="مثلاً: لیستینگ جدید ۶۱ Seaton Street، یا ترند فلان صدا…" /></Field>
        <ErrorNote error={ai.error} />
      </Card>

      {generated.length > 0 && (
        <Card title={`ساخته‌شده با هوش مصنوعی (${generated.length})`}>
          {generated.map((r, i) => <ReelCard key={`g${i}`} reel={r} onAtelier={() => sendToAtelier(r)} />)}
        </Card>
      )}

      <Card title={`کتابخانه‌ی آماده (${REEL_LIBRARY.length} ریلز)`}>
        <p className="muted small">هر ریلز طوری نوشته شده که میلاد تنها، ایستاده و رو به دوربین بگیرد؛ بکگراند در آتلیه عوض می‌شود. ترتیب پیشنهادی انتشار: ۱ → ۲ → ۶ → ۳ → ۴ → ۹.</p>
        {REEL_LIBRARY.map((r, i) => <ReelCard key={i} reel={r} onAtelier={() => sendToAtelier(r)} />)}
      </Card>

      <Card title="راهنمای فیلم‌برداری (برای هر ریلز)">
        <ul className="small tips">
          <li>گوشی عمودی ۹:۱۶، دوربین پشت، ۴K/30fps. لنز در ارتفاع چشم، فاصله‌ی ~۱.۲ متر (از کمر به بالا).</li>
          <li>پشت سر یک دیوار ساده و روشن — برای حذف بکگراند تمیزتر. نور از روبه‌رو (پنجره یا رینگ‌لایت).</li>
          <li>میکروفون یقه‌ای بی‌سیم؛ صدای خوب از تصویر مهم‌تر است.</li>
          <li>جمله‌ی اول (هوک) را بدون مکث و با انرژی بگو؛ ۰.۵ ثانیه سکوت قبلش را در آتلیه می‌بُریم.</li>
          <li>هر جمله را جدا بگیر و یک ثانیه مکث کن — برش‌ها و زوم‌ها روی همین مکث‌ها می‌نشینند.</li>
          <li>متن‌ها در ۱۵٪ بالا و ۲۰٪ پایین کادر نمی‌آیند (Safe zone رابط اینستاگرام).</li>
        </ul>
      </Card>
    </>
  )
}
