import { useState } from 'react'
import { Plus, Trash2, Upload } from 'lucide-react'
import { DEFAULT_PROFILE, type Profile, type WebsiteFeature } from '../data'
import { readFileAsDataUrl, shrinkImage } from '../draw'
import type { StudioProps } from '../StudioApp'
import { Card, Field, Header } from '../ui'

const TEXT_FIELDS: { key: keyof Profile; label: string; ltr?: boolean; area?: boolean }[] = [
  { key: 'name', label: 'نام (انگلیسی)', ltr: true },
  { key: 'nameFa', label: 'نام (فارسی)' },
  { key: 'title', label: 'عنوان', ltr: true },
  { key: 'brokerage', label: 'بروکریج (الزامی در همه‌ی تبلیغات)', ltr: true },
  { key: 'phone', label: 'تلفن', ltr: true },
  { key: 'email', label: 'ایمیل', ltr: true },
  { key: 'website', label: 'وبسایت', ltr: true },
  { key: 'instagram', label: 'آیدی اینستاگرام', ltr: true },
  { key: 'office', label: 'آدرس دفتر', ltr: true },
  { key: 'areas', label: 'مناطق فعالیت', ltr: true },
  { key: 'languages', label: 'زبان‌ها', ltr: true },
  { key: 'proof', label: 'افتخارات / اعتبار', ltr: true },
  { key: 'bio', label: 'بیوگرافی کوتاه', ltr: true, area: true },
]

const ENV_VARS = [
  ['STUDIO_PASSWORD', 'رمز ورود میلاد به استودیو'],
  ['STUDIO_USERNAME', 'نام کاربری (پیش‌فرض milad)'],
  ['STUDIO_SECRET', 'یک رشته‌ی تصادفی طولانی برای امضای نشست‌ها'],
  ['ANTHROPIC_API_KEY', 'کلید API هوش مصنوعی Claude (برای همه‌ی تولیدهای هوشمند)'],
  ['META_ACCESS_TOKEN', 'توکن System User در Meta Business با دسترسی ads_management, ads_read, instagram_basic, instagram_manage_insights, pages_read_engagement'],
  ['META_AD_ACCOUNT_ID', 'شناسه‌ی حساب تبلیغاتی (act_…)'],
  ['IG_USER_ID', 'شناسه‌ی Instagram Business Account متصل به پیج فیسبوک'],
  ['IG_ACCESS_TOKEN', 'اختیاری — اگر به‌جای فیسبوک از Instagram Login استفاده می‌کنید'],
]

