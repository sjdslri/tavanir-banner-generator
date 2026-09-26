// موتور قالب‌گذاری بسیار ساده — بدون نیاز به کتابخانه‌ی خارجی
//
// پشتیبانی می‌کند از:
//   {{field}}      -> جایگذاری متن (با escape کردن HTML، امن در برابر ورودی کاربر)
//   {{{field}}}    -> جایگذاری خام بدون escape (برای src تصویر لوگو که یک data-URI است)
//   <!--LOOP:key--> ... <!--ENDLOOP:key-->
//                  -> تکرار یک بلوک به ازای هر آیتم در آرایه‌ی data[key]
//                     داخل بلوک هم به فیلدهای خودِ آیتم و هم فیلدهای سطح بالا دسترسی هست
//                     (فیلدهای آیتم در صورت هم‌نام بودن، اولویت دارند)

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderSimple(html, data) {
  return html
    .replace(/\{\{\{(\w+)\}\}\}/g, (_, key) => (data[key] != null ? String(data[key]) : ''))
    .replace(/\{\{(\w+)\}\}/g, (_, key) => escapeHtml(data[key]));
}

function renderTemplate(html, data) {
  const loopRegex = /<!--LOOP:(\w+)-->([\s\S]*?)<!--ENDLOOP:\1-->/g;

  let output = html.replace(loopRegex, (_, key, block) => {
    const items = Array.isArray(data[key]) ? data[key] : [];
    return items
      .map((item) => renderSimple(block, Object.assign({}, data, item)))
      .join('\n');
  });

  output = renderSimple(output, data);
  return output;
}

module.exports = { renderTemplate, escapeHtml };
