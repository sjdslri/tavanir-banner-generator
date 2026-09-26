// ============================================================
// server.js — Tavanir Banner Generator v4.0
// Express + Playwright + GapGPT AI
// ============================================================

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { chromium } = require('playwright-core');
const { renderTemplate } = require('./lib/render-engine');

require('dotenv').config();

// ============================================================
// CONFIG
// ============================================================
const GAPGPT_API_KEY = process.env.GAPGPT_API_KEY;
const GAPGPT_BASE_URL = process.env.GAPGPT_BASE_URL || 'https://api.gapgpt.app/v1';
const GAPGPT_MODEL = process.env.GAPGPT_MODEL || 'gapgpt/qwen-image-2.1';

const BROWSER_CHANNELS = ['msedge', 'chrome'];
const PORT = process.env.PORT || 4001;
const TEMPLATES_DIR = path.join(__dirname, 'templates');

// ============================================================
// BROWSER LAUNCHER
// ============================================================
async function launchBrowser() {
    let lastError;
    for (const channel of BROWSER_CHANNELS) {
        try {
            return await chromium.launch({ channel });
        } catch (err) {
            lastError = err;
        }
    }
    throw new Error('مرورگر پیدا نشد: ' + (lastError && lastError.message));
}

// ============================================================
// DOWNLOAD WITH RETRY (for AI images)
// ============================================================
async function downloadWithRetry(url, maxAttempts = 3) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`📥 تلاش ${attempt}/${maxAttempts} برای دانلود تصویر...`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const res = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'image/png,image/jpeg,image/webp,image/*,*/*',
                },
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                console.warn(`⚠️ پاسخ ${res.status} در تلاش ${attempt}`);
                continue;
            }

            const buffer = Buffer.from(await res.arrayBuffer());
            console.log(`✅ دانلود موفق (${(buffer.length / 1024).toFixed(1)} KB)`);
            return buffer;

        } catch (err) {
            console.warn(`⚠️ خطا در تلاش ${attempt}: ${err.message}`);
            if (attempt < maxAttempts) {
                console.log(`⏳ صبر ۲ ثانیه قبل از تلاش بعدی...`);
                await new Promise(r => setTimeout(r, 2000));
            }
        }
    }
    return null;
}

// ============================================================
// APP SETUP
// ============================================================
const app = express();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/templates', express.static(TEMPLATES_DIR));

// ============================================================
// RENDER CACHE (temporary)
// ============================================================
const renderCache = new Map();
setInterval(() => {
    const now = Date.now();
    for (const [token, entry] of renderCache) {
        if (entry.expires < now) renderCache.delete(token);
    }
}, 60 * 1000);

// ============================================================
// STARTUP LOG
// ============================================================
console.log('====================================');
console.log('📁 مسیر پوشه قالب‌ها:', TEMPLATES_DIR);
console.log('📁 آیا پوشه وجود دارد؟', fs.existsSync(TEMPLATES_DIR));
if (fs.existsSync(TEMPLATES_DIR)) {
    const folders = fs.readdirSync(TEMPLATES_DIR);
    console.log('📂 محتوای پوشه قالب‌ها:', folders);
    folders.forEach(folder => {
        const fp = path.join(TEMPLATES_DIR, folder);
        if (fs.statSync(fp).isDirectory()) {
            const files = fs.readdirSync(fp);
            console.log(`   📁 ${folder}/ → ${files.join(', ')}`);
        }
    });
}
console.log('====================================');
console.log('🔑 کلید GapGPT:', GAPGPT_API_KEY ? `تنظیم شده (${GAPGPT_API_KEY.slice(0, 10)}...)` : '❌ تنظیم نشده');
console.log('🤖 مدل تصویری:', GAPGPT_MODEL);
console.log('====================================');

// ============================================================
// DEFAULT FIELDS (fallback)
// ============================================================
const DEFAULT_FIELDS = [
    { key: "title", label: "تیتر اصلی خبر", type: "text", default: "اطلاعیه مهم" },
    { key: "logo", label: "لوگو", type: "image", default: "" },
    { key: "footerText", label: "متن پاورقی", type: "text", default: "روابط عمومی شرکت توانیر" },
    {
        key: "newsItems",
        label: "سطرهای خبری",
        type: "array",
        itemFields: [
            { key: "date", label: "تاریخ", type: "text" },
            { key: "time", label: "ساعت", type: "text" },
            { key: "text", label: "متن خبر", type: "text" }
        ],
        default: [
            { date: "۱۴۰۳/۰۵/۰۱", time: "۱۰:۳۰", text: "متن خبر اول شما" },
            { date: "۱۴۰۳/۰۵/۰۲", time: "۱۴:۰۰", text: "متن خبر دوم شما" }
        ]
    }
];

