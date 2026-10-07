import { useCallback, useEffect, useRef, useState } from 'react'
import { Download, Pause, Play, Upload, Wand2 } from 'lucide-react'
import type { ImageSegmenter } from '@mediapipe/tasks-vision'
import type { Profile, Reel } from '../data'
import { BACKGROUNDS, FONT_SANS, drawCover, ensureFonts, isRtl, loadImage, paintBackground, readFileAsDataUrl, roundRect, text, type BgKey } from '../draw'
import type { StudioProps } from '../StudioApp'
import { AiButton, Card, CopyButton, ErrorNote, Field, Header, LANGS, useAi } from '../ui'

const W = 1080
const H = 1920

type Cue = { start: number; end: number; text: string }
type Overlay = { start: number; end: number; text: string; style: 'hook' | 'stat' | 'cta' | 'lower-third' }
type CaptionStyle = 'pop' | 'box' | 'gold'
type BgMode = BgKey | 'image' | 'blur' | 'original'

type Settings = {
  removeBg: boolean
  bg: BgMode
  personScale: number
  personY: number
  captionStyle: CaptionStyle
  showLowerThird: boolean
  showProgress: boolean
  autoZoom: boolean
  hook: string
  cta: string
}

type EditPlan = { title: string; hook_text: string; captions: Cue[]; overlays: Overlay[]; zoom_points: number[]; background: string; music_mood: string; cta_text: string; caption: string; hashtags: string[]; notes: string }

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.0/wasm'
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite'

let segmenterPromise: Promise<ImageSegmenter> | null = null
function getSegmenter() {
  segmenterPromise ??= import('@mediapipe/tasks-vision').then(async ({ FilesetResolver, ImageSegmenter }) => {
    const fileset = await FilesetResolver.forVisionTasks(WASM_URL)
    return ImageSegmenter.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
      runningMode: 'VIDEO',
      outputCategoryMask: false,
      outputConfidenceMasks: true,
    })
  })
  return segmenterPromise
}

/** Splits a script into 2–4 word caption cues spread across the duration, weighted by word count. */
export function cuesFromScript(script: string, duration: number, wordsPer = 3): Cue[] {
  const words = script.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean)
  if (!words.length || !duration) return []
  const chunks: string[] = []
  for (let i = 0; i < words.length; i += wordsPer) chunks.push(words.slice(i, i + wordsPer).join(' '))
  const lead = Math.min(0.2, duration * 0.02)
  const per = (duration - lead) / words.length
  let t = lead
  return chunks.map((c) => {
    const n = c.split(' ').length
    const cue = { start: +t.toFixed(2), end: +(t + n * per).toFixed(2), text: c }
    t += n * per
    return cue
  })
}

const cuesToText = (cues: Cue[]) => cues.map((c) => `${c.start.toFixed(1)}-${c.end.toFixed(1)} | ${c.text}`).join('\n')
function textToCues(v: string): Cue[] {
  return v.split('\n').map((l) => {
    const m = l.match(/^\s*([\d.]+)\s*-\s*([\d.]+)\s*\|\s*(.+)$/)
    return m ? { start: Number(m[1]), end: Number(m[2]), text: m[3].trim() } : null
  }).filter((c): c is Cue => Boolean(c))
}

function drawCaption(ctx: CanvasRenderingContext2D, cue: Cue, t: number, style: CaptionStyle, accent: string) {
  const size = 78
  ctx.save()
  ctx.font = `800 ${size}px ${FONT_SANS}`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  const rtl = isRtl(cue.text)
  ctx.direction = rtl ? 'rtl' : 'ltr'
  const words = cue.text.split(' ')
  const active = Math.min(words.length - 1, Math.floor(((t - cue.start) / Math.max(0.01, cue.end - cue.start)) * words.length))
  const label = style === 'pop' ? cue.text.toUpperCase() : cue.text
  const width = ctx.measureText(label).width
  const y = H * 0.66
  const pop = 1 + Math.max(0, 0.08 - (t - cue.start) * 0.5)
  ctx.translate(W / 2, y)
  ctx.scale(pop, pop)
  if (style === 'box') {
    ctx.fillStyle = 'rgba(0,0,0,0.72)'
    roundRect(ctx, -width / 2 - 34, -size * 0.75, width + 68, size * 1.5, 22)
    ctx.fill()
  }
  // word-by-word: render each word, highlight the spoken one
  const space = ctx.measureText(' ').width
  const parts = (style === 'pop' ? words.map((w) => w.toUpperCase()) : words)
  const widths = parts.map((w) => ctx.measureText(w).width)
  let x = rtl ? width / 2 : -width / 2
  ctx.textAlign = 'left'
  parts.forEach((w, i) => {
    const wx = rtl ? x - widths[i] : x
    ctx.lineWidth = 14
    ctx.strokeStyle = 'rgba(0,0,0,0.85)'
    ctx.lineJoin = 'round'
    ctx.direction = 'ltr'
    if (style !== 'box') ctx.strokeText(w, wx, 0)
    ctx.fillStyle = i === active ? (style === 'gold' ? '#fff' : style === 'pop' ? '#FFE14D' : accent) : style === 'gold' ? accent : '#fff'
    ctx.fillText(w, wx, 0)
    x = rtl ? x - widths[i] - space : x + widths[i] + space
  })
  ctx.restore()
}

