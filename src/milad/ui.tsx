import { useState, type ReactNode } from 'react'
import { Check, Copy, Loader2, Sparkles } from 'lucide-react'
import { generate, type AiTask } from './api'
import type { Profile } from './data'

export function Header({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <header className="page-head">
      <div>
        <h2>{title}</h2>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {actions && <div className="row">{actions}</div>}
    </header>
  )
}

export function Card({ title, children, actions, className = '' }: { title?: ReactNode; children: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <div className="card-head">
          {title && <h3>{title}</h3>}
          {actions && <div className="row">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

export function CopyButton({ value, label = 'کپی' }: { value: string; label?: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      className="btn ghost sm"
      onClick={() => {
        navigator.clipboard.writeText(value).then(() => {
          setDone(true)
          setTimeout(() => setDone(false), 1400)
        }).catch(() => undefined)
      }}
    >
      {done ? <Check size={14} /> : <Copy size={14} />} {done ? 'کپی شد' : label}
    </button>
  )
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small className="muted">{hint}</small>}
    </label>
  )
}

/** Wraps a streamed Claude call with busy / progress / error state. */
export function useAi(profile: Profile) {
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  async function run<T>(task: AiTask, input: unknown, language?: string): Promise<T | null> {
    setBusy(true)
    setError('')
    setProgress(0)
    try {
      return await generate<T>(task, input, profile, setProgress, language)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      return null
    } finally {
      setBusy(false)
    }
  }
  return { busy, progress, error, run }
}

export function AiButton({ busy, progress, onClick, children, disabled }: { busy: boolean; progress: number; onClick: () => void; children: ReactNode; disabled?: boolean }) {
  return (
    <button className="btn primary" onClick={onClick} disabled={busy || disabled}>
      {busy ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
      {busy ? `در حال ساخت… ${progress ? `${Math.round(progress / 100) / 10}k` : ''}` : children}
    </button>
  )
}

export function ErrorNote({ error }: { error: string }) {
  if (!error) return null
  return <div className="error">{error}</div>
}

export const LANGS = [
  { value: 'English ad copy; include Persian (Farsi) dialogue lines where the schema asks for them', label: 'انگلیسی + فارسی' },
  { value: 'English only', label: 'فقط انگلیسی' },
  { value: 'Persian (Farsi) for everything the viewer reads or hears; keep the schema keys in English', label: 'فقط فارسی' },
]

export function download(name: string, content: string, type = 'text/plain') {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([content], { type }))
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}
