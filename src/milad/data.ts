export type WebsiteFeature = { name: string; url: string; pitch: string }

export type Profile = {
  name: string
  nameFa: string
  title: string
  brokerage: string
  phone: string
  email: string
  website: string
  instagram: string
  office: string
  areas: string
  languages: string
  bio: string
  proof: string
  brandPrimary: string
  brandAccent: string
  photo: string // data URL of Milad's photo (stored locally in the browser)
  features: WebsiteFeature[]
  targetCpl: number
  dailyBudget: number
}

// Public info gathered from search results (realtor.ca / REW / miladmomtaz.ca listings).
// The website itself was not reachable from the build environment, so the
// feature list below is a starting point to confirm/edit in «پروفایل».
export const DEFAULT_PROFILE: Profile = {
  name: 'Milad Momtaz Azad',
  nameFa: 'میلاد ممتاز آزاد',
  title: 'Real Estate Salesperson',
  brokerage: 'PROPERTY.CA INC., Brokerage',
  phone: '(647) 510-8858',
  email: 'hello@miladmomtaz.ca',
  website: 'https://miladmomtaz.ca',
  instagram: 'miladmomtaz.realtor',
  office: '36 Distillery Lane, Suite 500, Toronto, ON',
  areas: 'Toronto, North York, Thornhill, Richmond Hill, Vaughan, Mississauga, Brampton, Oakville',
  languages: 'English, Farsi',
  bio: '20+ years in marketing & sales, York University graduate (Customer Success Management). Works with buyers, sellers and investors across the GTA; advises on renovations and value-add.',
  proof: 'Top Producer 2024 · 4.9★ client reviews',
  brandPrimary: '#0E1B2C',
  brandAccent: '#C8A45D',
  photo: '',
  features: [
    { name: 'AI Home Valuation', url: 'https://miladmomtaz.ca', pitch: 'Instant AI estimate of what your home is worth today, refined by Milad personally.' },
    { name: 'AI Smart Property Search', url: 'https://miladmomtaz.ca/listings', pitch: 'Search every GTA MLS listing in plain English — “3-bed semi near a subway under $1.2M”.' },
    { name: 'AI Real-Estate Assistant', url: 'https://miladmomtaz.ca', pitch: '24/7 assistant that answers buying/selling questions and books a call with Milad.' },
    { name: 'Mortgage & Affordability Calculator', url: 'https://miladmomtaz.ca', pitch: 'See your real monthly payment and max budget in 30 seconds.' },
    { name: 'Instant Listing Alerts', url: 'https://miladmomtaz.ca/listings', pitch: 'New listings matching your criteria, the minute they hit the market.' },
    { name: 'Investor Deal Analyzer', url: 'https://miladmomtaz.ca', pitch: 'Cash-flow, cap rate and ROI on multiplexes and condos before you book a showing.' },
  ],
  targetCpl: 30,
  dailyBudget: 60,
}

export type Scene = { t: string; shot: string; on_screen_text: string; dialogue_en: string; dialogue_fa: string; broll: string }
export type Reel = {
  title: string
  goal: string
  feature: string
  length_sec: number
  hook_visual: string
  hook_line_en: string
  hook_line_fa: string
  scenes: Scene[]
  cta: string
  caption: string
  hashtags: string[]
  music_mood: string
  thumbnail_text: string
  why_it_works: string
}

const TAGS = ['#TorontoRealEstate', '#GTARealEstate', '#TorontoRealtor', '#RealtorLife', '#HomeValue', '#ملک_تورنتو', '#مشاور_املاک_تورنتو']

