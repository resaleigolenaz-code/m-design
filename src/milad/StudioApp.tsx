import { useEffect, useState } from 'react'
import { Clapperboard, Film, Gauge, Image as ImageIcon, LayoutGrid, LogOut, Megaphone, UserRound } from 'lucide-react'
import { getToken, login, setToken } from './api'
import { DEFAULT_PROFILE, type Profile, type Reel } from './data'
import Dashboard from './sections/Dashboard'
import Reels from './sections/Reels'
import Campaign from './sections/Campaign'
import Atelier from './sections/Atelier'
import Posters from './sections/Posters'
import Slides from './sections/Slides'
import ProfileSettings from './sections/ProfileSettings'

const PROFILE_KEY = 'mm-studio-profile'

export type SectionKey = 'dashboard' | 'reels' | 'campaign' | 'atelier' | 'posters' | 'slides' | 'profile'

const NAV: { key: SectionKey; label: string; icon: typeof Gauge }[] = [
  { key: 'dashboard', label: 'داشبورد', icon: Gauge },
  { key: 'reels', label: 'ایده و سناریوی ریلز', icon: Clapperboard },
  { key: 'campaign', label: 'کمپین متا', icon: Megaphone },
  { key: 'atelier', label: 'آتلیه ویدیو', icon: Film },
  { key: 'posters', label: 'پوستر', icon: ImageIcon },
  { key: 'slides', label: 'اسلاید و کاروسل', icon: LayoutGrid },
  { key: 'profile', label: 'پروفایل و اتصال‌ها', icon: UserRound },
]

function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (raw) return { ...DEFAULT_PROFILE, ...(JSON.parse(raw) as Partial<Profile>) }
  } catch { /* ignore */ }
  return DEFAULT_PROFILE
}

export type StudioProps = {
  profile: Profile
  setProfile: (p: Profile) => void
  go: (s: SectionKey) => void
  sendToAtelier: (reel: Reel) => void
}

function Login({ onDone }: { onDone: () => void }) {
  const [username, setUsername] = useState('milad')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(username, password)
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login">
      <form className="login-card" onSubmit={submit}>
        <div className="brand-mark">MM</div>
        <h1>Milad Studio</h1>
        <p className="muted">استودیوی محتوا، ویدیو و کمپین تبلیغاتی میلاد ممتاز</p>
        <label>
          نام کاربری
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" dir="ltr" />
        </label>
        <label>
          رمز عبور
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" dir="ltr" autoFocus />
        </label>
        {error && <div className="error">{error}</div>}
        <button className="btn primary" disabled={busy || !password}>{busy ? 'در حال ورود…' : 'ورود به استودیو'}</button>
      </form>
    </div>
  )
}

export default function StudioApp() {
  const [authed, setAuthed] = useState(() => Boolean(getToken()))
  const [section, setSection] = useState<SectionKey>('dashboard')
  const [profile, setProfileState] = useState<Profile>(loadProfile)
  const [atelierReel, setAtelierReel] = useState<Reel | null>(null)

  const setProfile = (p: Profile) => {
    setProfileState(p)
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)) } catch { /* quota or private mode */ }
  }

  useEffect(() => {
    const onLogout = () => setAuthed(false)
    window.addEventListener('mm-logout', onLogout)
    return () => window.removeEventListener('mm-logout', onLogout)
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', profile.brandAccent)
  }, [profile.brandAccent])

  if (!authed) return <Login onDone={() => setAuthed(true)} />

  const props: StudioProps = {
    profile,
    setProfile,
    go: setSection,
    sendToAtelier: (reel) => { setAtelierReel(reel); setSection('atelier') },
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="side-brand">
          {profile.photo ? <img src={profile.photo} alt="" /> : <div className="brand-mark small">MM</div>}
          <div>
            <strong>{profile.nameFa}</strong>
            <span>@{profile.instagram}</span>
          </div>
        </div>
        <nav>
          {NAV.map(({ key, label, icon: Icon }) => (
            <button key={key} className={section === key ? 'active' : ''} onClick={() => setSection(key)}>
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <button className="logout" onClick={() => { setToken(null); setAuthed(false) }}>
          <LogOut size={16} /> خروج
        </button>
      </aside>
      <main className="content">
        {section === 'dashboard' && <Dashboard {...props} />}
        {section === 'reels' && <Reels {...props} />}
        {section === 'campaign' && <Campaign {...props} />}
        {section === 'atelier' && <Atelier {...props} reel={atelierReel} />}
        {section === 'posters' && <Posters {...props} />}
        {section === 'slides' && <Slides {...props} />}
        {section === 'profile' && <ProfileSettings {...props} />}
      </main>
    </div>
  )
}