// ============================================================
// DEFAULT HTML (fallback if no template.html)
// ============================================================
const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 1080px; height: 1080px; margin: 0; padding: 0; font-family: 'Vazirmatn', Tahoma, sans-serif; overflow: hidden; background: #0a0a0a; }
    .poster { position: relative; width: 1080px; height: 1080px; overflow: hidden; }
    .bg { position: absolute; top: 0; left: 0; width: 1080px; height: 1080px; object-fit: cover; z-index: 1; }
    .content { position: absolute; top: 0; left: 0; width: 1080px; height: 1080px; z-index: 2; }
    .logo { position: absolute; top: 90px; left: 50%; transform: translateX(-50%); width: 150px; height: 150px; display: flex; align-items: center; justify-content: center; border-radius: 50%; overflow: hidden; background: rgba(255, 255, 255, 0.1); }
    .logo img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .box { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 810px; min-height: 480px; background: rgba(0, 0, 0, 0.7); border: 2px solid rgba(255, 204, 0, 0.4); border-radius: 20px; padding: 40px; display: flex; flex-direction: column; }
    .title { font-size: 42px; font-weight: 900; color: #ffcc00; text-align: center; margin-bottom: 30px; text-shadow: 0 0 20px rgba(255, 100, 0, 0.8); }
    .news-list { display: flex; flex-direction: column; gap: 15px; flex: 1; }
    .news-item { display: flex; align-items: center; background: rgba(255, 255, 255, 0.08); border-right: 4px solid #ffcc00; border-radius: 8px; padding: 15px 20px; }
    .news-meta { display: flex; flex-direction: column; min-width: 110px; font-size: 14px; color: #ffcc00; font-weight: 700; border-left: 1px solid rgba(255, 204, 0, 0.4); padding-left: 12px; margin-left: 12px; }
    .news-text { font-size: 20px; font-weight: 600; color: #ffffff; line-height: 1.5; }
    .footer { position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%); width: 80%; text-align: center; font-size: 15px; color: rgba(255, 255, 255, 0.6); }
  </style>
</head>
<body>
  <div class="poster">
    <img src="{{{__background}}}" class="bg" alt="">
    <div class="content">
      <div class="logo" data-drag-id="logo"><img src="{{{logo}}}" alt=""></div>
      <div class="box">
        <h1 class="title" data-drag-id="title">{{title}}</h1>
        <div class="news-list">
          <!--LOOP:newsItems-->
          <div class="news-item" data-drag-id="news-{{date}}-{{time}}">
            <div class="news-meta"><span>{{date}}</span><span>{{time}}</span></div>
            <div class="news-text">{{text}}</div>
          </div>
          <!--ENDLOOP:newsItems-->
        </div>
      </div>
      <div class="footer" data-drag-id="footer">{{footerText}}</div>
    </div>
  </div>
</body>
</html>`;

// ============================================================
// FIND BACKGROUND FILE
// ============================================================
function findBackgroundFile(templateDir) {
    const candidates = [
        'background.png',
        'background.jpg',
        'background.jpeg',
        'background.webp',
        'bg.png',
        'bg.jpg',
        'main.png',
        'main.jpg'
    ];
    for (const name of candidates) {
        if (fs.existsSync(path.join(templateDir, name))) return name;
    }
    try {
        const files = fs.readdirSync(templateDir);
        const imageFile = files.find(f =>
            /\.(png|jpg|jpeg|webp|gif)$/i.test(f) &&
            !f.toLowerCase().includes('logo')
        );
        if (imageFile) return imageFile;
    } catch (e) {}
    return null;
}

// ============================================================
// LOAD TEMPLATE META
// ============================================================
function loadTemplateMeta(id) {
    const templateDir = path.join(TEMPLATES_DIR, id);

    if (!fs.existsSync(templateDir)) {
        console.log(`❌ پوشه ${id} وجود ندارد`);
        return null;
    }
    if (!fs.statSync(templateDir).isDirectory()) {
        console.log(`❌ ${id} یک پوشه نیست`);
        return null;
    }

    const bgFile = findBackgroundFile(templateDir);
    if (!bgFile) {
        console.log(`❌ در پوشه ${id} هیچ فایل تصویری پیدا نشد`);
        return null;
    }

    let name = `قالب ${id}`;
    let category = 'banner';
    let width = 1080;
    let height = 1080;
    let fields = DEFAULT_FIELDS;

    // Read meta.json if exists
    const metaPath = path.join(templateDir, 'meta.json');
    if (fs.existsSync(metaPath)) {
        try {
            const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
            if (meta.name) name = meta.name;
            if (meta.category) category = meta.category;
            if (meta.width) width = meta.width;
            if (meta.height) height = meta.height;
            if (Array.isArray(meta.fields) && meta.fields.length > 0) fields = meta.fields;
        } catch (e) {
            console.error(`meta.json نامعتبر در ${id}:`, e.message);
        }
    }

    // Read config.json if exists (new format, overrides meta.json)
    const configPath = path.join(templateDir, 'config.json');
    if (fs.existsSync(configPath)) {
        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            if (config.name) name = config.name;
            if (config.category) category = config.category;
            if (config.width) width = config.width;
            if (config.height) height = config.height;
            if (Array.isArray(config.fields) && config.fields.length > 0) fields = config.fields;
        } catch (e) {
            console.error(`config.json نامعتبر در ${id}:`, e.message);
        }
    }

    return { id, name, category, width, height, fields, __bgFile: bgFile };
}

// ============================================================
// LOAD TEMPLATE HTML
// ============================================================
function loadTemplateHtml(id) {
    // Priority 1: template.html in template folder
    const ownHtml = path.join(TEMPLATES_DIR, id, 'template.html');
    if (fs.existsSync(ownHtml)) {
        return fs.readFileSync(ownHtml, 'utf-8');
    }

    // Priority 2: shared layout
    const layoutHtml = path.join(__dirname, 'layouts', 'default', 'template.html');
    if (fs.existsSync(layoutHtml)) {
        return fs.readFileSync(layoutHtml, 'utf-8');
    }

    // Priority 3: default HTML
    return DEFAULT_HTML;
}

// ============================================================
// BUILD POSITION STYLES (for drag & drop)
// ============================================================
function buildPositionStyles(positions) {
    if (!positions || Object.keys(positions).length === 0) return '';

    let css = '<style id="drag-positions">';
    for (const [id, pos] of Object.entries(positions)) {
        const x = pos.x || 0;
        const y = pos.y || 0;
        const scale = pos.scale || 1;
        css += `[data-drag-id="${id}"] { transform: translate(${x}px, ${y}px) scale(${scale}) !important; }`;
    }
    css += '</style>';
    return css;
}

// ============================================================
// DRAG SCRIPT (injected in preview iframe)
// ============================================================
const dragScript = `
<script>
(function() {
  var positions = window.__initialPositions || {};
  var active = null;

  function setup() {
    var els = document.querySelectorAll('[data-drag-id]');
    els.forEach(function(el) {
      var id = el.getAttribute('data-drag-id');
      if (positions[id]) {
        el.style.transform = 'translate(' + positions[id].x + 'px, ' + positions[id].y + 'px)';
      }
      el.style.cursor = 'move';
      el.style.userSelect = 'none';
      el.style.touchAction = 'none';

      el.addEventListener('mousedown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var startX = e.clientX, startY = e.clientY;
        var baseX = positions[id] ? positions[id].x : 0;
        var baseY = positions[id] ? positions[id].y : 0;

        function onMove(ev) {
          var dx = ev.clientX - startX;
          var dy = ev.clientY - startY;
          var nx = baseX + dx;
          var ny = baseY + dy;
          positions[id] = { x: nx, y: ny };
          el.style.transform = 'translate(' + nx + 'px, ' + ny + 'px)';
        }

        function onUp() {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          window.parent.postMessage({ type: 'positions', positions: positions }, '*');
        }

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });

      // Touch support
      el.addEventListener('touchstart', function(e) {
        if (e.touches.length !== 1) return;
        e.preventDefault();
        var startX = e.touches[0].clientX, startY = e.touches[0].clientY;
        var baseX = positions[id] ? positions[id].x : 0;
        var baseY = positions[id] ? positions[id].y : 0;

        function onMove(ev) {
          if (ev.touches.length !== 1) return;
          ev.preventDefault();
          var dx = ev.touches[0].clientX - startX;
          var dy = ev.touches[0].clientY - startY;
          var nx = baseX + dx;
          var ny = baseY + dy;
          positions[id] = { x: nx, y: ny };
          el.style.transform = 'translate(' + nx + 'px, ' + ny + 'px)';
        }

        function onUp() {
          document.removeEventListener('touchmove', onMove);
          document.removeEventListener('touchend', onUp);
          window.parent.postMessage({ type: 'positions', positions: positions }, '*');
        }

        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onUp);
      }, { passive: false });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
<\/script>
`;

// ============================================================
// API: GET all templates
// ============================================================
app.get('/api/templates', (req, res) => {
    try {
        const ids = fs.readdirSync(TEMPLATES_DIR)
            .filter((f) => fs.statSync(path.join(TEMPLATES_DIR, f)).isDirectory());

        const templates = ids
            .map((id) => loadTemplateMeta(id))
            .filter(Boolean);

        console.log(`📋 ${templates.length} قالب ارسال شد به فرانت‌اند`);
        res.json(templates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// ============================================================
// API: GET template by id
// ============================================================
app.get('/api/templates/:id', (req, res) => {
    const meta = loadTemplateMeta(req.params.id);
    if (!meta) return res.status(404).json({ error: 'قالب پیدا نشد' });
    res.json(meta);
});

// ============================================================
// API: PREVIEW (live drag & drop preview)
// ============================================================
app.post('/api/preview', upload.single('logo'), (req, res) => {
    try {
        const { templateId } = req.body;
        const meta = loadTemplateMeta(templateId);
        if (!meta) return res.status(404).send('قالب پیدا نشد');

        let fields;
        try {
            fields = JSON.parse(req.body.fields || '{}');
        } catch {
            return res.status(400).send('داده نامعتبر');
        }

        if (req.file) {
            fields.logo = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        }

        fields.__background = `/templates/${templateId}/${meta.__bgFile}`;

        const html = loadTemplateHtml(templateId);
        let rendered = renderTemplate(html, fields);
        rendered = rendered.replace('</head>', buildPositionStyles(fields.positions) + '</head>');

        const initScript = `<script>window.__initialPositions = ${JSON.stringify(fields.positions || {})};<\/script>`;
        rendered = rendered.replace('</body>', initScript + dragScript + '</body>');

        res.set('Content-Type', 'text/html; charset=utf-8');
        res.send(rendered);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// ============================================================
// API: GENERATE (final PNG/JPEG via Playwright)
// ============================================================
app.post('/api/generate', upload.single('logo'), async (req, res) => {
    let browser, token;
    try {
        const { templateId, format = 'png' } = req.body;
        const meta = loadTemplateMeta(templateId);
        if (!meta) return res.status(404).json({ error: 'قالب پیدا نشد' });

        let fields;
        try {
            fields = JSON.parse(req.body.fields || '{}');
        } catch {
            return res.status(400).json({ error: 'داده نامعتبر' });
        }

        if (req.file) {
            fields.logo = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        }

        fields.__background = `/templates/${templateId}/${meta.__bgFile}`;

        token = crypto.randomBytes(8).toString('hex');
        renderCache.set(token, { data: fields, expires: Date.now() + 5 * 60 * 1000 });

        const width = meta.width || 1080;
        const height = meta.height || 1080;

        browser = await launchBrowser();
        const page = await browser.newPage({
            viewport: { width, height },
            deviceScaleFactor: 2,
        });

        await page.goto(`http://localhost:${PORT}/render/${templateId}/${token}`, {
            waitUntil: 'networkidle',
        });

        await page.waitForTimeout(1000);

        const outFormat = format === 'jpeg' ? 'jpeg' : 'png';
        const shotOptions = { type: outFormat };
        if (outFormat === 'jpeg') shotOptions.quality = 92;

        const buffer = await page.screenshot(shotOptions);

        res.set('Content-Type', outFormat === 'jpeg' ? 'image/jpeg' : 'image/png');
        res.set('Content-Disposition', `attachment; filename="poster.${outFormat}"`);
        res.send(buffer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'خطا در تولید', details: err.message });
    } finally {
        if (browser) await browser.close();
        if (token) renderCache.delete(token);
    }
});