// Ready-to-film library: every reel is Milad standing and talking to camera.
// Background is replaced in the «آتلیه ویدیو».
export const REEL_LIBRARY: Reel[] = [
  {
    title: 'Your house is worth more than you think',
    goal: 'Seller leads',
    feature: 'AI Home Valuation',
    length_sec: 25,
    hook_visual: 'Milad holds phone to camera showing a valuation result, quick zoom-in',
    hook_line_en: 'Most GTA homeowners are guessing their home’s value — and leaving money on the table.',
    hook_line_fa: 'بیشتر صاحب‌خانه‌های تورنتو قیمت خونه‌شون رو حدسی می‌گن — و پول روی میز جا می‌ذارن.',
    scenes: [
      { t: '0–2s', shot: 'Close-up, punch-in', on_screen_text: 'What is your home REALLY worth?', dialogue_en: 'Stop guessing what your home is worth.', dialogue_fa: 'دیگه قیمت خونه‌تون رو حدس نزنید.', broll: 'Phone screen with valuation number' },
      { t: '2–10s', shot: 'Medium shot', on_screen_text: '60 seconds · free · AI', dialogue_en: 'On my website I built an AI that compares your home to every recent sale on your street — in about 60 seconds.', dialogue_fa: 'روی سایتم یه هوش مصنوعی ساختم که خونه‌تون رو با همه‌ی فروش‌های اخیر خیابون‌تون مقایسه می‌کنه — توی ۶۰ ثانیه.', broll: 'Screen recording of miladmomtaz.ca valuation' },
      { t: '10–20s', shot: 'Close-up, lean in', on_screen_text: 'Then I check it personally', dialogue_en: 'Then I personally review it, because an algorithm doesn’t know you just redid the kitchen.', dialogue_fa: 'بعد خودم شخصاً بررسی‌اش می‌کنم، چون الگوریتم نمی‌دونه شما تازه آشپزخونه رو بازسازی کردید.', broll: 'Renovated kitchen photo' },
      { t: '20–25s', shot: 'Medium, point down', on_screen_text: 'Link in bio → Home Value', dialogue_en: 'Tap the link, get your number. No pressure, no calls unless you want one.', dialogue_fa: 'روی لینک بزنید، عددتون رو بگیرید. بدون فشار، بدون تماس — مگر اینکه خودتون بخواید.', broll: '' },
    ],
    cta: 'Get your free AI home value → miladmomtaz.ca',
    caption: 'Your home’s value changed this year — do you know by how much? My AI valuation compares your home with every recent sale nearby in ~60 seconds, then I review it personally. Free, no pressure. 👉 Link in bio.',
    hashtags: TAGS,
    music_mood: 'Confident, minimal beat',
    thumbnail_text: 'WHAT’S MY HOME WORTH?',
    why_it_works: 'Curiosity + loss aversion hook, a free tool as the lead magnet, human trust layer.',
  },
  {
    title: 'I typed this into my AI and found a hidden deal',
    goal: 'Buyer leads',
    feature: 'AI Smart Property Search',
    length_sec: 22,
    hook_visual: 'Milad reads a funny, ultra-specific search query aloud',
    hook_line_en: 'I asked my AI for a 3-bed near a subway under $1.2M… look what it found.',
    hook_line_fa: 'از هوش مصنوعیم خواستم یه خونه‌ی ۳ خوابه نزدیک مترو زیر ۱.۲ میلیون پیدا کنه… ببینید چی پیدا کرد.',
    scenes: [
      { t: '0–2s', shot: 'Close-up', on_screen_text: '“3-bed · near subway · under $1.2M”', dialogue_en: 'Watch this.', dialogue_fa: 'اینو ببینید.', broll: 'Typing the query on the site' },
      { t: '2–12s', shot: 'Medium', on_screen_text: 'Search like you talk', dialogue_en: 'No filters, no 40 checkboxes. You just describe your life and the AI searches every MLS listing in the GTA.', dialogue_fa: 'بدون فیلتر و چهل تا تیک. فقط زندگی‌تون رو توصیف کنید، هوش مصنوعی کل لیستینگ‌های MLS تورنتو رو می‌گرده.', broll: 'Results grid from /listings' },
      { t: '12–18s', shot: 'Close-up', on_screen_text: 'Alerts before everyone else', dialogue_en: 'Save it, and you get the new ones the minute they hit the market.', dialogue_fa: 'ذخیره‌اش کنید، خونه‌های جدید رو همون لحظه که میاد بازار براتون می‌فرسته.', broll: 'Phone notification mock' },
      { t: '18–22s', shot: 'Medium', on_screen_text: 'Try it free → link in bio', dialogue_en: 'Try it — comment SEARCH and I’ll send you the link.', dialogue_fa: 'امتحانش کنید — بنویسید «سرچ» تا لینک رو براتون بفرستم.', broll: '' },
    ],
    cta: 'Search the GTA in plain English → miladmomtaz.ca/listings',
    caption: 'House hunting shouldn’t feel like filling out a tax form. Describe what you want in plain English and my AI searches every GTA listing for you — and alerts you first. Comment SEARCH for the link 🔎',
    hashtags: TAGS,
    music_mood: 'Upbeat tech',
    thumbnail_text: 'I LET AI FIND MY CLIENT A HOME',
    why_it_works: 'Specific relatable query = pattern interrupt; demo-led; comment CTA boosts reach.',
  },
  {
    title: '3 mistakes that cost sellers $50K',
    goal: 'Seller leads + authority',
    feature: 'AI Home Valuation',
    length_sec: 30,
    hook_visual: 'Milad holds up three fingers, hard cut on each number',
    hook_line_en: 'These 3 mistakes cost Toronto sellers $50,000 — number 2 is the most common.',
    hook_line_fa: 'این ۳ اشتباه ۵۰ هزار دلار به فروشنده‌های تورنتو ضرر می‌زنه — دومی از همه رایج‌تره.',
    scenes: [
      { t: '0–3s', shot: 'Close-up', on_screen_text: '3 MISTAKES = -$50K', dialogue_en: 'Three mistakes that cost sellers fifty grand.', dialogue_fa: 'سه اشتباهی که پنجاه هزار دلار ضرر داره.', broll: '' },
      { t: '3–10s', shot: 'Medium', on_screen_text: '1 · Pricing on emotion', dialogue_en: 'One: pricing on what your neighbour got in 2022. The market moved.', dialogue_fa: 'یک: قیمت‌گذاری بر اساس اینکه همسایه‌تون ۲۰۲۲ چند فروخت. بازار عوض شده.', broll: 'Price chart' },
      { t: '10–18s', shot: 'Medium, step closer', on_screen_text: '2 · Listing before small fixes', dialogue_en: 'Two: listing before the $3,000 fixes that buyers pay $30,000 more for.', dialogue_fa: 'دو: لیست کردن قبل از تعمیرات ۳ هزار دلاری که خریدار براش ۳۰ هزار بیشتر می‌ده.', broll: 'Before/after staging' },
      { t: '18–25s', shot: 'Close-up', on_screen_text: '3 · Weak marketing', dialogue_en: 'Three: MLS photos and a sign. In 2026 your buyer is scrolling Reels.', dialogue_fa: 'سه: فقط عکس MLS و تابلو. خریدار ۲۰۲۶ داره ریلز می‌بینه.', broll: 'Reels of a listing' },
      { t: '25–30s', shot: 'Medium', on_screen_text: 'Free AI value + my plan', dialogue_en: 'Start with a real number — my free AI valuation is in my bio.', dialogue_fa: 'با یه عدد واقعی شروع کنید — ارزیابی رایگان با هوش مصنوعی توی بایوی منه.', broll: '' },
    ],
    cta: 'Get your free valuation + selling plan',
    caption: 'Selling in 2026? Avoid these 3 mistakes. 20+ years in marketing taught me that how you launch a home matters as much as the price. Start with a real number → free AI valuation in bio.',
    hashtags: TAGS,
    music_mood: 'Serious, cinematic pulse',
    thumbnail_text: '3 MISTAKES = -$50K',
    why_it_works: 'Listicle + numbers retains viewers to the end; positions Milad’s marketing background.',
  },
  {
    title: 'Can you actually afford a Toronto home on $150K?',
    goal: 'First-time buyer leads',
    feature: 'Mortgage & Affordability Calculator',
    length_sec: 25,
    hook_visual: 'Milad shows a salary number on screen, raised eyebrow',
    hook_line_en: 'Household income $150K — here is exactly what you can buy in the GTA right now.',
    hook_line_fa: 'درآمد خانوار ۱۵۰ هزار دلار — دقیقاً این رو می‌تونید الان تو تورنتو بخرید.',
    scenes: [
      { t: '0–2s', shot: 'Close-up', on_screen_text: '$150K income → ?', dialogue_en: 'You make 150K together. What can you buy?', dialogue_fa: 'با هم ۱۵۰ هزار درآمد دارید. چی می‌تونید بخرید؟', broll: '' },
      { t: '2–14s', shot: 'Medium', on_screen_text: 'Budget · payment · down payment', dialogue_en: 'I ran it in my calculator: your realistic budget, your monthly payment, and the down payment you actually need.', dialogue_fa: 'توی ماشین‌حسابم حساب کردم: بودجه‌ی واقعی، قسط ماهانه، و پیش‌پرداختی که واقعاً لازم دارید.', broll: 'Calculator screen' },
      { t: '14–21s', shot: 'Close-up', on_screen_text: 'Areas that fit', dialogue_en: 'And here are three neighbourhoods where that budget still gets you a real home.', dialogue_fa: 'و این سه تا محله هنوز با این بودجه یه خونه‌ی واقعی بهتون می‌دن.', broll: 'Map of GTA areas' },
      { t: '21–25s', shot: 'Medium', on_screen_text: 'Run YOUR numbers → bio', dialogue_en: 'Run your own numbers in 30 seconds — link in bio.', dialogue_fa: 'عدد خودتون رو توی ۳۰ ثانیه حساب کنید — لینک توی بایو.', broll: '' },
    ],
    cta: 'Calculate your budget in 30 seconds',
    caption: 'Renting forever isn’t the only option. See your real budget, payment and down payment in 30 seconds, then let’s find the neighbourhoods that fit. Link in bio 🏡',
    hashtags: TAGS,
    music_mood: 'Warm, hopeful',
    thumbnail_text: '$150K = WHAT HOUSE?',
    why_it_works: 'Concrete number makes viewers self-identify; tool gives instant value.',
  },
  {
    title: 'The fourplex math nobody shows you',
    goal: 'Investor leads',
    feature: 'Investor Deal Analyzer',
    length_sec: 28,
    hook_visual: 'Milad with a whiteboard-style text overlay of rent numbers',
    hook_line_en: 'This $2.4M Toronto fourplex pays you — here is the math nobody shows you.',
    hook_line_fa: 'این چهارواحدی ۲.۴ میلیونی تورنتو خودش پول درمیاره — این حسابیه که کسی نشونتون نمی‌ده.',
    scenes: [
      { t: '0–3s', shot: 'Close-up', on_screen_text: 'Fourplex · $2.4M · cash-flow?', dialogue_en: 'Does a Toronto fourplex still cash-flow?', dialogue_fa: 'چهارواحدی تورنتو هنوز سود نقدی داره؟', broll: 'Exterior of multiplex' },
      { t: '3–15s', shot: 'Medium', on_screen_text: 'Rents · expenses · cap rate', dialogue_en: 'Four units of rent, minus taxes, insurance, maintenance and the mortgage. My deal analyzer does it in seconds.', dialogue_fa: 'اجاره‌ی چهار واحد، منهای مالیات، بیمه، نگهداری و وام. تحلیل‌گر معامله‌ی من چند ثانیه‌ای حسابش می‌کنه.', broll: 'Analyzer screen' },
      { t: '15–23s', shot: 'Close-up', on_screen_text: 'The lever: value-add', dialogue_en: 'The real lever is value-add — I’ve helped clients renovate and add units to change the whole equation.', dialogue_fa: 'اهرم اصلی ارزش‌افزوده‌ست — به مشتری‌هام کمک کردم بازسازی کنن و واحد اضافه کنن.', broll: 'Renovation clips' },
      { t: '23–28s', shot: 'Medium', on_screen_text: 'DM “DEAL” for the analysis', dialogue_en: 'DM me DEAL and I’ll send you the full breakdown.', dialogue_fa: 'کلمه‌ی «دیل» رو دایرکت بدید تا تحلیل کامل رو بفرستم.', broll: '' },
    ],
    cta: 'Analyze a deal with Milad',
    caption: 'Investors: stop guessing. Rents, expenses, cap rate and the value-add plan — analyzed before you book a showing. DM “DEAL” 📊',
    hashtags: [...TAGS, '#RealEstateInvesting', '#Multiplex'],
    music_mood: 'Driving, business',
    thumbnail_text: 'DOES THIS PAY YOU?',
    why_it_works: 'Specific deal numbers attract high-value investor audience; DM keyword creates conversations.',
  },
  {
    title: 'I answered 100 questions at 2am (my AI did)',
    goal: 'Brand + leads',
    feature: 'AI Real-Estate Assistant',
    length_sec: 20,
    hook_visual: 'Milad yawning, then a phone lights up with chat messages',
    hook_line_en: 'Clients message me at 2am… so I built an AI that answers them.',
    hook_line_fa: 'مشتری‌ها ساعت ۲ شب پیام می‌دن… پس یه هوش مصنوعی ساختم که جوابشون رو بده.',
    scenes: [
      { t: '0–2s', shot: 'Close-up, humour', on_screen_text: '2:00 AM 📱', dialogue_en: '2am. “Milad, quick question…”', dialogue_fa: 'ساعت ۲ شب. «میلاد، یه سؤال کوچیک…»', broll: 'Phone notification' },
      { t: '2–12s', shot: 'Medium', on_screen_text: '24/7 AI assistant', dialogue_en: 'So my website now has an assistant trained on how I work — closing costs, land transfer tax, offers, anything.', dialogue_fa: 'الان سایتم یه دستیار داره که با روش کار من آموزش دیده — هزینه‌های بستن معامله، مالیات انتقال، آفر، هر چی.', broll: 'Chat demo' },
      { t: '12–20s', shot: 'Close-up, smile', on_screen_text: 'Ask it anything → bio', dialogue_en: 'And when you’re ready, it books a call with the real me.', dialogue_fa: 'و هر وقت آماده بودید، یه وقت تماس با خود من رزرو می‌کنه.', broll: '' },
    ],
    cta: 'Ask the AI assistant now',
    caption: 'Real estate questions don’t keep office hours. Ask my AI assistant anything about buying or selling in the GTA — day or night. Then book a call with me when you’re ready.',
    hashtags: TAGS,
    music_mood: 'Playful, lo-fi',
    thumbnail_text: 'MY AI WORKS NIGHTS',
    why_it_works: 'Humour + relatable pain; differentiates Milad as the tech-forward agent.',
  },
  {
    title: 'Selling? Here is my marketing plan (20 years in marketing)',
    goal: 'Listing appointments',
    feature: 'AI Home Valuation',
    length_sec: 30,
    hook_visual: 'Milad counts a 5-step plan on fingers, fast cuts',
    hook_line_en: 'Before I was a realtor I spent 20 years in marketing — this is how I sell a home.',
    hook_line_fa: 'قبل از مشاور املاک شدن، ۲۰ سال تو مارکتینگ بودم — این‌جوری یه خونه رو می‌فروشم.',
    scenes: [
      { t: '0–3s', shot: 'Close-up', on_screen_text: '20 YEARS OF MARKETING → YOUR HOME', dialogue_en: '20 years of marketing. Here’s how I use it to sell your home.', dialogue_fa: '۲۰ سال مارکتینگ. اینجوری برای فروش خونه‌ی شما ازش استفاده می‌کنم.', broll: '' },
      { t: '3–22s', shot: 'Medium, quick cuts', on_screen_text: 'Price · Prep · Film · Target · Negotiate', dialogue_en: 'AI-backed pricing. Small fixes with big returns. Cinematic video. Paid ads targeted to real buyers. And negotiation that protects every dollar.', dialogue_fa: 'قیمت‌گذاری با کمک هوش مصنوعی. تعمیرات کوچیک با برگشت بزرگ. ویدیوی سینمایی. تبلیغات هدفمند برای خریدار واقعی. و مذاکره‌ای که از هر دلار شما دفاع می‌کنه.', broll: 'Listing videos, ads dashboard' },
      { t: '22–30s', shot: 'Close-up', on_screen_text: 'Start with your number → bio', dialogue_en: 'It starts with knowing your number. Get it free on my website.', dialogue_fa: 'همه‌چی با دونستن عدد واقعی شروع می‌شه. رایگان از سایتم بگیرید.', broll: '' },
    ],
    cta: 'Book a free selling strategy call',
    caption: 'Selling a home is a marketing project. Pricing backed by AI, prep that pays back, cinematic video and targeted ads — that’s my plan for your home. Start with your free valuation 👉 bio',
    hashtags: TAGS,
    music_mood: 'Premium, cinematic',
    thumbnail_text: 'HOW I SELL A HOME',
    why_it_works: 'Credibility from a real differentiator (marketing background) — attracts sellers who compare agents.',
  },
  {
    title: 'Toronto market in 30 seconds (monthly series)',
    goal: 'Followers + retargeting pool',
    feature: 'Instant Listing Alerts',
    length_sec: 30,
    hook_visual: 'Milad with big up/down arrow overlays',
    hook_line_en: 'Toronto prices this month in 30 seconds — and what it means for you.',
    hook_line_fa: 'قیمت‌های تورنتو این ماه در ۳۰ ثانیه — و معنیش برای شما.',
    scenes: [
      { t: '0–3s', shot: 'Close-up', on_screen_text: 'GTA MARKET · THIS MONTH', dialogue_en: 'The GTA market this month in 30 seconds.', dialogue_fa: 'بازار تورنتو این ماه در ۳۰ ثانیه.', broll: '' },
      { t: '3–20s', shot: 'Medium', on_screen_text: 'Avg price · Sales · Days on market', dialogue_en: 'Average price, number of sales, and how fast homes are selling — and whether it’s a buyer’s or seller’s market.', dialogue_fa: 'میانگین قیمت، تعداد فروش، سرعت فروش — و اینکه بازار به نفع خریداره یا فروشنده.', broll: 'Stat cards' },
      { t: '20–30s', shot: 'Close-up', on_screen_text: 'Get alerts in your area', dialogue_en: 'Want this for your street? Set up alerts on my website.', dialogue_fa: 'برای خیابون خودتون می‌خواید؟ از سایتم هشدار تنظیم کنید.', broll: '' },
    ],
    cta: 'Set up instant listing alerts',
    caption: 'Your monthly GTA market update in 30 seconds. Save this and follow for next month. Want alerts for your neighbourhood? Link in bio 📈',
    hashtags: TAGS,
    music_mood: 'News-style',
    thumbnail_text: 'GTA MARKET · 30 SEC',
    why_it_works: 'Recurring series builds habit and a large warm audience to retarget with lead ads.',
  },
  {
    title: 'برای جامعه‌ی ایرانی: خرید اولین خانه در کانادا',
    goal: 'Persian-speaking buyer leads',
    feature: 'Mortgage & Affordability Calculator',
    length_sec: 30,
    hook_visual: 'Milad speaks Farsi directly, warm tone, subtitles in English',
    hook_line_en: 'New to Canada and want to buy? Here’s what nobody tells newcomers.',
    hook_line_fa: 'تازه اومدید کانادا و می‌خواید خونه بخرید؟ اینا رو کسی به تازه‌واردها نمی‌گه.',
    scenes: [
      { t: '0–3s', shot: 'Close-up', on_screen_text: 'تازه‌وارد؟ خرید خانه', dialogue_en: 'New to Canada and want to buy a home?', dialogue_fa: 'تازه اومدید کانادا و می‌خواید خونه بخرید؟', broll: '' },
      { t: '3–20s', shot: 'Medium', on_screen_text: 'وام تازه‌واردها · پیش‌پرداخت · تخفیف مالیاتی', dialogue_en: 'There are newcomer mortgage programs, first-time buyer tax rebates, and you may need less down payment than you think.', dialogue_fa: 'برنامه‌های وام مخصوص تازه‌واردها هست، بازگشت مالیات انتقال برای خریدار اول، و شاید پیش‌پرداخت کمتری از اونی که فکر می‌کنید لازم باشه.', broll: 'Calculator' },
      { t: '20–30s', shot: 'Close-up', on_screen_text: 'به فارسی مشاوره بگیرید', dialogue_en: 'Calculate your budget on my site, then let’s talk — in Farsi.', dialogue_fa: 'بودجه‌تون رو تو سایتم حساب کنید، بعد با هم صحبت کنیم — به فارسی.', broll: '' },
    ],
    cta: 'Free consultation in Farsi',
    caption: 'خرید اولین خانه در کانادا برای تازه‌واردها — برنامه‌های وام، بازگشت مالیات و پیش‌پرداخت. بودجه‌تون رو در ۳۰ ثانیه حساب کنید و به فارسی مشاوره بگیرید. لینک در بایو 🏡',
    hashtags: [...TAGS, '#ایرانیان_تورنتو', '#خرید_خانه_کانادا'],
    music_mood: 'Warm, Persian instrumental',
    thumbnail_text: 'خرید خانه برای تازه‌واردها',
    why_it_works: 'Native-language content wins trust in a high-intent community niche with low ad competition.',
  },
  {
    title: 'Just listed — walk-through in my words',
    goal: 'Listing promotion + buyer leads',
    feature: 'AI Smart Property Search',
    length_sec: 25,
    hook_visual: 'Milad in front of the listing (background = listing photo)',
    hook_line_en: 'Just listed: 3 storeys, designer finishes, steps to downtown — here’s the catch.',
    hook_line_fa: 'تازه لیست شد: سه طبقه، طراحی معمار، چند قدمی داون‌تاون — ولی یه نکته داره.',
    scenes: [
      { t: '0–3s', shot: 'Close-up, listing photo bg', on_screen_text: 'JUST LISTED · $1,149,000', dialogue_en: 'Just listed — and there’s a catch.', dialogue_fa: 'تازه لیست شد — ولی یه نکته داره.', broll: 'Exterior' },
      { t: '3–18s', shot: 'Medium, bg changes per room', on_screen_text: '3 beds · architect-designed', dialogue_en: 'Architect-designed, three storeys, a garden you won’t find downtown. The catch? It won’t last the weekend.', dialogue_fa: 'طراحی معمار، سه طبقه، حیاطی که تو مرکز شهر پیدا نمی‌کنید. نکته‌اش؟ تا آخر هفته نمی‌مونه.', broll: 'Interior photos' },
      { t: '18–25s', shot: 'Close-up', on_screen_text: 'Book a showing → bio', dialogue_en: 'Full details and showings — link in bio.', dialogue_fa: 'جزئیات کامل و بازدید — لینک در بایو.', broll: '' },
    ],
    cta: 'Book a private showing',
    caption: 'Just listed 🔑 Architect-designed, 3 storeys, garden, steps to downtown. Showings this week — details at the link in bio.',
    hashtags: [...TAGS, '#JustListed'],
    music_mood: 'Luxury, elegant',
    thumbnail_text: 'JUST LISTED',
    why_it_works: 'Background-replacement lets Milad “stand inside” the listing without filming on-site.',
  },
]

