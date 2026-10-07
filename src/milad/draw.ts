import type { Profile } from './data'

export const SIZES = {
  post: { w: 1080, h: 1350, label: 'پست ۴:۵' },
  story: { w: 1080, h: 1920, label: 'استوری / ریلز ۹:۱۶' },
  square: { w: 1080, h: 1080, label: 'مربع ۱:۱' },
} as const
export type SizeKey = keyof typeof SIZES

const RTL = /[؀-ۿ]/
export const isRtl = (s: string) => RTL.test(s)

export const FONT_SERIF = '"Playfair Display", "Vazirmatn", serif'
export const FONT_SANS = '"Montserrat", "Vazirmatn", sans-serif'

export async function ensureFonts() {
  await Promise.all([
    document.fonts.load('700 40px "Playfair Display"'),
    document.fonts.load('600 40px "Montserrat"'),
    document.fonts.load('800 40px "Montserrat"'),
    document.fonts.load('700 40px "Vazirmatn"'),
  ]).catch(() => undefined)
}

const imageCache = new Map<string, Promise<HTMLImageElement>>()
export function loadImage(src: string): Promise<HTMLImageElement> {
  if (!imageCache.has(src)) {
    imageCache.set(src, new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    }))
  }
  return imageCache.get(src)!
}

export function drawCover(ctx: CanvasRenderingContext2D, img: CanvasImageSource & { width: number; height: number }, x: number, y: number, w: number, h: number, focusY = 0.5) {
  const iw = (img as HTMLVideoElement).videoWidth || img.width
  const ih = (img as HTMLVideoElement).videoHeight || img.height
  const scale = Math.max(w / iw, h / ih)
  const sw = w / scale
  const sh = h / scale
  ctx.drawImage(img, (iw - sw) / 2, (ih - sh) * focusY, sw, sh, x, y, w, h)
}

export function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  for (const para of text.split('\n')) {
    let line = ''
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const test = line ? `${line} ${word}` : word
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line)
        line = word
      } else line = test
    }
    lines.push(line)
  }
  return lines
}

/** Draws wrapped text; returns the y after the last line. */
export function text(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, opts: { size: number; font?: string; weight?: number; color?: string; maxWidth: number; lineHeight?: number; align?: CanvasTextAlign; maxLines?: number }) {
  if (!value) return y
  ctx.save()
  ctx.font = `${opts.weight ?? 600} ${opts.size}px ${opts.font ?? FONT_SANS}`
  ctx.fillStyle = opts.color ?? '#fff'
  ctx.direction = isRtl(value) ? 'rtl' : 'ltr'
  ctx.textAlign = opts.align ?? 'left'
  ctx.textBaseline = 'top'
  const lines = wrapLines(ctx, value, opts.maxWidth).slice(0, opts.maxLines ?? 99)
  const lh = opts.size * (opts.lineHeight ?? 1.18)
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lh))
  ctx.restore()
  return y + lines.length * lh
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

export function circleImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, cx: number, cy: number, r: number, ring: string) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r + 6, 0, Math.PI * 2)
  ctx.fillStyle = ring
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.clip()
  if (img) drawCover(ctx, img, cx - r, cy - r, r * 2, r * 2, 0.25)
  else {
    ctx.fillStyle = '#2a3647'
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2)
  }
  ctx.restore()
}

