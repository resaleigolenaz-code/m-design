import { useEffect, useRef, useState } from 'react'
import { Download, Upload } from 'lucide-react'
import type { Profile } from '../data'
import { BACKGROUNDS, FONT_SANS, FONT_SERIF, SIZES, agentStrip, circleImage, downloadCanvas, drawCover, ensureFonts, loadImage, paintBackground, readFileAsDataUrl, roundRect, text, type BgKey, type SizeKey } from '../draw'
import type { StudioProps } from '../StudioApp'
import { AiButton, Card, ErrorNote, Field, Header, useAi } from '../ui'

type Template = 'listing' | 'open-house' | 'sold' | 'agent' | 'reel-cover' | 'tip'
const TEMPLATES: { key: Template; label: string; kicker: string; headline: string; subline: string; cta: string }[] = [
  { key: 'listing', label: 'Just Listed', kicker: 'JUST LISTED', headline: '61 Seaton Street', subline: '3 Bed · 3 Bath · Architect-designed · Downtown Toronto', cta: '$1,149,000' },
  { key: 'open-house', label: 'Open House', kicker: 'OPEN HOUSE', headline: 'Sat & Sun · 2–4 PM', subline: '184 Wright Avenue · Roncesvalles', cta: 'Book a private tour' },
  { key: 'sold', label: 'Sold', kicker: 'SOLD', headline: 'Over Asking in 7 Days', subline: 'Another happy family in the GTA', cta: 'Curious what yours is worth?' },
  { key: 'agent', label: 'کارت معرفی میلاد', kicker: 'YOUR GTA REAL ESTATE ADVISOR', headline: 'Milad Momtaz', subline: '20+ years in marketing & sales. AI-powered tools. Personal service.', cta: 'Free AI Home Valuation' },
  { key: 'reel-cover', label: 'کاور ریلز', kicker: 'EPISODE 01', headline: 'What’s my home worth?', subline: '', cta: '' },
  { key: 'tip', label: 'نکته / نقل‌قول', kicker: 'SELLER TIP #3', headline: 'Price it right the first week.', subline: 'Homes priced correctly at launch sell faster and for more than homes that chase the market down.', cta: 'Get your free valuation' },
]

type State = { template: Template; size: SizeKey; kicker: string; headline: string; subline: string; cta: string; bg: BgKey; photo: string }