export type CampaignPlan = {
  campaign: { name: string; objective: string; special_ad_category: string; buying_type: string; budget_strategy: string; daily_budget_cad: number; conversion_location: string; pixel_events: string[]; utm_template: string }
  ad_sets: { name: string; audience: string; location: string; placements: string; optimization: string; daily_budget_cad: number; notes: string }[]
  ads: { name: string; ad_set: string; format: string; creative_brief: string; primary_text: string; headline: string; description: string; cta_button: string; destination_url: string }[]
  instant_form?: { intro_headline: string; questions: string[]; privacy_note: string; thank_you: string }
  kpis: { target_cpl_cad: number; target_ctr_pct: number; max_frequency: number; target_hook_rate_pct: number }
  rules: { if: string; then: string }[]
  launch_checklist: string[]
  week_by_week: { week: string; actions: string }[]
}

const UTM = '?utm_source=meta&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}'

export function blueprintCampaign(p: Profile): CampaignPlan {
  const site = p.website.replace(/\/$/, '')
  const radius = 'Toronto + 25 km radius (housing category minimum is 15 km)'
  return {
    campaign: {
      name: 'MM | Leads | AI Tools | 2026',
      objective: 'Leads (OUTCOME_LEADS)',
      special_ad_category: 'Housing (required in Canada for real estate)',
      buying_type: 'Auction',
      budget_strategy: 'Advantage+ campaign budget (CBO) — let Meta move spend to the winning ad set',
      daily_budget_cad: p.dailyBudget,
      conversion_location: 'Website (Lead event via Pixel + Conversions API); Instant Form as a backup ad set',
      pixel_events: ['PageView', 'ViewContent (valuation page)', 'Lead (valuation submitted)', 'Contact (call/booking)', 'CompleteRegistration (listing alerts)'],
      utm_template: UTM,
    },
    ad_sets: [
      { name: 'Sellers · Home Value', audience: 'Advantage+ audience. Suggestions: homeownership, home renovation, moving. Let creative do the targeting.', location: radius, placements: 'Advantage+ placements (Reels, Stories, Feed)', optimization: 'Leads — website Lead event', daily_budget_cad: Math.round(p.dailyBudget * 0.45), notes: 'Highest value: sellers become listings. Send to AI Home Valuation page.' },
      { name: 'Buyers · AI Search & Alerts', audience: 'Advantage+ audience. Suggestions: first-time home buyer, mortgage, apartment hunting.', location: radius, placements: 'Advantage+ placements', optimization: 'Leads — CompleteRegistration (alerts signup)', daily_budget_cad: Math.round(p.dailyBudget * 0.35), notes: 'Volume driver. Retarget site visitors with listing reels.' },
      { name: 'Retargeting · Warm 30d', audience: 'Custom: IG engagers 60d, video viewers 50%+ 30d, website visitors 30d (exclude submitted leads).', location: radius, placements: 'Reels + Stories', optimization: 'Leads — Instant Form (higher intent form)', daily_budget_cad: Math.round(p.dailyBudget * 0.2), notes: 'Cheapest leads. Use testimonial + “book a call” creatives.' },
    ],
    ads: [
      { name: 'S1 · Worth more than you think (Reel)', ad_set: 'Sellers · Home Value', format: '9:16 Reel 25s', creative_brief: 'Reel #1 from the library — valuation demo + personal review.', primary_text: `Your home’s value changed this year. Do you know by how much?\n\nMy AI valuation compares your home with every recent sale nearby in about 60 seconds — then I review it personally (an algorithm doesn’t know about your new kitchen).\n\n✅ Free  ✅ No pressure  ✅ ${p.areas.split(',').slice(0, 3).join(', ')} & across the GTA\n\n${p.name} · ${p.brokerage}`, headline: 'What’s Your Home Worth Today?', description: 'Free AI valuation in 60 seconds', cta_button: 'Get Quote', destination_url: `${site}${UTM}` },
      { name: 'S2 · 3 mistakes -$50K (Reel)', ad_set: 'Sellers · Home Value', format: '9:16 Reel 30s', creative_brief: 'Reel #3 — listicle authority.', primary_text: `Selling in 2026? These 3 mistakes cost Toronto sellers up to $50K:\n1️⃣ Pricing on old comps\n2️⃣ Skipping the small fixes buyers pay big for\n3️⃣ Marketing with just MLS photos\n\nStart with a real number — free AI home valuation + a selling plan from someone with 20+ years in marketing.\n\n${p.name} · ${p.brokerage}`, headline: 'Avoid the $50K Seller Mistakes', description: 'Free valuation + selling plan', cta_button: 'Learn More', destination_url: `${site}${UTM}` },
      { name: 'S3 · My marketing plan (Carousel)', ad_set: 'Sellers · Home Value', format: '4:5 Carousel 6 cards', creative_brief: 'Slides from «اسلاید» — 5-step selling plan, last card = valuation CTA.', primary_text: `20+ years in marketing. Here’s exactly how I’d sell your home 👉 swipe.\n\n${p.proof}\n${p.name} · ${p.brokerage}`, headline: 'How I Sell a Home in the GTA', description: p.proof, cta_button: 'Learn More', destination_url: `${site}${UTM}` },
      { name: 'B1 · Search like you talk (Reel)', ad_set: 'Buyers · AI Search & Alerts', format: '9:16 Reel 22s', creative_brief: 'Reel #2 — AI search demo with a specific query.', primary_text: `House hunting shouldn’t feel like a tax form.\n\nType what you want in plain English — “3-bed semi near a subway under $1.2M” — and my AI searches every GTA listing for you. Save it and get new homes the minute they hit the market.\n\n${p.name} · ${p.brokerage}`, headline: 'Search GTA Homes in Plain English', description: 'AI search + instant alerts', cta_button: 'Sign Up', destination_url: `${site}/listings${UTM}` },
      { name: 'B2 · $150K what can I buy (Reel)', ad_set: 'Buyers · AI Search & Alerts', format: '9:16 Reel 25s', creative_brief: 'Reel #4 — affordability.', primary_text: `Household income around $150K? Here’s what you can realistically buy in the GTA — budget, monthly payment and down payment in 30 seconds.\n\nThen I’ll show you the neighbourhoods that fit.\n\n${p.name} · ${p.brokerage}`, headline: 'What Can You Afford in the GTA?', description: 'Free 30-second calculator', cta_button: 'Learn More', destination_url: `${site}${UTM}` },
      { name: 'B3 · Newcomers (Farsi Reel)', ad_set: 'Buyers · AI Search & Alerts', format: '9:16 Reel 30s, Farsi audio + English captions', creative_brief: 'Reel #9 — newcomer programs, Farsi.', primary_text: `خرید اولین خانه در کانادا؟ برنامه‌های وام تازه‌واردها، بازگشت مالیات انتقال و پیش‌پرداخت — بودجه‌تون رو در ۳۰ ثانیه حساب کنید و به فارسی مشاوره بگیرید.\n\n${p.nameFa} · ${p.brokerage}`, headline: 'مشاوره‌ی خرید خانه به فارسی', description: 'رایگان و بدون تعهد', cta_button: 'Learn More', destination_url: `${site}${UTM}` },
      { name: 'R1 · 2am AI assistant (Reel)', ad_set: 'Retargeting · Warm 30d', format: '9:16 Reel 20s', creative_brief: 'Reel #6 — humour, book a call.', primary_text: `Still thinking about buying or selling? Ask my AI assistant anything — day or night — then book a 15-min call with me when you’re ready.\n\n${p.name} · ${p.brokerage}`, headline: 'Book a 15-Min Call with Milad', description: 'No pressure, real answers', cta_button: 'Book Now', destination_url: `${site}${UTM}` },
    ],
    instant_form: {
      intro_headline: 'Get your free home value + market report',
      questions: ['Full name', 'Phone', 'Email', 'Are you planning to buy, sell or both?', 'Timeline: 0–3 / 3–6 / 6–12 months', 'Property address (sellers)'],
      privacy_note: `${p.website}/privacy`,
      thank_you: `Thanks! ${p.name.split(' ')[0]} will text you within the hour. Meanwhile, try the AI tools at ${p.website}`,
    },
    kpis: { target_cpl_cad: p.targetCpl, target_ctr_pct: 1.2, max_frequency: 3, target_hook_rate_pct: 30 },
    rules: [
      { if: `Ad spent > 2× target CPL (CA$${p.targetCpl * 2}) with 0 leads`, then: 'Pause the ad' },
      { if: `Ad set CPL > 1.5× target for 3 days`, then: 'Lower ad set budget 30% or pause and move budget to the winner' },
      { if: `CPL < 0.7× target and ≥ 5 leads`, then: 'Scale budget +20% every 48h (never more than +30% at once)' },
      { if: 'Link CTR < 0.8% after 2,000 impressions', then: 'Hook is weak — re-edit first 2 seconds / new thumbnail text' },
      { if: '3-second hook rate < 25%', then: 'New opening line + stronger on-screen text' },
      { if: 'Frequency > 3 in 7 days', then: 'Refresh creative or widen radius' },
      { if: 'CPM > CA$25 for 3 days', then: 'Check audience overlap, switch to Advantage+ audience' },
    ],
    launch_checklist: [
      'Ads Manager → ad account currency CAD, time zone Toronto',
      'Pixel installed on miladmomtaz.ca + Conversions API (Lead fires on valuation submit)',
      'Domain verified in Business Manager; Lead event prioritised',
      'Special Ad Category = Housing; location radius ≥ 15 km',
      'Brokerage name in every ad (RECO/TRESA)',
      'Instant form connected to CRM/email + SMS auto-reply within 5 minutes',
      'UTM parameters on every URL',
      'Upload 9:16 video with burned-in captions (85% watch muted)',
    ],
    week_by_week: [
      { week: 'Week 1', actions: 'Launch 3 ad sets × 2–3 ads. Don’t touch for 72h (learning phase).' },
      { week: 'Week 2', actions: 'Apply the rules: kill losers, +20% on winners. Add 2 new hooks of the winning reel.' },
      { week: 'Week 3', actions: 'Build lookalike-style suggestion from leads list; launch retargeting testimonial.' },
      { week: 'Week 4', actions: 'Review lead quality with CRM (appointments, not just leads). Re-allocate to the ad set with best cost per appointment.' },
    ],
  }
}