// ============================================================
// RENDER (used by Playwright for final output)
// ============================================================
app.get('/render/:templateId/:token?', (req, res) => {
    const { templateId, token } = req.params;
    const meta = loadTemplateMeta(templateId);
    if (!meta) return res.status(404).send('قالب پیدا نشد');

    const html = loadTemplateHtml(templateId);
    const data = token && renderCache.has(token)
        ? renderCache.get(token).data
        : {};

    if (!data.__background) {
        data.__background = `/templates/${templateId}/${meta.__bgFile}`;
    }

    let rendered = renderTemplate(html, data);
    rendered = rendered.replace('</head>', buildPositionStyles(data.positions) + '</head>');

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(rendered);
});

// ============================================================
// AI: GENERATE BACKGROUND via GapGPT
// ============================================================
app.post('/api/ai/generate-background', async (req, res) => {
    try {
        const { prompt, size = '1024x1024' } = req.body;

        if (!prompt || prompt.trim().length < 10) {
            return res.status(400).json({ error: 'پرامپت حداقل ۱۰ کاراکتر باشد' });
        }
        if (!GAPGPT_API_KEY) {
            return res.status(500).json({ error: 'کلید API تنظیم نشده. فایل .env را بررسی کن.' });
        }

        console.log(`🎨 شروع تولید AI (${size}):`, prompt.slice(0, 80) + '...');

        const apiRes = await fetch(`${GAPGPT_BASE_URL}/images/generations`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GAPGPT_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: GAPGPT_MODEL,
                prompt: prompt.trim(),
                size: size,
            }),
        });

        if (!apiRes.ok) {
            const errText = await apiRes.text();
            console.error('❌ خطای GapGPT:', apiRes.status, errText);
            return res.status(apiRes.status).json({
                error: `خطای GapGPT (${apiRes.status})`,
                details: errText.slice(0, 500),
            });
        }

        const apiData = await apiRes.json();
        const imageUrl = apiData?.data?.[0]?.url;

        if (!imageUrl) {
            console.error('❌ URL تصویر در پاسخ نیست:', JSON.stringify(apiData).slice(0, 500));
            return res.status(500).json({ error: 'URL تصویر در پاسخ GapGPT یافت نشد' });
        }

        console.log('✅ تصویر تولید شد:', imageUrl);

        // Download with retry
        const imgBuffer = await downloadWithRetry(imageUrl, 3);
        if (!imgBuffer) {
            return res.status(500).json({
                error: 'دانلود تصویر بعد از ۳ تلاش ناموفق بود. لطفاً دوباره امتحان کن.',
            });
        }

        const newTemplateId = `ai-${Date.now()}`;
        const newTemplateDir = path.join(TEMPLATES_DIR, newTemplateId);
        fs.mkdirSync(newTemplateDir, { recursive: true });

        fs.writeFileSync(path.join(newTemplateDir, 'background.png'), imgBuffer);

        fs.writeFileSync(
            path.join(newTemplateDir, 'config.json'),
            JSON.stringify({
                name: `AI: ${prompt.slice(0, 40)}${prompt.length > 40 ? '...' : ''}`,
                category: 'ai',
                width: 1080,
                height: 1080,
                layout: 'default',
                aiPrompt: prompt,
                aiSize: size,
                createdAt: new Date().toISOString(),
            }, null, 2)
        );

        console.log(`✅ قالب جدید ساخته شد: ${newTemplateId}`);

        res.json({
            success: true,
            templateId: newTemplateId,
            previewUrl: `/templates/${newTemplateId}/background.png`,
        });
    } catch (err) {
        console.error('❌ AI generation error:', err);
        res.status(500).json({
            error: 'خطای غیرمنتظره',
            details: err.message,
        });
    }
});

// ============================================================
// 404 HANDLER
// ============================================================
app.use((req, res) => {
    res.status(404).send('صفحه پیدا نشد');
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ سرور اجرا شد: http://localhost:${PORT}`);
    console.log(`📁 پوشه عمومی: ${path.join(__dirname, 'public')}`);
    console.log(`📁 پوشه قالب‌ها: ${TEMPLATES_DIR}`);
    console.log('====================================');
});