async function renderPoster(canvas: HTMLCanvasElement, st: State, p: Profile) {
  await ensureFonts()
  const { w, h } = SIZES[st.size]
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  const property = st.photo ? await loadImage(st.photo).catch(() => null) : null
  const me = p.photo ? await loadImage(p.photo).catch(() => null) : null
  const accent = p.brandAccent
  const pad = 72
  const usesPhoto = ['listing', 'open-house', 'sold'].includes(st.template)

  if (usesPhoto && property) drawCover(ctx, property, 0, 0, w, h)
  else paintBackground(ctx, st.bg, w, h, accent)

  switch (st.template) {
    case 'listing':
    case 'open-house':
    case 'sold': {
      const grad = ctx.createLinearGradient(0, h * 0.35, 0, h)
      grad.addColorStop(0, 'rgba(6,12,22,0)')
      grad.addColorStop(0.55, 'rgba(6,12,22,0.75)')
      grad.addColorStop(1, 'rgba(6,12,22,0.95)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)
      // kicker ribbon
      ctx.font = `800 40px ${FONT_SANS}`
      const kw = ctx.measureText(st.kicker).width + 70
      ctx.fillStyle = st.template === 'sold' ? '#b8202f' : accent
      ctx.fillRect(0, pad, kw, 84)
      text(ctx, st.kicker, 35, pad + 20, { size: 40, weight: 800, color: st.template === 'sold' ? '#fff' : '#0b1626', maxWidth: kw })
      const base = h - 170 - 360
      let y = text(ctx, st.headline, pad, base, { size: 84, font: FONT_SERIF, weight: 700, maxWidth: w - pad * 2, maxLines: 2 })
      y = text(ctx, st.subline, pad, y + 16, { size: 34, weight: 500, color: '#dde3ea', maxWidth: w - pad * 2, maxLines: 2 })
      if (st.cta) {
        ctx.font = `800 48px ${FONT_SANS}`
        const cw = ctx.measureText(st.cta).width + 64
        ctx.strokeStyle = accent
        ctx.lineWidth = 3
        roundRect(ctx, pad, y + 26, cw, 86, 12)
        ctx.stroke()
        text(ctx, st.cta, pad + 32, y + 44, { size: 48, weight: 800, color: accent, maxWidth: cw })
      }
      agentStrip(ctx, p, me, h - 170, w)
      break
    }
    case 'agent': {
      const r = Math.min(w, h) * 0.26
      const cy = h * 0.34
      circleImage(ctx, me, w / 2, cy, r, accent)
      let y = text(ctx, st.kicker, w / 2, cy + r + 50, { size: 30, weight: 700, color: accent, maxWidth: w - pad * 2, align: 'center' })
      y = text(ctx, st.headline, w / 2, y + 12, { size: 92, font: FONT_SERIF, weight: 700, maxWidth: w - pad * 2, align: 'center' })
      y = text(ctx, `${p.title} · ${p.brokerage}`, w / 2, y + 6, { size: 30, weight: 600, color: '#cfd6df', maxWidth: w - pad * 2, align: 'center' })
      y = text(ctx, st.subline, w / 2, y + 30, { size: 34, weight: 500, color: '#fff', maxWidth: w - pad * 3, align: 'center', lineHeight: 1.35 })
      text(ctx, p.proof, w / 2, y + 26, { size: 28, weight: 700, color: accent, maxWidth: w - pad * 2, align: 'center' })
      ctx.fillStyle = accent
      roundRect(ctx, w / 2 - 330, h - 250, 660, 100, 50)
      ctx.fill()
      text(ctx, st.cta, w / 2, h - 222, { size: 40, weight: 800, color: '#0b1626', maxWidth: 620, align: 'center' })
      text(ctx, `${p.phone} · ${p.website.replace(/^https?:\/\//, '')}`, w / 2, h - 120, { size: 30, weight: 600, color: '#fff', maxWidth: w - pad * 2, align: 'center' })
      break
    }
    case 'reel-cover': {
      if (me) {
        ctx.save()
        ctx.globalAlpha = 0.95
        drawCover(ctx, me, 0, h * 0.28, w, h * 0.72, 0.2)
        ctx.restore()
        const grad = ctx.createLinearGradient(0, h * 0.28, 0, h * 0.5)
        grad.addColorStop(0, 'rgba(11,22,38,1)')
        grad.addColorStop(1, 'rgba(11,22,38,0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, h * 0.28, w, h * 0.22)
      }
      // Reels grid crops covers to the centre 3:4 — keep text inside it
      const safeTop = (h - w * 4 / 3) / 2 + 60
      text(ctx, st.kicker, w / 2, Math.max(pad, safeTop), { size: 34, weight: 800, color: accent, maxWidth: w - pad * 2, align: 'center' })
      text(ctx, st.headline.toUpperCase(), w / 2, Math.max(pad, safeTop) + 60, { size: 108, weight: 800, color: '#fff', maxWidth: w - pad * 2, align: 'center', lineHeight: 1.02, maxLines: 4 })
      text(ctx, `@${p.instagram}`, w / 2, h - Math.max(pad, safeTop) - 40, { size: 32, weight: 700, color: '#fff', maxWidth: w, align: 'center' })
      break
    }
    case 'tip': {
      ctx.fillStyle = accent
      ctx.fillRect(pad, pad + 20, 120, 10)
      let y = text(ctx, st.kicker, pad, pad + 60, { size: 34, weight: 800, color: accent, maxWidth: w - pad * 2 })
      text(ctx, '“', pad - 10, y + 10, { size: 220, font: FONT_SERIF, weight: 700, color: `${accent}66`, maxWidth: 200 })
      y = text(ctx, st.headline, pad, y + 150, { size: 96, font: FONT_SERIF, weight: 700, maxWidth: w - pad * 2, lineHeight: 1.1 })
      y = text(ctx, st.subline, pad, y + 40, { size: 38, weight: 500, color: '#dfe5ec', maxWidth: w - pad * 2, lineHeight: 1.4 })
      if (st.cta) text(ctx, `→ ${st.cta}`, pad, y + 40, { size: 40, weight: 800, color: accent, maxWidth: w - pad * 2 })
      agentStrip(ctx, p, me, h - 170, w)
      break
    }
  }
}

export default function Posters({ profile }: StudioProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const t0 = TEMPLATES[0]
  const [st, setSt] = useState<State>({ template: t0.key, size: 'post', kicker: t0.kicker, headline: t0.headline, subline: t0.subline, cta: t0.cta, bg: 'navy-gold', photo: '' })
  const [options, setOptions] = useState<{ kicker: string; headline: string; subline: string; cta: string }[]>([])
  const [brief, setBrief] = useState('')
  const ai = useAi(profile)

  useEffect(() => { if (canvasRef.current) renderPoster(canvasRef.current, st, profile) }, [st, profile])

  const pickTemplate = (key: Template) => {
    const t = TEMPLATES.find((x) => x.key === key)!
    setSt({ ...st, template: key, kicker: t.kicker, headline: key === 'agent' ? profile.name : t.headline, subline: t.subline, cta: t.cta, size: key === 'reel-cover' ? 'story' : st.size })
  }

  const suggest = async () => {
    const res = await ai.run<{ options: typeof options }>('poster-copy', { template: st.template, brief, current: { kicker: st.kicker, headline: st.headline, subline: st.subline, cta: st.cta } }, 'English unless the brief is in Farsi')
    if (res?.options) setOptions(res.options)
  }

  const set = <K extends keyof State>(k: K, v: State[K]) => setSt({ ...st, [k]: v })

  return (
    <>
      <Header title="پوستر" subtitle="با عکس، نام، تلفن و بروکریج میلاد — برای پست، استوری و کاور ریلز" actions={
        <button className="btn primary" onClick={() => canvasRef.current && downloadCanvas(canvasRef.current, `milad-${st.template}-${st.size}.png`)}><Download size={16} /> دانلود PNG</button>
      } />
      {!profile.photo && <div className="note">برای پوستر بهتر، در «پروفایل و اتصال‌ها» عکس پرتره‌ی میلاد را آپلود کن.</div>}
      <div className="designer">
        <div className="preview-col"><canvas ref={canvasRef} className="poster-canvas" /></div>
        <div className="controls-col">
          <Card title="قالب">
            <div className="chip-row">{TEMPLATES.map((t) => <button key={t.key} className={`chip btn-chip ${st.template === t.key ? 'active' : ''}`} onClick={() => pickTemplate(t.key)}>{t.label}</button>)}</div>
            <div className="chip-row">{(Object.keys(SIZES) as SizeKey[]).map((k) => <button key={k} className={`chip btn-chip ${st.size === k ? 'active' : ''}`} onClick={() => set('size', k)}>{SIZES[k].label}</button>)}</div>
          </Card>
          <Card title="متن">
            <Field label="بالای تیتر"><input dir="auto" value={st.kicker} onChange={(e) => set('kicker', e.target.value)} /></Field>
            <Field label="تیتر"><input dir="auto" value={st.headline} onChange={(e) => set('headline', e.target.value)} /></Field>
            <Field label="توضیح"><textarea dir="auto" rows={2} value={st.subline} onChange={(e) => set('subline', e.target.value)} /></Field>
            <Field label="قیمت / CTA"><input dir="auto" value={st.cta} onChange={(e) => set('cta', e.target.value)} /></Field>
          </Card>
          <Card title="تصویر و بکگراند">
            <label className="btn ghost"><Upload size={16} /> عکس ملک<input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) set('photo', await readFileAsDataUrl(f)) }} /></label>
            {st.photo && <button className="btn ghost sm" onClick={() => set('photo', '')}>حذف عکس</button>}
            <div className="swatches">{BACKGROUNDS.map((b) => <button key={b.key} className={`swatch bg-${b.key} ${st.bg === b.key ? 'active' : ''}`} onClick={() => set('bg', b.key)}><span>{b.label}</span></button>)}</div>
          </Card>
          <Card title="پیشنهاد متن با هوش مصنوعی" actions={<AiButton busy={ai.busy} progress={ai.progress} onClick={suggest}>پیشنهاد بده</AiButton>}>
            <Field label="بریف"><input dir="auto" value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="مثلاً: کاندو ۲ خوابه، ویو دریاچه، نزدیک Union" /></Field>
            <ErrorNote error={ai.error} />
            {options.map((o, i) => (
              <button key={i} className="option" onClick={() => setSt({ ...st, ...o })}>
                <small>{o.kicker}</small><b dir="auto">{o.headline}</b><span dir="auto">{o.subline}</span><em dir="auto">{o.cta}</em>
              </button>
            ))}
          </Card>
        </div>
      </div>
    </>
  )
}
