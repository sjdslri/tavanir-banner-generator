# ⚡ سیستم تولید بنر — شرکت توانیر

سیستم هوشمند تولید بنر خبری با قالب‌های آماده و هوش مصنوعی تصویری.

## 🌟 ویژگی‌ها

- 🖼️ **بنرهای خبری** — تولید تصاویر از روی قالب‌های آماده
- 🎨 **تولید با AI** — ساخت پس‌زمینه با GapGPT
- ✏️ **ویرایشگر پیشرفته** — ویرایش متن، لوگو، اشکال با Fabric.js
- 🔄 **Drag & Drop** — جابه‌جایی المان‌ها با ماوس یا لمس
- 📱 **ریسپانسیو** — کار روی موبایل، تبلت و دسکتاپ
- 🎬 **پس‌زمینه ویدیویی** — طراحی مدرن با تم برق

## 📋 پیش‌نیازها

- **Node.js** نسخه ۱۸ یا بالاتر
- **Chrome** یا **Microsoft Edge** (برای تولید نهایی)
- **GapGPT API Key** (برای بخش AI) — از [اینجا](https://gapgpt.app) بگیرید

## 🚀 نصب

### ۱. کلون پروژه

\`\`\`bash
git clone https://github.com/YOUR_USERNAME/tavanir-banner-generator.git
cd tavanir-banner-generator
\`\`\`

### ۲. نصب پکیج‌ها

\`\`\`bash
npm install
\`\`\`

### ۳. تنظیم محیط

فایل `.env` را از روی `.env.example` بسازید و کلید API خود را وارد کنید:

\`\`\`bash
cp .env.example .env
\`\`\`

سپس `.env` را باز کنید و `GAPGPT_API_KEY` را مقداردهی کنید.

### ۴. اجرا

\`\`\`bash
npm start
\`\`\`

سپس در مرورگر باز کنید: http://localhost:4001

## 📁 ساختار پروژه

\`\`\`
tavanir-banner-generator/
├── lib/
│   └── render-engine.js       # موتور قالب‌گذاری
├── public/
│   ├── assets/                # ویدیو پس‌زمینه
│   ├── app.js
│   ├── editor.html            # ویرایشگر Fabric.js
│   ├── editor.js
│   ├── index.html
│   ├── prompts.js             # پرامپت‌های آماده
│   ├── prompt-loader.js
│   └── style.css
├── templates/                 # قالب‌های بنر
│   ├── 1/
│   │   ├── background.png
│   │   └── config.json
│   └── ...
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
\`\`\`

## 🎨 افزودن قالب جدید

۱. یک پوشه جدید در `templates/` بسازید (مثلاً `templates/8/`)
۲. فایل `background.png` (یا jpg) را داخلش بگذارید
۳. (اختیاری) یک `config.json` بسازید:

\`\`\`json
{
  "name": "نام قالب",
  "category": "banner",
  "width": 1080,
  "height": 1080
}
\`\`\`

**تمام!** قالب به صورت خودکار در گالری ظاهر می‌شود.

## 🛠️ تکنولوژی‌ها

- **Backend:** Node.js, Express
- **Frontend:** Vanilla JS, Fabric.js
- **Screenshot:** Playwright
- **AI:** GapGPT (Qwen Image 2.1)
- **Font:** Vazirmatn

## 📄 لایسنس

MIT — شرکت توانیر — روابط عمومی

## 📞 پشتیبانی

برای سوالات با تیم روابط عمومی توانیر تماس بگیرید.
\`\`\`

---

## قدم ۴: `package.json` رو چک کن

فایل `package.json` رو باز کن. باید تقریباً این‌طوری باشه:

```json
{
  "name": "tavanir-banner-generator",
  "version": "4.0.0",
  "private": true,
  "description": "سیستم تولید بنر خبری با قالب‌های آماده و هوش مصنوعی — شرکت توانیر",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "keywords": ["banner", "generator", "tavanir", "ai", "poster"],
  "author": "Tavanir PR",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "multer": "^1.4.5-lts.1",
    "playwright-core": "^1.48.0"
  }
}