export default function ProfileSettings({ profile, setProfile }: StudioProps) {
  const [draft, setDraft] = useState<Profile>(profile)
  const [saved, setSaved] = useState(false)
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => { setDraft({ ...draft, [k]: v }); setSaved(false) }
  const setFeature = (i: number, patch: Partial<WebsiteFeature>) => set('features', draft.features.map((f, j) => (j === i ? { ...f, ...patch } : f)))

  const onPhoto = async (file?: File) => {
    if (!file) return
    set('photo', await shrinkImage(await readFileAsDataUrl(file)))
  }

  return (
    <>
      <Header
        title="پروفایل و اتصال‌ها"
        subtitle="این اطلاعات منبع همه‌ی پوسترها، اسکریپت‌ها و تبلیغات است"
        actions={<>
          <button className="btn ghost" onClick={() => { setDraft(DEFAULT_PROFILE); setSaved(false) }}>بازنشانی</button>
          <button className="btn primary" onClick={() => { setProfile(draft); setSaved(true) }}>{saved ? 'ذخیره شد ✓' : 'ذخیره'}</button>
        </>}
      />
      <div className="grid-2">
        <Card title="اطلاعات میلاد">
          <div className="row photo-row">
            {draft.photo ? <img className="avatar lg" src={draft.photo} alt="" /> : <div className="avatar lg placeholder">MM</div>}
            <label className="btn ghost"><Upload size={16} /> آپلود عکس پرتره<input type="file" accept="image/*" hidden onChange={(e) => onPhoto(e.target.files?.[0])} /></label>
            {draft.photo && <button className="btn ghost sm" onClick={() => set('photo', '')}>حذف</button>}
          </div>
          <div className="form-grid">
            {TEXT_FIELDS.map(({ key, label, ltr, area }) => (
              <Field key={key} label={label}>
                {area
                  ? <textarea rows={3} dir={ltr ? 'ltr' : 'rtl'} value={String(draft[key])} onChange={(e) => set(key, e.target.value as never)} />
                  : <input dir={ltr ? 'ltr' : 'rtl'} value={String(draft[key])} onChange={(e) => set(key, e.target.value as never)} />}
              </Field>
            ))}
            <Field label="رنگ اصلی برند"><input type="color" value={draft.brandPrimary} onChange={(e) => set('brandPrimary', e.target.value)} /></Field>
            <Field label="رنگ تأکیدی (طلایی)"><input type="color" value={draft.brandAccent} onChange={(e) => set('brandAccent', e.target.value)} /></Field>
            <Field label="هدف هزینه‌ی هر لید (CAD)"><input type="number" min={1} value={draft.targetCpl} onChange={(e) => set('targetCpl', Number(e.target.value))} /></Field>
            <Field label="بودجه‌ی روزانه‌ی کل (CAD)"><input type="number" min={5} value={draft.dailyBudget} onChange={(e) => set('dailyBudget', Number(e.target.value))} /></Field>
          </div>
        </Card>

        <div className="stack">
          <Card title="ابزارهای سایت miladmomtaz.ca" actions={<button className="btn ghost sm" onClick={() => set('features', [...draft.features, { name: '', url: draft.website, pitch: '' }])}><Plus size={14} /> افزودن</button>}>
            <p className="muted small">سایت از محیط ساخت در دسترس نبود؛ این فهرست را با ابزارهای واقعی سایت تطبیق بده. همه‌ی ریلزها و تبلیغات از همین فهرست ساخته می‌شوند.</p>
            {draft.features.map((f, i) => (
              <div key={i} className="feature-edit">
                <input dir="ltr" placeholder="نام ابزار" value={f.name} onChange={(e) => setFeature(i, { name: e.target.value })} />
                <input dir="ltr" placeholder="لینک صفحه" value={f.url} onChange={(e) => setFeature(i, { url: e.target.value })} />
                <textarea dir="ltr" rows={2} placeholder="یک جمله: چه کاری برای مشتری می‌کند؟" value={f.pitch} onChange={(e) => setFeature(i, { pitch: e.target.value })} />
                <button className="btn ghost sm" onClick={() => set('features', draft.features.filter((_, j) => j !== i))} aria-label="حذف"><Trash2 size={14} /></button>
              </div>
            ))}
          </Card>

          <Card title="اتصال به اینستاگرام، متا و هوش مصنوعی">
            <p className="small">کلیدها فقط روی سرور (Netlify → Site configuration → Environment variables) ذخیره می‌شوند و هیچ‌وقت به مرورگر نمی‌آیند:</p>
            <table className="table small"><tbody>{ENV_VARS.map(([k, v]) => <tr key={k}><td dir="ltr"><code>{k}</code></td><td>{v}</td></tr>)}</tbody></table>
            <ol className="small">
              <li>در business.facebook.com یک System User بساز و به حساب تبلیغاتی، پیج فیسبوک و اکانت اینستاگرام دسترسی بده.</li>
              <li>یک توکن دائمی با دسترسی‌های بالا بساز و در <code>META_ACCESS_TOKEN</code> بگذار.</li>
              <li>بعد از Deploy مجدد، داشبورد آمار زنده‌ی پیج و بخش کمپین نتایج واقعی تبلیغات را نشان می‌دهد.</li>
            </ol>
          </Card>
        </div>
      </div>
    </>
  )
}
