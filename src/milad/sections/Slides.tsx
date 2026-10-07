import { useEffect, useRef, useState } from 'react'
import { Download, Plus, Trash2 } from 'lucide-react'
import type { Profile } from '../data'
import { BACKGROUNDS, FONT_SERIF, SIZES, circleImage, downloadCanvas, ensureFonts, loadImage, paintBackground, text, type BgKey, type SizeKey } from '../draw'
import type { StudioProps } from '../StudioApp'
import { AiButton, Card, CopyButton, ErrorNote, Field, Header, LANGS, useAi } from '../ui'

type Slide = { kicker: string; title: string; body: string }

const DEFAULT_DECK: Slide[] = [
  { kicker: 'SELLING IN 2026?', title: 'How I’d sell your home in 5 steps', body: '20+ years in marketing, applied to the biggest sale of your life. Swipe →' },
  { kicker: 'STEP 1', title: 'Price with data, not emotion', body: 'My AI valuation compares every recent sale near you. Then I adjust for what an algorithm can’t see.' },
  { kicker: 'STEP 2', title: 'Fix the small things', body: 'The $3K fixes buyers pay $30K more for — paint, lighting, curb appeal. I’ll tell you which ones matter.' },
  { kicker: 'STEP 3', title: 'Film it like a launch', body: 'Cinematic video, professional photos and Reels — because your buyer is scrolling, not driving by.' },
  { kicker: 'STEP 4', title: 'Target real buyers', body: 'Paid Meta ads to people actively looking in your area, plus my buyer list and listing alerts.' },
  { kicker: 'STEP 5', title: 'Negotiate every dollar', body: 'Offer strategy, multiple-offer handling and clean conditions that protect your price.' },
  { kicker: 'START HERE', title: 'What’s your home worth today?', body: 'Get a free AI valuation in 60 seconds — then I review it personally.' },
]