/** Name / phone / brokerage strip used on every design (brokerage is required by RECO). */
export function agentStrip(ctx: CanvasRenderingContext2D, p: Profile, photo: HTMLImageElement | null, y: number, w: number, dark = true) {
  const pad = 64
  const h = 170
  ctx.save()
  ctx.fillStyle = dark ? 'rgba(10,18,30,0.86)' : 'rgba(255,255,255,0.92)'
  ctx.fillRect(0, y, w, h)
  ctx.fillStyle = p.brandAccent
  ctx.fillRect(0, y, w, 4)
  ctx.restore()
  circleImage(ctx, photo, pad + 55, y + h / 2, 55, p.brandAccent)
  const fg = dark ? '#fff' : p.brandPrimary
  const tx = pad + 140
  text(ctx, p.name.toUpperCase(), tx, y + 36, { size: 34, weight: 700, color: fg, maxWidth: w - tx - pad, font: FONT_SANS })
  text(ctx, `${p.title} · ${p.phone}`, tx, y + 82, { size: 24, weight: 500, color: dark ? '#cfd6df' : '#3d4a5c', maxWidth: w - tx - pad })
  text(ctx, `${p.brokerage} · ${p.website.replace(/^https?:\/\//, '')}`, tx, y + 118, { size: 20, weight: 500, color: p.brandAccent, maxWidth: w - tx - pad })
}

export function downloadCanvas(canvas: HTMLCanvasElement, name: string) {
  canvas.toBlob((blob) => {
    if (!blob) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = name
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 2000)
  }, 'image/png')
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

/** Downscale an uploaded photo so it fits comfortably in localStorage. */
export async function shrinkImage(dataUrl: string, max = 900): Promise<string> {
  const img = await loadImage(dataUrl)
  const scale = Math.min(1, max / Math.max(img.width, img.height))
  const c = document.createElement('canvas')
  c.width = Math.round(img.width * scale)
  c.height = Math.round(img.height * scale)
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
  return c.toDataURL('image/jpeg', 0.86)
}

// ---------- Backgrounds shared by posters, slides and the video atelier ----------
export type BgKey = 'navy-gold' | 'night-city' | 'marble' | 'sunset' | 'emerald' | 'studio-grey' | 'blueprint'

export const BACKGROUNDS: { key: BgKey; label: string }[] = [
  { key: 'navy-gold', label: 'سرمه‌ای و طلایی' },
  { key: 'night-city', label: 'شب شهر (بوکه)' },
  { key: 'marble', label: 'مرمر روشن' },
  { key: 'sunset', label: 'غروب گرم' },
  { key: 'emerald', label: 'زمردی لوکس' },
  { key: 'studio-grey', label: 'استودیو خاکستری' },
  { key: 'blueprint', label: 'نقشه‌ی معماری' },
]