function drawOverlays(ctx: CanvasRenderingContext2D, t: number, duration: number, s: Settings, overlays: Overlay[], p: Profile) {
  const accent = p.brandAccent
  // watermark
  text(ctx, `@${p.instagram}`, W - 60, 120, { size: 30, weight: 700, color: 'rgba(255,255,255,0.75)', maxWidth: 600, align: 'right' })

  const hookEnd = 3
  if (s.hook && t < hookEnd) {
    const a = Math.min(1, t / 0.2)
    ctx.save()
    ctx.globalAlpha = a
    const y = H * 0.17
    const shade = ctx.createLinearGradient(0, y - 120, 0, y + 360)
    shade.addColorStop(0, 'rgba(0,0,0,0)')
    shade.addColorStop(0.4, 'rgba(0,0,0,0.45)')
    shade.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = shade
    ctx.fillRect(0, y - 120, W, 480)
    ctx.fillStyle = accent
    const end = text(ctx, s.hook.toUpperCase(), W / 2, y, { size: 84, weight: 800, color: '#fff', maxWidth: W - 180, align: 'center', lineHeight: 1.08, maxLines: 3 })
    ctx.fillRect(W / 2 - 90, end + 18, 180, 8)
    ctx.restore()
  }

  overlays.filter((o) => t >= o.start && t < o.end && o.style !== 'lower-third').forEach((o) => {
    const y = o.style === 'stat' ? H * 0.3 : H * 0.2
    ctx.save()
    ctx.font = `800 64px ${FONT_SANS}`
    const w = Math.min(W - 140, ctx.measureText(o.text).width + 80)
    ctx.fillStyle = o.style === 'cta' ? accent : 'rgba(10,18,30,0.85)'
    roundRect(ctx, (W - w) / 2, y - 20, w, 120, 26)
    ctx.fill()
    ctx.restore()
    text(ctx, o.text, W / 2, y + 6, { size: 58, weight: 800, color: o.style === 'cta' ? '#0b1626' : '#fff', maxWidth: W - 200, align: 'center', maxLines: 1 })
  })

  if (s.showLowerThird && t > 3.2 && t < 8.5 && !(s.cta && duration && t > duration - 3)) {
    const k = Math.min(1, (t - 3.2) / 0.35, (8.5 - t) / 0.35)
    const x = 60 - (1 - k) * 500
    const y = H * 0.74
    ctx.save()
    ctx.fillStyle = 'rgba(10,18,30,0.88)'
    roundRect(ctx, x, y, 700, 150, 20)
    ctx.fill()
    ctx.fillStyle = accent
    ctx.fillRect(x, y, 10, 150)
    ctx.restore()
    text(ctx, p.name, x + 40, y + 26, { size: 46, weight: 800, color: '#fff', maxWidth: 640 })
    text(ctx, `${p.title} · ${p.brokerage}`, x + 40, y + 88, { size: 26, weight: 600, color: accent, maxWidth: 640 })
  }

  if (s.cta && duration && t > duration - 3) {
    const k = Math.min(1, (t - (duration - 3)) / 0.3)
    ctx.save()
    ctx.globalAlpha = k
    ctx.fillStyle = 'rgba(6,12,22,0.78)'
    ctx.fillRect(0, H * 0.72, W, 330)
    ctx.restore()
    ctx.save()
    ctx.globalAlpha = k
    const end = text(ctx, s.cta, W / 2, H * 0.72 + 50, { size: 56, weight: 800, color: '#fff', maxWidth: W - 160, align: 'center', maxLines: 2 })
    ctx.fillStyle = accent
    roundRect(ctx, W / 2 - 300, end + 20, 600, 90, 45)
    ctx.fill()
    text(ctx, p.website.replace(/^https?:\/\//, ''), W / 2, end + 42, { size: 38, weight: 800, color: '#0b1626', maxWidth: 560, align: 'center' })
    ctx.restore()
  }

  if (s.showProgress && duration) {
    ctx.fillStyle = 'rgba(255,255,255,0.25)'
    ctx.fillRect(0, H - 14, W, 14)
    ctx.fillStyle = accent
    ctx.fillRect(0, H - 14, (W * t) / duration, 14)
  }
}

export default function Atelier({ profile, reel }: StudioProps & { reel: Reel | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const maskCanvas = useRef<HTMLCanvasElement>(document.createElement('canvas'))
  const personCanvas = useRef<HTMLCanvasElement>(document.createElement('canvas'))
  const bgImage = useRef<HTMLImageElement | null>(null)
  const segmenter = useRef<ImageSegmenter | null>(null)
  const audio = useRef<{ ctx: AudioContext; dest: MediaStreamAudioDestinationNode } | null>(null)
  const raf = useRef(0)

  const [videoUrl, setVideoUrl] = useState('')
  const [duration, setDuration] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [segStatus, setSegStatus] = useState('')
  const [exporting, setExporting] = useState(0)
  const [exportUrl, setExportUrl] = useState<{ url: string; ext: string } | null>(null)
  const [script, setScript] = useState('')
  const [cueText, setCueText] = useState('')
  const [overlays, setOverlays] = useState<Overlay[]>([])
  const [zoomPoints, setZoomPoints] = useState<number[]>([])
  const [plan, setPlan] = useState<EditPlan | null>(null)
  const [lang, setLang] = useState(LANGS[0].value)
  const [s, setS] = useState<Settings>({
    removeBg: true, bg: 'navy-gold', personScale: 1, personY: 0, captionStyle: 'pop', showLowerThird: true, showProgress: true, autoZoom: true,
    hook: reel?.thumbnail_text ?? '', cta: reel?.cta ?? '',
  })
  const ai = useAi(profile)
  const settings = useRef(s)
  settings.current = s
  const cues = useRef<Cue[]>([])
  cues.current = textToCues(cueText)
  const ov = useRef(overlays)
  ov.current = overlays
  const zp = useRef(zoomPoints)
  zp.current = zoomPoints

  useEffect(() => {
    if (reel) setScript(reel.scenes.map((x) => (lang.startsWith('Persian') ? x.dialogue_fa : x.dialogue_en)).join(' '))
  }, [reel, lang])

  useEffect(() => { ensureFonts() }, [])

  const render = useCallback(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const st = settings.current
    const t = video?.currentTime ?? 0
    const dur = video?.duration || 0
    const ready = video && video.readyState >= 2

    // background
    if (st.bg === 'image' && bgImage.current) drawCover(ctx, bgImage.current, 0, 0, W, H)
    else if ((st.bg === 'blur' || st.bg === 'original') && ready) {
      ctx.save()
      if (st.bg === 'blur') ctx.filter = 'blur(28px) brightness(0.7)'
      drawCover(ctx, video, -40, -40, W + 80, H + 80)
      ctx.restore()
    } else paintBackground(ctx, (BACKGROUNDS.some((b) => b.key === st.bg) ? st.bg : 'navy-gold') as BgKey, W, H, profile.brandAccent, t)

    if (ready) {
      // punch-in zoom: alternate 1.0 / 1.12 at zoom points (or every 4s when auto)
      const points = zp.current.length ? zp.current : st.autoZoom ? Array.from({ length: Math.floor(dur / 4) }, (_, i) => (i + 1) * 4) : []
      const idx = points.filter((p) => p <= t).length
      const zoom = st.personScale * (idx % 2 === 1 ? 1.12 : 1)
      const vw = video.videoWidth
      const vh = video.videoHeight
      const useMask = st.removeBg && st.bg !== 'original' && segmenter.current
      let source: CanvasImageSource = video
      if (useMask) {
        try {
          const result = segmenter.current!.segmentForVideo(video, performance.now())
          const mask = result.confidenceMasks?.[0]
          if (mask) {
            const mc = maskCanvas.current
            mc.width = mask.width
            mc.height = mask.height
            const data = mask.getAsFloat32Array()
            const img = new ImageData(mask.width, mask.height)
            for (let i = 0; i < data.length; i++) {
              const v = Math.min(1, Math.max(0, (data[i] - 0.35) / 0.4)) // soften edges
              img.data[i * 4 + 3] = v * 255
            }
            mc.getContext('2d')!.putImageData(img, 0, 0)
            const pc = personCanvas.current
            pc.width = vw
            pc.height = vh
            const pctx = pc.getContext('2d')!
            pctx.drawImage(video, 0, 0, vw, vh)
            pctx.globalCompositeOperation = 'destination-in'
            pctx.filter = 'blur(2px)'
            pctx.drawImage(mc, 0, 0, vw, vh)
            pctx.filter = 'none'
            pctx.globalCompositeOperation = 'source-over'
            source = pc
          }
          result.close()
        } catch { /* fall back to raw video for this frame */ }
      }
      const scale = Math.max(W / vw, H / vh) * zoom
      const dw = vw * scale
      const dh = vh * scale
      ctx.drawImage(source, (W - dw) / 2, (H - dh) / 2 + st.personY * H, dw, dh)
      const cue = cues.current.find((c) => t >= c.start && t < c.end)
      if (cue) drawCaption(ctx, cue, t, st.captionStyle, profile.brandAccent)
    } else {
      text(ctx, 'ویدیوی خودت را آپلود کن', W / 2, H * 0.45, { size: 64, weight: 800, maxWidth: W - 120, align: 'center' })
      text(ctx, 'Upload your talking video', W / 2, H * 0.45 + 100, { size: 40, weight: 600, color: '#c8cfd8', maxWidth: W - 120, align: 'center' })
    }
    drawOverlays(ctx, t, dur, st, ov.current, profile)
  }, [profile])

  // render loop while playing; single redraw when settings change
  useEffect(() => {
    const loop = () => {
      render()
      if (videoRef.current && !videoRef.current.paused) raf.current = requestAnimationFrame(loop)
    }
    if (playing) raf.current = requestAnimationFrame(loop)
    else render()
    return () => cancelAnimationFrame(raf.current)
  }, [playing, render, s, cueText, overlays, videoUrl])

  useEffect(() => {
    if (!s.removeBg || segmenter.current) return
    setSegStatus('در حال بارگذاری مدل حذف بکگراند…')
    getSegmenter().then((seg) => { segmenter.current = seg; setSegStatus(''); render() }).catch(() => setSegStatus('مدل حذف بکگراند بارگذاری نشد (اتصال اینترنت؟). ویدیو بدون حذف بکگراند نمایش داده می‌شود.'))
  }, [s.removeBg, render])

  const onVideo = (file?: File) => {
    if (!file) return
    setExportUrl(null)
    setVideoUrl(URL.createObjectURL(file))
  }

  const onBgImage = async (file?: File) => {
    if (!file) return
    bgImage.current = await loadImage(await readFileAsDataUrl(file))
    setS({ ...s, bg: 'image' })
  }

  const autoCaptions = () => setCueText(cuesToText(cuesFromScript(script, duration || reel?.length_sec || 20)))

  const ensureAudio = () => {
    const video = videoRef.current!
    if (!audio.current) {
      const ctx = new AudioContext()
      const src = ctx.createMediaElementSource(video)
      const dest = ctx.createMediaStreamDestination()
      src.connect(dest)
      src.connect(ctx.destination)
      audio.current = { ctx, dest }
    }
    return audio.current
  }

  const togglePlay = async () => {
    const v = videoRef.current
    if (!v || !videoUrl) return
    ensureAudio().ctx.resume()
    if (v.paused) { await v.play(); setPlaying(true) } else { v.pause(); setPlaying(false) }
  }

  const exportVideo = async () => {
    const v = videoRef.current
    const canvas = canvasRef.current
    if (!v || !canvas || !videoUrl) return
    const { ctx, dest } = ensureAudio()
    await ctx.resume()
    v.pause()
    v.currentTime = 0
    await new Promise((r) => v.addEventListener('seeked', r, { once: true }))
    const stream = canvas.captureStream(30)
    dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t))
    const types = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm']
    const mimeType = types.find((t) => MediaRecorder.isTypeSupported(t)) ?? ''
    const rec = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 12_000_000 })
    const chunks: Blob[] = []
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data)
    const done = new Promise<void>((r) => { rec.onstop = () => r() })
    const tick = () => setExporting(Math.max(1, Math.round((v.currentTime / (v.duration || 1)) * 100)))
    v.addEventListener('timeupdate', tick)
    rec.start(500)
    setExporting(1)
    await v.play()
    setPlaying(true)
    await new Promise((r) => v.addEventListener('ended', r, { once: true }))
    rec.stop()
    await done
    v.removeEventListener('timeupdate', tick)
    setPlaying(false)
    setExporting(0)
    const blob = new Blob(chunks, { type: mimeType || 'video/webm' })
    setExportUrl({ url: URL.createObjectURL(blob), ext: mimeType.includes('mp4') ? 'mp4' : 'webm' })
  }

  const aiPlan = async () => {
    const res = await ai.run<EditPlan>('edit-plan', {
      duration_sec: duration || reel?.length_sec || 25,
      transcript_or_script: script,
      reel_concept: reel ? { title: reel.title, hook: reel.hook_line_en, cta: reel.cta, feature: reel.feature } : null,
    }, lang)
    if (!res) return
    setPlan(res)
    if (res.captions?.length) setCueText(cuesToText(res.captions))
    setOverlays((res.overlays ?? []).filter((o) => o.style !== 'hook'))
    setZoomPoints(res.zoom_points ?? [])
    const bgKey = BACKGROUNDS.find((b) => res.background?.toLowerCase().includes(b.key.split('-')[0]))?.key
    setS((prev) => ({ ...prev, hook: res.hook_text || prev.hook, cta: res.cta_text || prev.cta, bg: bgKey ?? prev.bg }))
  }

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS({ ...s, [k]: v })

  return (
    <>
      <Header title="آتلیه ویدیو" subtitle="ویدیوی ایستاده‌ات را آپلود کن؛ بکگراند حذف و جایگزین، زیرنویس کلمه‌به‌کلمه، هوک، معرفی، CTA و خروجی ۹:۱۶" />
      <div className="atelier">
        <div className="preview-col">
          <canvas ref={canvasRef} width={W} height={H} className="preview-canvas" />
          <video
            ref={videoRef}
            src={videoUrl || undefined}
            playsInline
            className="hidden-video"
            onLoadedMetadata={(e) => { setDuration(e.currentTarget.duration); render() }}
            onLoadedData={render}
            onSeeked={render}
            onEnded={() => setPlaying(false)}
          />
          <div className="row center">
            <label className="btn ghost"><Upload size={16} /> آپلود ویدیو<input type="file" accept="video/*" hidden onChange={(e) => onVideo(e.target.files?.[0])} /></label>
            <button className="btn ghost" onClick={togglePlay} disabled={!videoUrl || exporting > 0}>{playing ? <Pause size={16} /> : <Play size={16} />}</button>
            <button className="btn primary" onClick={exportVideo} disabled={!videoUrl || exporting > 0}><Download size={16} /> {exporting ? `در حال خروجی ${exporting}%` : 'خروجی ویدیو'}</button>
          </div>
          {videoUrl && <input type="range" min={0} max={duration || 1} step={0.05} defaultValue={0} onChange={(e) => { if (videoRef.current) videoRef.current.currentTime = Number(e.target.value) }} className="scrub" />}
          {segStatus && <div className="note small">{segStatus}</div>}
          {exportUrl && (
            <div className="note">
              ویدیو آماده است. <a className="btn primary sm" href={exportUrl.url} download={`milad-reel.${exportUrl.ext}`}>دانلود .{exportUrl.ext}</a>
              {exportUrl.ext === 'webm' && <small className="muted"> (مرورگر شما mp4 ضبط نمی‌کند؛ اینستاگرام webm را از دسکتاپ می‌پذیرد، یا در Chrome/Safari جدید خروجی mp4 بگیرید)</small>}
            </div>
          )}
          <p className="muted small">خروجی در زمان واقعی ضبط می‌شود (ویدیوی ۳۰ ثانیه‌ای ≈ ۳۰ ثانیه). تب را در طول خروجی باز نگه دار.</p>
        </div>

        <div className="controls-col">
          <Card title="بکگراند">
            <label className="toggle"><input type="checkbox" checked={s.removeBg} onChange={(e) => set('removeBg', e.target.checked)} /> حذف بکگراند با هوش مصنوعی</label>
            <div className="swatches">
              {BACKGROUNDS.map((b) => <button key={b.key} className={`swatch bg-${b.key} ${s.bg === b.key ? 'active' : ''}`} onClick={() => set('bg', b.key)} title={b.label}><span>{b.label}</span></button>)}
              <button className={`swatch ${s.bg === 'blur' ? 'active' : ''}`} onClick={() => set('bg', 'blur')}><span>محو ویدیو</span></button>
              <button className={`swatch ${s.bg === 'original' ? 'active' : ''}`} onClick={() => set('bg', 'original')}><span>بکگراند اصلی</span></button>
              <label className={`swatch ${s.bg === 'image' ? 'active' : ''}`}><span>عکس دلخواه / لیستینگ</span><input type="file" accept="image/*" hidden onChange={(e) => onBgImage(e.target.files?.[0])} /></label>
            </div>
            <div className="form-grid">
              <Field label={`اندازه‌ی سوژه ${Math.round(s.personScale * 100)}%`}><input type="range" min={0.6} max={1.4} step={0.01} value={s.personScale} onChange={(e) => set('personScale', Number(e.target.value))} /></Field>
              <Field label="جابه‌جایی عمودی"><input type="range" min={-0.3} max={0.3} step={0.01} value={s.personY} onChange={(e) => set('personY', Number(e.target.value))} /></Field>
            </div>
          </Card>

          <Card title="متن و زیرنویس" actions={<AiButton busy={ai.busy} progress={ai.progress} onClick={aiPlan}>سناریوی ادیت با AI</AiButton>}>
            {reel && <p className="small muted">سناریو از ریلز «{reel.title}»</p>}
            <Field label="هوک (۳ ثانیه‌ی اول)"><input dir="auto" value={s.hook} onChange={(e) => set('hook', e.target.value)} /></Field>
            <Field label="CTA (۳ ثانیه‌ی آخر)"><input dir="auto" value={s.cta} onChange={(e) => set('cta', e.target.value)} /></Field>
            <Field label="متن صحبت / اسکریپت" hint="هر چه در ویدیو گفتی اینجا بنویس (یا از ریلز بیاید)؛ زیرنویس زمان‌بندی‌شده از آن ساخته می‌شود.">
              <textarea rows={4} dir="auto" value={script} onChange={(e) => setScript(e.target.value)} />
            </Field>
            <div className="row">
              <select value={lang} onChange={(e) => setLang(e.target.value)}>{LANGS.map((l) => <option key={l.label} value={l.value}>{l.label}</option>)}</select>
              <button className="btn ghost sm" onClick={autoCaptions} disabled={!script}><Wand2 size={14} /> ساخت زیرنویس از اسکریپت</button>
            </div>
            <Field label="زیرنویس‌ها (شروع-پایان | متن)" hint="قابل ویرایش؛ ثانیه‌ها را برای هماهنگی دقیق با صدا جابه‌جا کن.">
              <textarea rows={6} dir="ltr" className="mono" value={cueText} onChange={(e) => setCueText(e.target.value)} />
            </Field>
            <div className="form-grid">
              <Field label="سبک زیرنویس"><select value={s.captionStyle} onChange={(e) => set('captionStyle', e.target.value as CaptionStyle)}><option value="pop">درشت با هایلایت زرد</option><option value="box">جعبه‌ی تیره</option><option value="gold">طلایی برند</option></select></Field>
            </div>
            <label className="toggle"><input type="checkbox" checked={s.showLowerThird} onChange={(e) => set('showLowerThird', e.target.checked)} /> معرفی نام و بروکریج (ثانیه ۳ تا ۸)</label>
            <label className="toggle"><input type="checkbox" checked={s.autoZoom} onChange={(e) => set('autoZoom', e.target.checked)} /> زوم‌های ریتمیک (Punch-in)</label>
            <label className="toggle"><input type="checkbox" checked={s.showProgress} onChange={(e) => set('showProgress', e.target.checked)} /> نوار پیشرفت</label>
            <ErrorNote error={ai.error} />
          </Card>

          {plan && (
            <Card title="سناریوی ادیت" actions={<CopyButton value={`${plan.caption}\n\n${plan.hashtags.join(' ')}`} label="کپی کپشن" />}>
              <p className="small" dir="auto"><b>{plan.title}</b></p>
              <p className="small" dir="auto">{plan.caption}</p>
              <p className="small muted" dir="auto">{plan.hashtags.join(' ')}</p>
              <p className="small">🎵 {plan.music_mood}</p>
              <p className="small muted" dir="auto">{plan.notes}</p>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