async function renderSlide(canvas: HTMLCanvasElement, slide: Slide, i: number, total: number, size: SizeKey, bg: BgKey, p: Profile) {
  await ensureFonts()
  const { w, h } = SIZES[size]
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  const me = p.photo ? await loadImage(p.photo).catch(() => null) : null
  const light = bg === 'marble'
  const fg = light ? p.brandPrimary : '#fff'
  const sub = light ? '#3d4a5c' : '#d7dee6'
  const pad = 90
  paintBackground(ctx, bg, w, h, p.brandAccent)
  text(ctx, `${String(i + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, w - pad, pad, { size: 28, weight: 700, color: p.brandAccent, maxWidth: 300, align: 'right' })
  ctx.fillStyle = p.brandAccent
  ctx.fillRect(pad, pad + 10, 90, 8)
  const isCover = i === 0
  const isLast = i === total - 1
  let y = isCover ? h * 0.28 : h * 0.22
  y = text(ctx, slide.kicker, pad, y, { size: 34, weight: 800, color: p.brandAccent, maxWidth: w - pad * 2 })
  y = text(ctx, slide.title, pad, y + 24, { size: isCover ? 104 : 84, font: FONT_SERIF, weight: 700, color: fg, maxWidth: w - pad * 2, lineHeight: 1.08, maxLines: 4 })
  text(ctx, slide.body, pad, y + 40, { size: 40, weight: 500, color: sub, maxWidth: w - pad * 2, lineHeight: 1.4, maxLines: 6 })
  // footer
  circleImage(ctx, me, pad + 40, h - pad - 30, 40, p.brandAccent)
  text(ctx, p.name, pad + 105, h - pad - 58, { size: 28, weight: 700, color: fg, maxWidth: w - 400 })
  text(ctx, `${p.brokerage}`, pad + 105, h - pad - 20, { size: 22, weight: 500, color: sub, maxWidth: w - 400 })
  text(ctx, isLast ? p.website.replace(/^https?:\/\//, '') : 'SWIPE →', w - pad, h - pad - 42, { size: 30, weight: 800, color: p.brandAccent, maxWidth: 500, align: 'right' })
}

function SlideCanvas({ slide, i, total, size, bg, profile }: { slide: Slide; i: number; total: number; size: SizeKey; bg: BgKey; profile: Profile }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => { if (ref.current) renderSlide(ref.current, slide, i, total, size, bg, profile) }, [slide, i, total, size, bg, profile])
  return <canvas ref={ref} className="slide-canvas" data-index={i} />
}

export default function Slides({ profile }: StudioProps) {
  const [slides, setSlides] = useState<Slide[]>(DEFAULT_DECK)
  const [size, setSize] = useState<SizeKey>('post')
  const [bg, setBg] = useState<BgKey>('navy-gold')
  const [topic, setTopic] = useState('')
  const [lang, setLang] = useState(LANGS[1].value)
  const [caption, setCaption] = useState('')
  const ai = useAi(profile)
  const wrap = useRef<HTMLDivElement>(null)

  const generateDeck = async () => {
    const res = await ai.run<{ title: string; slides: Slide[]; caption: string; hashtags: string[] }>('carousel', { topic: topic || 'Pick the highest-converting topic for this agent', format: SIZES[size].label }, lang)
    if (res?.slides?.length) {
      setSlides(res.slides)
      setCaption(`${res.caption}\n\n${(res.hashtags ?? []).join(' ')}`)
    }
  }

  const downloadAll = () => {
    wrap.current?.querySelectorAll<HTMLCanvasElement>('canvas.slide-canvas').forEach((c, i) => {
      setTimeout(() => downloadCanvas(c, `milad-slide-${String(i + 1).padStart(2, '0')}.png`), i * 350)
    })
  }

  const update = (i: number, patch: Partial<Slide>) => setSlides(slides.map((s, j) => (j === i ? { ...s, ...patch } : s)))

  return (
    <>
      <Header title="اسلاید و کاروسل" subtitle="کاروسل آموزشی برای پست اینستاگرام و تبلیغ Carousel در متا" actions={<button className="btn primary" onClick={downloadAll}><Download size={16} /> دانلود همه</button>} />
      <Card title="ساخت با هوش مصنوعی" actions={<AiButton busy={ai.busy} progress={ai.progress} onClick={generateDeck}>بساز</AiButton>}>
        <div className="form-grid four">
          <Field label="موضوع"><input dir="auto" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="مثلاً: ۵ هزینه‌ی پنهان خرید خانه در انتاریو" /></Field>
          <Field label="زبان"><select value={lang} onChange={(e) => setLang(e.target.value)}>{LANGS.map((l) => <option key={l.label} value={l.value}>{l.label}</option>)}</select></Field>
          <Field label="اندازه"><select value={size} onChange={(e) => setSize(e.target.value as SizeKey)}>{(Object.keys(SIZES) as SizeKey[]).map((k) => <option key={k} value={k}>{SIZES[k].label}</option>)}</select></Field>
          <Field label="تم"><select value={bg} onChange={(e) => setBg(e.target.value as BgKey)}>{BACKGROUNDS.map((b) => <option key={b.key} value={b.key}>{b.label}</option>)}</select></Field>
        </div>
        <ErrorNote error={ai.error} />
        {caption && <div className="note"><p className="small" dir="auto">{caption}</p><CopyButton value={caption} label="کپی کپشن" /></div>}
      </Card>
      <div className="slides" ref={wrap}>
        {slides.map((s, i) => (
          <div key={i} className="slide-item">
            <SlideCanvas slide={s} i={i} total={slides.length} size={size} bg={bg} profile={profile} />
            <input dir="auto" value={s.kicker} onChange={(e) => update(i, { kicker: e.target.value })} />
            <input dir="auto" value={s.title} onChange={(e) => update(i, { title: e.target.value })} />
            <textarea dir="auto" rows={3} value={s.body} onChange={(e) => update(i, { body: e.target.value })} />
            <div className="row">
              <button className="btn ghost sm" onClick={(e) => downloadCanvas((e.currentTarget.closest('.slide-item')!.querySelector('canvas'))!, `milad-slide-${i + 1}.png`)}><Download size={14} /></button>
              <button className="btn ghost sm" onClick={() => setSlides(slides.filter((_, j) => j !== i))} disabled={slides.length <= 1}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        <button className="slide-add" onClick={() => setSlides([...slides, { kicker: 'NEXT', title: 'New slide', body: '' }])}><Plus /> اسلاید جدید</button>
      </div>
    </>
  )
}
