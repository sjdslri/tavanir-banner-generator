// ============================================================
// بارگذاری و پارس کردن فایل پرامپت سفارشی
// ============================================================

// خواندن فایل JSON یا TXT و تبدیل به ساختار استاندارد
function parsePromptFile(content, filename) {
  // اگر JSON است، مستقیم پارس کن
  if (filename.toLowerCase().endsWith('.json')) {
    const data = JSON.parse(content);
    const cats = Array.isArray(data) ? data : (data.categories || []);
    return cats.map((c, i) => ({
      id: c.id || `custom-${i}`,
      name: c.name || `دسته سفارشی ${i + 1}`,
      items: (c.items || []).map(it => ({
        name: it.name || `پرامپت`,
        prompt: it.prompt || '',
      })),
    }));
  }

  // اگر TXT است، پارس دستی
  return parseTextFile(content);
}

// پارس فایل TXT — از الگوهای زیر پشتیبانی می‌کند:
//   ## X.Y - عنوان فارسی
//   prompt انگلیسی...
//
// یا فقط هر پاراگراف جدا شده با خط خالی
function parseTextFile(text) {
  const lines = text.split(/\r?\n/);
  const items = [];
  let currentTitle = null;
  let currentBody = [];

  const isHeader = (line) => {
    const t = line.trim();
    if (!t) return false;
    // ## عنوان یا ### یا ## 1.1 یا ## 1-1
    if (t.startsWith('##') || t.startsWith('###')) return true;
    // شماره‌گذاری مثل "1.1" یا "1-1" در ابتدای خط
    if (/^\d+[\.\-]\d+\s*[\-–:]?\s*/.test(t)) return true;
    return false;
  };

  const cleanHeader = (line) => {
    return line.trim()
      .replace(/^#{1,4}\s*/, '')
      .replace(/^\d+[\.\-]\d+\s*[\-–:]?\s*/, '')
      .trim() || `پرامپت ${items.length + 1}`;
  };

  for (const line of lines) {
    const t = line.trim();
    if (isHeader(t) && t.length < 200) {
      // ذخیره قبلی
      if (currentTitle && currentBody.length > 0) {
        const body = currentBody.join(' ').replace(/\s+/g, ' ').trim();
        if (body.length > 20) {
          items.push({ name: currentTitle, prompt: body });
        }
      }
      currentTitle = cleanHeader(t);
      currentBody = [];
    } else if (t.length > 0) {
      // نادیده بگیر خطوط جداکننده
      if (t.match(/^[=\-*_]{3,}$/)) continue;
      currentBody.push(t);
    }
  }

  // ذخیره آخرین
  if (currentTitle && currentBody.length > 0) {
    const body = currentBody.join(' ').replace(/\s+/g, ' ').trim();
    if (body.length > 20) {
      items.push({ name: currentTitle, prompt: body });
    }
  }

  // اگر هیچ آیتمی پیدا نشد، هر پاراگراف جدا با خط خالی را یک پرامپت در نظر بگیر
  if (items.length === 0) {
    const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 20);
    paragraphs.forEach((p, i) => {
      const firstLine = p.split('\n')[0].slice(0, 60);
      const body = p.replace(/\s+/g, ' ');
      items.push({ name: firstLine, prompt: body });
    });
  }

  return [{
    id: 'custom-imported',
    name: 'پرامپت‌های واردشده (سفارشی)',
    items: items,
  }];
}

// ============================================================
// مدیریت در localStorage
// ============================================================

function saveCustomPrompts(categories) {
  localStorage.setItem('customPrompts', JSON.stringify(categories));
}

function getCustomPrompts() {
  try {
    const raw = localStorage.getItem('customPrompts');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('خطا در خواندن پرامپت‌های سفارشی:', e);
    return [];
  }
}

function clearCustomPrompts() {
  localStorage.removeItem('customPrompts');
}

// ترکیب پرامپت‌های پیش‌فرض و سفارشی
function getAllPromptCategories() {
  const custom = getCustomPrompts();
  // ابتدا سفارشی‌ها، سپس پیش‌فرض
  return [...custom, ...PROMPT_CATEGORIES];
}