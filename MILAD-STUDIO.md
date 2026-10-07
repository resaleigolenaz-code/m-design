# Milad Studio — استودیوی محتوا و تبلیغات میلاد ممتاز

آدرس: `/milad/` (بعد از Deploy روی Netlify). ورود با نام کاربری و رمزی که روی سرور تنظیم می‌شود.

## بخش‌ها
| بخش | کار |
|---|---|
| داشبورد | پروفایل، آمار زنده‌ی اینستاگرام (Graph API)، ابزارهای سایت، تحلیل پیج و برنامه‌ی محتوای هفتگی با AI |
| ایده و سناریوی ریلز | ۱۰ ریلز آماده (هوک، صحنه، دیالوگ انگلیسی/فارسی، CTA، کپشن) + ساخت ریلز جدید با AI |
| کمپین متا | نقشه‌ی کامل کمپین لید (Housing category، ۳ ad set، ۷ تبلیغ، فرم لید، KPI، قوانین بستن/افزایش بودجه، چک‌لیست، برنامه‌ی ۴ هفته)، طراحی کمپین اختصاصی با AI، ساخت کمپین (PAUSED) در حساب تبلیغاتی |
| تحلیل و بهینه‌سازی | دریافت نتایج از Meta یا CSV، تشخیص خودکار، تحلیل AI، دکمه‌ی توقف/افزایش/کاهش بودجه (با تأیید) |
| آتلیه ویدیو | آپلود ویدیوی ایستاده، حذف بکگراند در مرورگر (MediaPipe)، ۷ بکگراند متحرک یا عکس دلخواه/لیستینگ، زیرنویس کلمه‌به‌کلمه، هوک، معرفی نام و بروکریج، زوم ریتمیک، CTA پایانی، خروجی MP4 عمودی، سناریوی ادیت و کپشن با AI |
| پوستر | Just Listed / Open House / Sold / کارت معرفی / کاور ریلز / نکته — با عکس و مشخصات میلاد، خروجی PNG |
| اسلاید و کاروسل | کاروسل ۷ اسلایدی آماده + ساخت با AI، دانلود همه‌ی اسلایدها |
| پروفایل | اطلاعات میلاد، عکس، رنگ برند، ابزارهای سایت، هدف CPL و بودجه |

## Environment variables (Netlify → Site configuration → Environment variables)
| Variable | Required | Purpose |
|---|---|---|
| `STUDIO_PASSWORD` | yes | Milad's login password |
| `STUDIO_SECRET` | yes | Long random string used to sign sessions (`openssl rand -hex 32`) |
| `STUDIO_USERNAME` | no | Login username (default `milad`) |
| `ANTHROPIC_API_KEY` | for AI | Claude API key — all AI generation |
| `META_ACCESS_TOKEN` | for live data | System-user token: `ads_management`, `ads_read`, `instagram_basic`, `instagram_manage_insights`, `pages_read_engagement`, `pages_show_list` |
| `META_AD_ACCOUNT_ID` | for ads | `act_…` |
| `IG_USER_ID` | for Instagram | Instagram Business account id linked to the Facebook Page |
| `IG_ACCESS_TOKEN` | no | Use instead of the above with Instagram Login (`graph.instagram.com/me`) |
| `META_GRAPH_VERSION` | no | Defaults to `v23.0` |

Secrets stay server-side in `netlify/functions/*`; the browser only receives a signed session token.

## Notes
- Everything except AI and live Meta data works without keys (library, blueprint campaign, posters, slides, atelier).
- Profile, photo and edits are stored in the browser (localStorage) of the device Milad uses.
- Background removal downloads the MediaPipe model from Google/jsDelivr on first use.
- Video export records in real time in the browser (MP4 in current Chrome/Safari, WebM otherwise).
- miladmomtaz.ca could not be fetched from the build environment; confirm the AI-tool list in «پروفایل».