function seeded(seed: number) {
  let s = seed
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

/** Procedural backgrounds — t (seconds) animates subtle motion for video. */
export function paintBackground(ctx: CanvasRenderingContext2D, key: BgKey, w: number, h: number, accent: string, t = 0) {
  const g = (stops: [number, string][], x0 = 0, y0 = 0, x1 = 0, y1 = h) => {
    const grad = ctx.createLinearGradient(x0, y0, x1, y1)
    stops.forEach(([o, c]) => grad.addColorStop(o, c))
    return grad
  }
  ctx.save()
  switch (key) {
    case 'navy-gold': {
      ctx.fillStyle = g([[0, '#0b1626'], [1, '#13243b']])
      ctx.fillRect(0, 0, w, h)
      const rg = ctx.createRadialGradient(w * 0.75, h * 0.2, 10, w * 0.75, h * 0.2, w)
      rg.addColorStop(0, `${accent}55`)
      rg.addColorStop(1, 'transparent')
      ctx.fillStyle = rg
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = `${accent}40`
      ctx.lineWidth = 2
      for (let i = 0; i < 6; i++) {
        ctx.beginPath()
        ctx.arc(w * 0.85, h * 0.12, 120 + i * 90 + Math.sin(t * 0.6 + i) * 6, 0, Math.PI * 2)
        ctx.stroke()
      }
      break
    }
    case 'night-city': {
      ctx.fillStyle = g([[0, '#050914'], [0.6, '#101a33'], [1, '#2b1b3d']])
      ctx.fillRect(0, 0, w, h)
      const rnd = seeded(7)
      for (let i = 0; i < 70; i++) {
        const x = rnd() * w
        const y = h * 0.25 + rnd() * h * 0.6
        const r = 8 + rnd() * 50
        const hue = rnd() > 0.5 ? '255,196,120' : '120,170,255'
        const a = 0.08 + 0.25 * Math.abs(Math.sin(t * 0.8 + i))
        const rg = ctx.createRadialGradient(x, y, 0, x, y, r)
        rg.addColorStop(0, `rgba(${hue},${a})`)
        rg.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = rg
        ctx.fillRect(x - r, y - r, r * 2, r * 2)
      }
      // skyline silhouette
      ctx.fillStyle = 'rgba(5,8,18,0.85)'
      const rs = seeded(3)
      let x = 0
      while (x < w) {
        const bw = 40 + rs() * 90
        const bh = h * (0.12 + rs() * 0.22)
        ctx.fillRect(x, h - bh, bw, bh)
        x += bw + 4
      }
      ctx.fillRect(w * 0.62, h * 0.42, 14, h * 0.58) // tower
      ctx.beginPath()
      ctx.ellipse(w * 0.62 + 7, h * 0.6, 34, 16, 0, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'marble': {
      ctx.fillStyle = g([[0, '#f6f3ee'], [1, '#e7e1d8']])
      ctx.fillRect(0, 0, w, h)
      const rnd = seeded(11)
      ctx.strokeStyle = 'rgba(120,110,95,0.12)'
      for (let i = 0; i < 18; i++) {
        ctx.lineWidth = 1 + rnd() * 3
        ctx.beginPath()
        let px = rnd() * w
        let py = 0
        ctx.moveTo(px, py)
        while (py < h) {
          px += (rnd() - 0.5) * 120
          py += 60 + rnd() * 80
          ctx.lineTo(px, py)
        }
        ctx.stroke()
      }
      break
    }
    case 'sunset': {
      ctx.fillStyle = g([[0, '#1d1a3a'], [0.45, '#b4505a'], [1, '#f2a65a']])
      ctx.fillRect(0, 0, w, h)
      const rg = ctx.createRadialGradient(w / 2, h * 0.7, 10, w / 2, h * 0.7, w * 0.6)
      rg.addColorStop(0, 'rgba(255,220,150,0.55)')
      rg.addColorStop(1, 'transparent')
      ctx.fillStyle = rg
      ctx.fillRect(0, 0, w, h)
      break
    }
    case 'emerald': {
      ctx.fillStyle = g([[0, '#04261f'], [1, '#0c4a3c']])
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = `${accent}55`
      ctx.lineWidth = 3
      for (let i = -h; i < w; i += 140) {
        ctx.beginPath()
        ctx.moveTo(i + ((t * 20) % 140), 0)
        ctx.lineTo(i + h + ((t * 20) % 140), h)
        ctx.stroke()
      }
      break
    }
    case 'studio-grey': {
      const rg = ctx.createRadialGradient(w / 2, h * 0.4, 50, w / 2, h * 0.45, h * 0.8)
      rg.addColorStop(0, '#6c727c')
      rg.addColorStop(1, '#1d2026')
      ctx.fillStyle = rg
      ctx.fillRect(0, 0, w, h)
      break
    }
    case 'blueprint': {
      ctx.fillStyle = '#0f3d6e'
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.lineWidth = 1
      for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }
      for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'
      ctx.lineWidth = 3
      ctx.strokeRect(w * 0.12, h * 0.55, w * 0.76, h * 0.3)
      ctx.beginPath()
      ctx.moveTo(w * 0.12, h * 0.55); ctx.lineTo(w * 0.5, h * 0.4); ctx.lineTo(w * 0.88, h * 0.55)
      ctx.moveTo(w * 0.45, h * 0.85); ctx.lineTo(w * 0.45, h * 0.7); ctx.lineTo(w * 0.55, h * 0.7); ctx.lineTo(w * 0.55, h * 0.85)
      ctx.stroke()
      break
    }
  }
  ctx.restore()
}
