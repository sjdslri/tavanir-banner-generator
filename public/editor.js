// ============================================================
// ویرایشگر بنر — نسخه پیشرفته
// ============================================================

let canvas;
let templateId;
let templateMeta = null;
let undoStack = [];
let redoStack = [];
let isRestoring = false;
let currentScale = 1;
let clipboard = null;
let settings = { guides: true, grid: false, autosave: true };
let autosaveTimer = null;
let guidesVisible = true;

const FONTS = [
  { id: 'Vazirmatn', name: 'وزیرمتن' },
  { id: 'Tahoma', name: 'تاهوما' },
  { id: 'Arial', name: 'Arial' },
  { id: 'Times New Roman', name: 'Times' },
  { id: 'Courier New', name: 'Courier' },
  { id: 'Georgia', name: 'Georgia' },
];

const COLOR_SWATCHES = [
  '#ffffff', '#000000', '#00e5ff', '#0099cc', '#f59e0b',
  '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#ffcc00',
  '#94a3b8', '#64748b', '#0f172a', '#1e293b', '#fbbf24'
];

// ============================================================
// راه‌اندازی
// ============================================================
window.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(location.search);
  templateId = params.get('t');

  if (!templateId) {
    alert('شناسه قالب پیدا نشد');
    location.href = '/';
    return;
  }

  try {
    const res = await fetch(`/api/templates/${templateId}`);
    if (!res.ok) throw new Error('قالب پیدا نشد');
    templateMeta = await res.json();
  } catch (err) {
    alert('خطا در بارگذاری قالب: ' + err.message);
    return;
  }

  // تنظیمات از localStorage
  try {
    const saved = localStorage.getItem('editor-settings');
    if (saved) settings = { ...settings, ...JSON.parse(saved) };
  } catch (e) {}

  applySettingsToUI();
  initCanvas();
  attachEventListeners();
  document.getElementById('loading').classList.add('hidden');
});

function applySettingsToUI() {
  ['guides', 'grid', 'autosave'].forEach(k => {
    const sw = document.getElementById('sw-' + k);
    if (sw) sw.classList.toggle('on', settings[k]);
  });
  if (settings.grid) {
    document.getElementById('canvas-container').classList.add('grid-bg');
  }
}

function initCanvas() {
  const w = templateMeta.width || 1080;
  const h = templateMeta.height || 1080;

  canvas = new fabric.Canvas('c', {
    width: w, height: h,
    backgroundColor: '#000',
    preserveObjectStacking: true,
    selection: true,
    selectionColor: 'rgba(0, 229, 255, 0.1)',
    selectionBorderColor: '#00e5ff',
    selectionLineWidth: 1,
  });

  // استایل هندل‌های سلکت
  fabric.Object.prototype.set({
    borderColor: '#00e5ff',
    cornerColor: '#00e5ff',
    cornerStrokeColor: '#001824',
    cornerStyle: 'circle',
    cornerSize: 10,
    transparentCorners: false,
    borderScaleFactor: 1.5,
    padding: 4,
  });
  fabric.Object.prototype.setControlsVisibility({
    mt: true, mb: true, ml: true, mr: true,
    tl: true, tr: true, bl: true, br: true,
    mtr: true,
  });

  // بارگذاری پس‌زمینه
  fabric.Image.fromURL(`/templates/${templateId}/background.png`, (img) => {
    img.set({
      left: 0, top: 0,
      selectable: false, evented: false,
      hasControls: false, hasBorders: false,
      excludeFromExport: false,
    });
    img.scaleToWidth(w);
    img.scaleToHeight(h);
    canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
    saveState();
    updateStatus();
  }, { crossOrigin: 'anonymous' });

  fitToScreen();
}

function attachEventListeners() {
  canvas.on('selection:created', onSelectionChange);
  canvas.on('selection:updated', onSelectionChange);
  canvas.on('selection:cleared', onSelectionChange);
  canvas.on('object:modified', onObjectModified);
  canvas.on('object:moving', onObjectMoving);
  canvas.on('object:added', () => { if (!isRestoring) saveState(); renderLayers(); updateStatus(); });
  canvas.on('object:removed', () => { if (!isRestoring) saveState(); renderLayers(); updateStatus(); });

  document.addEventListener('keydown', handleKeyboard);
  document.addEventListener('click', hideContextMenu);

  document.getElementById('canvas-area').addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) zoomIn(); else zoomOut();
    }
  }, { passive: false });

  // Right-click
  document.getElementById('canvas-container').addEventListener('contextmenu', showContextMenu);

  // Tab switching
  document.querySelectorAll('.panel-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const pane = document.querySelector(`[data-pane="${tab.dataset.tab}"]`);
      if (pane) pane.classList.add('active');
    });
  });
}

function onSelectionChange() {
  renderProperties();
  renderLayers();
  updateStatus();
}

function onObjectModified() {
  saveState();
  updateStatus();
}

function onObjectMoving(e) {
  if (!settings.guides) return;
  const obj = e.target;
  if (!obj) return;

  const w = templateMeta.width;
  const h = templateMeta.height;

  // Snap to center
  const centerX = w / 2;
  const centerY = h / 2;
  const objCenterX = obj.left + (obj.width * obj.scaleX) / 2;
  const objCenterY = obj.top + (obj.height * obj.scaleY) / 2;

  if (Math.abs(objCenterX - centerX) < 8) {
    obj.set('left', centerX - (obj.width * obj.scaleX) / 2);
  }
  if (Math.abs(objCenterY - centerY) < 8) {
    obj.set('top', centerY - (obj.height * obj.scaleY) / 2);
  }
}

// ============================================================
// Zoom
// ============================================================
function fitToScreen() {
  const area = document.getElementById('canvas-area');
  const padding = 80;
  const availW = area.clientWidth - padding;
  const availH = area.clientHeight - padding;
  const w = templateMeta.width;
  const h = templateMeta.height;
  currentScale = Math.min(availW / w, availH / h, 1.5);
  applyZoom();
}
function zoomIn() { currentScale = Math.min(currentScale * 1.15, 4); applyZoom(); }
function zoomOut() { currentScale = Math.max(currentScale / 1.15, 0.1); applyZoom(); }
function applyZoom() {
  canvas.setZoom(currentScale);
  canvas.setDimensions({
    width: templateMeta.width * currentScale,
    height: templateMeta.height * currentScale,
  });
  document.getElementById('zoom-indicator').textContent = Math.round(currentScale * 100) + '٪';
  canvas.renderAll();
}

// ============================================================
// Text presets
// ============================================================
function addPreset(type) {
  const w = templateMeta.width;
  const h = templateMeta.height;
  const presets = {
    title:    { text: 'تیتر اصلی خبر', size: 60, weight: '900', color: '#ffffff' },
    subtitle: { text: 'زیرعنوان', size: 32, weight: 'bold', color: '#00e5ff' },
    body:     { text: 'متن توضیحی اینجا', size: 20, weight: 'normal', color: '#e8edf5' },
    date:     { text: '۱۴۰۳/۰۱/۰۱', size: 24, weight: 'bold', color: '#00e5ff' },
    number:   { text: '۱۲۳', size: 80, weight: '900', color: '#00e5ff' },
    footer:   { text: 'روابط عمومی شرکت توانیر', size: 16, weight: 'normal', color: '#94a3b8' },
  };
  const p = presets[type];
  if (!p) return;
  addText(p.text, p.size, p.weight, p.color);
}

function addText(text, size = 40, weight = 'bold', color = '#ffffff') {
  const t = new fabric.IText(text, {
    left: templateMeta.width / 2,
    top: templateMeta.height / 2,
    originX: 'center', originY: 'center',
    fontFamily: 'Vazirmatn',
    fontSize: size, fontWeight: weight,
    fill: color,
    textAlign: 'center',
    direction: 'rtl',
    padding: 8,
    name: text.slice(0, 20),
  });
  canvas.add(t);
  canvas.setActiveObject(t);
  canvas.renderAll();
  showToast('متن اضافه شد', 'success');
}

function addIcon(emoji) {
  const t = new fabric.IText(emoji, {
    left: templateMeta.width / 2,
    top: templateMeta.height / 2,
    originX: 'center', originY: 'center',
    fontSize: 80,
    name: 'آیکون',
  });
  canvas.add(t);
  canvas.setActiveObject(t);
  canvas.renderAll();
}

// ============================================================
// Add images / shapes
// ============================================================
function addImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    fabric.Image.fromURL(e.target.result, (img) => {
      const maxSize = Math.min(templateMeta.width, templateMeta.height) * 0.35;
      const scale = maxSize / Math.max(img.width, img.height);
      img.set({
        left: templateMeta.width / 2,
        top: 150,
        originX: 'center', originY: 'center',
        scaleX: scale, scaleY: scale,
        name: 'تصویر',
      });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      showToast('تصویر اضافه شد', 'success');
    });
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function changeBackground(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    fabric.Image.fromURL(e.target.result, (img) => {
      img.set({
        left: 0, top: 0,
        selectable: false, evented: false,
      });
      img.scaleToWidth(templateMeta.width);
      img.scaleToHeight(templateMeta.height);
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
      saveState();
      showToast('پس‌زمینه تغییر کرد', 'success');
    });
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function changeBgColor(event) {
  canvas.setBackgroundColor(event.target.value, canvas.renderAll.bind(canvas));
  saveState();
}

function addRect() {
  const r = new fabric.Rect({
    left: templateMeta.width / 2,
    top: templateMeta.height / 2,
    originX: 'center', originY: 'center',
    width: 300, height: 100,
    fill: 'rgba(0, 229, 255, 0.2)',
    stroke: '#00e5ff', strokeWidth: 2,
    rx: 8, ry: 8,
    name: 'مستطیل',
  });
  canvas.add(r);
  canvas.setActiveObject(r);
  canvas.renderAll();
}

function addCircle() {
  const c = new fabric.Circle({
    left: templateMeta.width / 2,
    top: templateMeta.height / 2,
    originX: 'center', originY: 'center',
    radius: 100,
    fill: 'rgba(0, 229, 255, 0.2)',
    stroke: '#00e5ff', strokeWidth: 2,
    name: 'دایره',
  });
  canvas.add(c);
  canvas.setActiveObject(c);
  canvas.renderAll();
}

function addLine() {
  const l = new fabric.Line([0, 0, 300, 0], {
    left: templateMeta.width / 2,
    top: templateMeta.height / 2,
    originX: 'center', originY: 'center',
    stroke: '#00e5ff', strokeWidth: 4,
    name: 'خط',
  });
  canvas.add(l);
  canvas.setActiveObject(l);
  canvas.renderAll();
}

// ============================================================
// Properties Panel
// ============================================================
function renderProperties() {
  const body = document.getElementById('right-panel-body');
  const obj = canvas.getActiveObject();

  if (!obj) {
    body.innerHTML = `
      <div class="empty-state">
        <div class="big-ico">👆</div>
        یک المان را انتخاب کن
      </div>`;
    return;
  }

  const typeName = { 'i-text': 'متن', 'text': 'متن', 'image': 'تصویر', 'rect': 'مستطیل', 'circle': 'دایره', 'line': 'خط' }[obj.type] || obj.type;

  let html = '';

  // ============ Position & Size ============
  html += propSection('موقعیت و ابعاد', `
    <div class="prop-row">
      <div class="grid-2">
        <div>
          <label>X</label>
          <input type="number" id="p-x" value="${Math.round(obj.left)}">
        </div>
        <div>
          <label>Y</label>
          <input type="number" id="p-y" value="${Math.round(obj.top)}">
        </div>
      </div>
    </div>
    <div class="prop-row">
      <div class="grid-2">
        <div>
          <label>عرض</label>
          <input type="number" id="p-w" value="${Math.round(obj.width * obj.scaleX)}">
        </div>
        <div>
          <label>ارتفاع</label>
          <input type="number" id="p-h" value="${Math.round(obj.height * obj.scaleY)}">
        </div>
      </div>
    </div>
    <div class="prop-row">
      <label>چرخش <span class="range-val" id="v-rot">${Math.round(obj.angle)}°</span></label>
      <input type="range" id="p-rot" min="-180" max="180" value="${obj.angle}">
    </div>
    <div class="prop-row">
      <div class="grid-3">
        <button class="btn-mini" onclick="centerH()">↔️ وسط</button>
        <button class="btn-mini" onclick="centerV()">↕️ وسط</button>
        <button class="btn-mini" onclick="resetRotation()">0°</button>
      </div>
    </div>
  `);

  // ============ Text specific ============
  if (obj.type === 'i-text' || obj.type === 'text') {
    html += propSection('متن', `
      <div class="prop-row">
        <label>محتوا</label>
        <textarea id="p-text">${obj.text || ''}</textarea>
      </div>
      <div class="prop-row">
        <label>فونت</label>
        <select id="p-font">
          ${FONTS.map(f => `<option value="${f.id}" ${obj.fontFamily === f.id ? 'selected' : ''}>${f.name}</option>`).join('')}
        </select>
      </div>
      <div class="prop-row">
        <label>اندازه <span class="range-val" id="v-fs">${obj.fontSize}</span></label>
        <input type="range" id="p-fs" min="8" max="250" value="${obj.fontSize}">
      </div>
      <div class="prop-row">
        <label>وزن</label>
        <div class="seg-group">
          <button class="seg-btn ${obj.fontWeight == 'normal' ? 'active' : ''}" onclick="setTextProp('fontWeight','normal')">نازک</button>
          <button class="seg-btn ${obj.fontWeight == 'bold' ? 'active' : ''}" onclick="setTextProp('fontWeight','bold')">ضخیم</button>
          <button class="seg-btn ${obj.fontWeight == '900' ? 'active' : ''}" onclick="setTextProp('fontWeight','900')">خیلی ضخیم</button>
        </div>
      </div>
      <div class="prop-row">
        <label>چیدمان</label>
        <div class="seg-group">
          <button class="seg-btn ${obj.textAlign === 'right' ? 'active' : ''}" onclick="setTextProp('textAlign','right')">راست</button>
          <button class="seg-btn ${obj.textAlign === 'center' ? 'active' : ''}" onclick="setTextProp('textAlign','center')">وسط</button>
          <button class="seg-btn ${obj.textAlign === 'left' ? 'active' : ''}" onclick="setTextProp('textAlign','left')">چپ</button>
        </div>
      </div>
      <div class="prop-row">
        <label>رنگ متن</label>
        <div class="color-row">
          <input type="color" id="p-fill" value="${toHex(obj.fill)}">
        </div>
        <div class="swatch-presets">
          ${COLOR_SWATCHES.map(c => `<div class="swatch" style="background:${c}" onclick="setTextProp('fill','${c}')"></div>`).join('')}
        </div>
      </div>
      <div class="prop-row">
        <label>فاصله حروف <span class="range-val" id="v-ls">${obj.charSpacing || 0}</span></label>
        <input type="range" id="p-ls" min="-100" max="400" value="${obj.charSpacing || 0}">
      </div>
      <div class="prop-row">
        <label>ارتفاع خط <span class="range-val" id="v-lh">${obj.lineHeight || 1}</span></label>
        <input type="range" id="p-lh" min="0.5" max="3" step="0.05" value="${obj.lineHeight || 1}">
      </div>
      <div class="prop-row">
        <label>سایه متن</label>
        <div class="seg-group">
          <button class="seg-btn" onclick="setTextShadow('none')">بدون</button>
          <button class="seg-btn" onclick="setTextShadow('soft')">نرم</button>
          <button class="seg-btn" onclick="setTextShadow('hard')">قوی</button>
          <button class="seg-btn" onclick="setTextShadow('glow')">درخشان</button>
        </div>
      </div>
    `);
  }

  // ============ Image specific ============
  if (obj.type === 'image') {
    html += propSection('تصویر', `
      <div class="prop-row">
        <label>گردی گوشه‌ها <span class="range-val" id="v-rad">${getBorderRadius(obj)}</span></label>
        <input type="range" id="p-rad" min="0" max="500" value="${getBorderRadius(obj)}">
      </div>
      <div class="prop-row">
        <label>حاشیه</label>
        <input type="color" id="p-stroke" value="${toHex(obj.stroke || '#00e5ff')}">
      </div>
      <div class="prop-row">
        <label>ضخامت حاشیه <span class="range-val" id="v-sw">${obj.strokeWidth || 0}</span></label>
        <input type="range" id="p-sw" min="0" max="30" value="${obj.strokeWidth || 0}">
      </div>
      <div class="prop-row">
        <label>روشنایی <span class="range-val" id="v-br">${(obj.filters?.find(f => f.type === 'Brightness')?.brightness || 0).toFixed(2)}</span></label>
        <input type="range" id="p-br" min="-0.5" max="0.5" step="0.05" value="${obj.filters?.find(f => f.type === 'Brightness')?.brightness || 0}">
      </div>
      <div class="prop-row">
        <label>کنتراست <span class="range-val" id="v-ct">${(obj.filters?.find(f => f.type === 'Contrast')?.contrast || 0).toFixed(2)}</span></label>
        <input type="range" id="p-ct" min="-0.5" max="0.5" step="0.05" value="${obj.filters?.find(f => f.type === 'Contrast')?.contrast || 0}">
      </div>
      <div class="prop-row">
        <label>اشباع <span class="range-val" id="v-sat">${(obj.filters?.find(f => f.type === 'Saturation')?.saturation || 0).toFixed(2)}</span></label>
        <input type="range" id="p-sat" min="-1" max="1" step="0.05" value="${obj.filters?.find(f => f.type === 'Saturation')?.saturation || 0}">
      </div>
    `);
  }

  // ============ Shapes ============
  if (obj.type === 'rect' || obj.type === 'circle') {
    html += propSection('شکل', `
      <div class="prop-row">
        <label>رنگ پرکننده</label>
        <input type="color" id="p-fill" value="${toHex(obj.fill)}">
        <div class="swatch-presets">
          ${COLOR_SWATCHES.map(c => `<div class="swatch" style="background:${c}" onclick="setProp('fill','${c}')"></div>`).join('')}
        </div>
      </div>
      <div class="prop-row">
        <label>رنگ حاشیه</label>
        <input type="color" id="p-stroke" value="${toHex(obj.stroke || '#00e5ff')}">
      </div>
      <div class="prop-row">
        <label>ضخامت حاشیه <span class="range-val" id="v-sw">${obj.strokeWidth || 0}</span></label>
        <input type="range" id="p-sw" min="0" max="30" value="${obj.strokeWidth || 0}">
      </div>
      ${obj.type === 'rect' ? `
      <div class="prop-row">
        <label>گردی گوشه‌ها <span class="range-val" id="v-rad">${obj.rx || 0}</span></label>
        <input type="range" id="p-rad" min="0" max="200" value="${obj.rx || 0}">
      </div>` : ''}
    `);
  }

  if (obj.type === 'line') {
    html += propSection('خط', `
      <div class="prop-row">
        <label>رنگ</label>
        <input type="color" id="p-stroke" value="${toHex(obj.stroke)}">
      </div>
      <div class="prop-row">
        <label>ضخامت <span class="range-val" id="v-sw">${obj.strokeWidth || 1}</span></label>
        <input type="range" id="p-sw" min="1" max="40" value="${obj.strokeWidth || 1}">
      </div>
    `);
  }

  // ============ Appearance ============
  html += propSection('ظاهر', `
    <div class="prop-row">
      <label>شفافیت <span class="range-val" id="v-op">${Math.round((obj.opacity || 1) * 100)}٪</span></label>
      <input type="range" id="p-op" min="0" max="1" step="0.05" value="${obj.opacity || 1}">
    </div>
    <div class="prop-row">
      <div class="grid-2">
        <button class="btn-mini" onclick="toggleLock()" id="p-lock-btn">
          ${obj.lockMovementX ? '🔓 باز کردن' : '🔒 قفل'}
        </button>
        <button class="btn-mini danger" onclick="deleteSelected()">🗑️ حذف</button>
      </div>
    </div>
  `);

  body.innerHTML = html;
  attachPropListeners(obj);
}

function propSection(title, content) {
  return `
    <div class="prop-section">
      <div class="prop-section-head" onclick="this.parentElement.classList.toggle('collapsed')">
        <span>${title}</span>
        <span class="chev">▼</span>
      </div>
      <div class="prop-section-body">${content}</div>
    </div>
  `;
}

function getBorderRadius(obj) { return obj.rx || 0; }

function toHex(color) {
  if (!color) return '#000000';
  if (color.startsWith('#')) return color;
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return '#000000';
  return '#' + [m[1], m[2], m[3]].map(x => (+x).toString(16).padStart(2, '0')).join('');
}

function attachPropListeners(obj) {
  const $ = id => document.getElementById(id);
  const bind = (id, handler, evt = 'input') => {
    const el = $(id);
    if (el) el.addEventListener(evt, handler);
  };

  // Text
  bind('p-text', e => { obj.set('text', e.target.value); canvas.renderAll(); saveState(); });
  bind('p-font', e => { obj.set('fontFamily', e.target.value); canvas.renderAll(); saveState(); }, 'change');
  bind('p-fs', e => { obj.set('fontSize', +e.target.value); $('v-fs').textContent = e.target.value; canvas.renderAll(); saveState(); });
  bind('p-ls', e => { obj.set('charSpacing', +e.target.value); $('v-ls').textContent = e.target.value; canvas.renderAll(); saveState(); });
  bind('p-lh', e => { obj.set('lineHeight', +e.target.value); $('v-lh').textContent = e.target.value; canvas.renderAll(); saveState(); });
  bind('p-fill', e => { obj.set('fill', e.target.value); canvas.renderAll(); saveState(); });

  // Shared
  bind('p-stroke', e => { obj.set('stroke', e.target.value); canvas.renderAll(); saveState(); });
  bind('p-sw', e => { obj.set('strokeWidth', +e.target.value); $('v-sw').textContent = e.target.value; canvas.renderAll(); saveState(); });
  bind('p-rad', e => { const v = +e.target.value; $('v-rad').textContent = v; obj.set({ rx: v, ry: v }); canvas.renderAll(); saveState(); });
  bind('p-x', e => { obj.set('left', +e.target.value); obj.setCoords(); canvas.renderAll(); saveState(); });
  bind('p-y', e => { obj.set('top', +e.target.value); obj.setCoords(); canvas.renderAll(); saveState(); });
  bind('p-w', e => { obj.set('scaleX', +e.target.value / obj.width); canvas.renderAll(); saveState(); });
  bind('p-h', e => { obj.set('scaleY', +e.target.value / obj.height); canvas.renderAll(); saveState(); });
  bind('p-rot', e => { obj.set('angle', +e.target.value); $('v-rot').textContent = e.target.value + '°'; canvas.renderAll(); saveState(); });
  bind('p-op', e => { obj.set('opacity', +e.target.value); $('v-op').textContent = Math.round(+e.target.value * 100) + '٪'; canvas.renderAll(); saveState(); });

  // Image filters
  bind('p-br', e => {
    applyFilter(obj, 'Brightness', { brightness: +e.target.value });
    $('v-br').textContent = (+e.target.value).toFixed(2);
  });
  bind('p-ct', e => {
    applyFilter(obj, 'Contrast', { contrast: +e.target.value });
    $('v-ct').textContent = (+e.target.value).toFixed(2);
  });
  bind('p-sat', e => {
    applyFilter(obj, 'Saturation', { saturation: +e.target.value });
    $('v-sat').textContent = (+e.target.value).toFixed(2);
  });
}

function applyFilter(obj, type, options) {
  if (!obj.filters) obj.filters = [];
  const idx = obj.filters.findIndex(f => f.type === type);
  if (idx >= 0) obj.filters.splice(idx, 1);
  const FilterClass = fabric.Image.filters[type];
  if (FilterClass) obj.filters.push(new FilterClass(options));
  obj.applyFilters();
  canvas.renderAll();
}

function setTextProp(key, value) {
  const obj = canvas.getActiveObject();
  if (!obj) return;
  obj.set(key, value);
  canvas.renderAll();
  saveState();
  renderProperties();
}

function setProp(key, value) {
  const obj = canvas.getActiveObject();
  if (!obj) return;
  obj.set(key, value);
  canvas.renderAll();
  saveState();
  renderProperties();
}

function setTextShadow(type) {
  const obj = canvas.getActiveObject();
  if (!obj) return;
  const shadows = {
    none: null,
    soft: new fabric.Shadow({ color: 'rgba(0,0,0,0.5)', blur: 8, offsetX: 2, offsetY: 2 }),
    hard: new fabric.Shadow({ color: 'rgba(0,0,0,0.9)', blur: 0, offsetX: 4, offsetY: 4 }),
    glow: new fabric.Shadow({ color: 'rgba(0,229,255,0.8)', blur: 20, offsetX: 0, offsetY: 0 }),
  };
  obj.set('shadow', shadows[type] || null);
  canvas.renderAll();
  saveState();
}

// ============================================================
// Layers
// ============================================================
function renderLayers() {
  const list = document.getElementById('layers-list');
  const count = document.getElementById('layers-count');
  if (!list) return;
  const objects = canvas.getObjects();
  if (count) count.textContent = objects.length + ' المان';
  if (objects.length === 0) {
    list.innerHTML = '<div style="color:var(--muted);font-size:12px;text-align:center;padding:20px;">خالی</div>';
    return;
  }
  const active = canvas.getActiveObject();
  list.innerHTML = objects.slice().reverse().map((obj, i) => {
    const realIndex = objects.length - 1 - i;
    const sel = obj === active ? 'selected' : '';
    const name = obj.name || obj.type || 'المان';
    const locked = obj.lockMovementX ? '🔒' : '';
    return `
      <div class="layer-item ${sel}" onclick="selectObject(${realIndex})">
        <span class="ico-btn" onclick="event.stopPropagation(); toggleVisible(${realIndex})">${obj.visible === false ? '🚫' : '👁'}</span>
        <span class="name">${locked} ${name}</span>
      </div>
    `;
  }).join('');
}

function selectObject(index) {
  const obj = canvas.getObjects()[index];
  if (obj && !obj.lockMovementX) {
    canvas.setActiveObject(obj);
    canvas.renderAll();
  } else if (obj) {
    canvas.setActiveObject(obj);
    canvas.renderAll();
  }
}

function toggleVisible(index) {
  const obj = canvas.getObjects()[index];
  if (obj) {
    obj.visible = !obj.visible;
    canvas.renderAll();
    renderLayers();
  }
}

// ============================================================
// Actions
// ============================================================
function deleteSelected() {
  const objs = canvas.getActiveObjects();
  if (!objs.length) return;
  objs.forEach(o => canvas.remove(o));
  canvas.discardActiveObject();
  canvas.renderAll();
  saveState();
  showToast('حذف شد', 'info');
}

function duplicateSelected() {
  const obj = canvas.getActiveObject();
  if (!obj) return;
  obj.clone((clone) => {
    clone.set({ left: obj.left + 30, top: obj.top + 30 });
    canvas.add(clone);
    canvas.setActiveObject(clone);
    canvas.renderAll();
  });
}

function copySelected() {
  const obj = canvas.getActiveObject();
  if (!obj) return;
  obj.clone((c) => { clipboard = c; showToast('کپی شد', 'info'); });
}

function pasteClipboard() {
  if (!clipboard) return;
  clipboard.clone((c) => {
    c.set({ left: clipboard.left + 40, top: clipboard.top + 40 });
    canvas.add(c);
    canvas.setActiveObject(c);
    canvas.renderAll();
  });
}

function bringForward() { const o = canvas.getActiveObject(); if (o) { canvas.bringForward(o); canvas.renderAll(); saveState(); renderLayers(); } }
function sendBackward() { const o = canvas.getActiveObject(); if (o) { canvas.sendBackwards(o); canvas.renderAll(); saveState(); renderLayers(); } }
function bringToFront() { const o = canvas.getActiveObject(); if (o) { canvas.bringToFront(o); canvas.renderAll(); saveState(); renderLayers(); } }
function sendToBack() { const o = canvas.getActiveObject(); if (o) { canvas.sendToBack(o); canvas.renderAll(); saveState(); renderLayers(); } }

function centerH() { const o = canvas.getActiveObject(); if (!o) return; o.set('left', templateMeta.width / 2); o.set('originX', 'center'); o.setCoords(); canvas.renderAll(); saveState(); renderProperties(); }
function centerV() { const o = canvas.getActiveObject(); if (!o) return; o.set('top', templateMeta.height / 2); o.set('originY', 'center'); o.setCoords(); canvas.renderAll(); saveState(); renderProperties(); }
function resetRotation() { const o = canvas.getActiveObject(); if (o) { o.set('angle', 0); canvas.renderAll(); saveState(); renderProperties(); } }

function toggleLock() {
  const o = canvas.getActiveObject();
  if (!o) return;
  const locked = o.lockMovementX;
  o.set({
    lockMovementX: !locked, lockMovementY: !locked,
    lockScalingX: !locked, lockScalingY: !locked,
    lockRotation: !locked,
    selectable: true,
    hasControls: locked,
  });
  canvas.renderAll();
  renderProperties();
  renderLayers();
}

function resetAll() {
  if (!confirm('همه تغییرات پاک شوند؟')) return;
  undoStack = [];
  redoStack = [];
  canvas.clear();
  initCanvas();
  renderProperties();
  renderLayers();
}

// ============================================================
// Undo / Redo
// ============================================================
function saveState() {
  if (isRestoring) return;
  const json = JSON.stringify(canvas.toJSON(['name', 'rx', 'ry', 'lockMovementX']));
  if (undoStack[undoStack.length - 1] === json) return;
  undoStack.push(json);
  if (undoStack.length > 100) undoStack.shift();
  redoStack = [];
  updateUndoButtons();
  scheduleAutosave();
}

function undo() {
  if (undoStack.length < 2) return;
  redoStack.push(undoStack.pop());
  restoreState(undoStack[undoStack.length - 1]);
  updateUndoButtons();
}

function redo() {
  if (!redoStack.length) return;
  const next = redoStack.pop();
  undoStack.push(next);
  restoreState(next);
  updateUndoButtons();
}

function restoreState(json) {
  isRestoring = true;
  canvas.loadFromJSON(json, () => {
    canvas.renderAll();
    isRestoring = false;
    renderLayers();
    renderProperties();
    updateStatus();
  });
}

function updateUndoButtons() {
  const u = document.getElementById('btn-undo');
  const r = document.getElementById('btn-redo');
  if (u) u.disabled = undoStack.length < 2;
  if (r) r.disabled = redoStack.length === 0;
}

// ============================================================
// Autosave
// ============================================================
function scheduleAutosave() {
  if (!settings.autosave) return;
  clearTimeout(autosaveTimer);
  const ind = document.getElementById('save-indicator');
  const txt = document.getElementById('save-text');
  if (ind) ind.classList.add('saving');
  if (txt) txt.textContent = 'در حال ذخیره...';
  autosaveTimer = setTimeout(() => {
    try {
      localStorage.setItem(`banner-${templateId}`, JSON.stringify(canvas.toJSON(['name', 'rx', 'ry', 'lockMovementX'])));
      if (ind) ind.classList.remove('saving');
      if (txt) txt.textContent = 'ذخیره شد';
    } catch (e) {
      if (txt) txt.textContent = 'خطا در ذخیره';
    }
  }, 2000);
}

function saveProject() {
  try {
    localStorage.setItem(`banner-${templateId}`, JSON.stringify(canvas.toJSON(['name', 'rx', 'ry', 'lockMovementX'])));
    showToast('پروژه ذخیره شد', 'success');
  } catch (e) {
    showToast('خطا در ذخیره', 'error');
  }
}

function loadProject() {
  const saved = localStorage.getItem(`banner-${templateId}`);
  if (!saved) {
    showToast('پروژه ذخیره‌شده‌ای پیدا نشد', 'warning');
    return;
  }
  restoreState(saved);
  showToast('پروژه بازیابی شد', 'success');
}

function clearStorage() {
  if (!confirm('همه پروژه‌های ذخیره‌شده پاک شوند؟')) return;
  Object.keys(localStorage).filter(k => k.startsWith('banner-')).forEach(k => localStorage.removeItem(k));
  showToast('حافظه پاک شد', 'info');
}

// ============================================================
// Keyboard
// ============================================================
function handleKeyboard(e) {
  if (e.target.matches('input, textarea, select')) return;
  const ctrl = e.ctrlKey || e.metaKey;

  if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return; }
  if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); return; }
  if (ctrl && e.key === 'd') { e.preventDefault(); duplicateSelected(); return; }
  if (ctrl && e.key === 'c') { e.preventDefault(); copySelected(); return; }
  if (ctrl && e.key === 'v') { e.preventDefault(); pasteClipboard(); return; }
  if (ctrl && e.key === '0') { e.preventDefault(); fitToScreen(); return; }
  if (ctrl && e.key === 'a') {
    e.preventDefault();
    canvas.discardActiveObject();
    const sel = new fabric.ActiveSelection(canvas.getObjects(), { canvas });
    canvas.setActiveObject(sel);
    canvas.requestRenderAll();
    return;
  }

  const obj = canvas.getActiveObject();
  if (!obj) return;

  const step = e.shiftKey ? 10 : 1;
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (obj.isEditing) return;
    e.preventDefault();
    deleteSelected();
  } else if (e.key === 'ArrowLeft') { e.preventDefault(); obj.set('left', obj.left - step); obj.setCoords(); canvas.renderAll(); saveState(); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); obj.set('left', obj.left + step); obj.setCoords(); canvas.renderAll(); saveState(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); obj.set('top', obj.top - step); obj.setCoords(); canvas.renderAll(); saveState(); }
  else if (e.key === 'ArrowDown') { e.preventDefault(); obj.set('top', obj.top + step); obj.setCoords(); canvas.renderAll(); saveState(); }
  else if (e.key === 'PageUp') { e.preventDefault(); bringForward(); }
  else if (e.key === 'PageDown') { e.preventDefault(); sendBackward(); }
}

// ============================================================
// Context Menu
// ============================================================
function showContextMenu(e) {
  const obj = canvas.findTarget(e);
  if (!obj || obj.selectable === false) return;
  e.preventDefault();
  canvas.setActiveObject(obj);
  canvas.renderAll();
  const menu = document.getElementById('context-menu');
  menu.style.left = e.pageX + 'px';
  menu.style.top = e.pageY + 'px';
  menu.classList.add('show');
}

function hideContextMenu() {
  document.getElementById('context-menu').classList.remove('show');
}

// ============================================================
// Status Bar
// ============================================================
function updateStatus() {
  const obj = canvas.getActiveObject();
  const pos = document.getElementById('status-pos');
  const size = document.getElementById('status-size');
  const count = document.getElementById('status-count');
  if (obj) {
    pos.textContent = `${Math.round(obj.left)}, ${Math.round(obj.top)}`;
    size.textContent = `${Math.round(obj.width * obj.scaleX)}×${Math.round(obj.height * obj.scaleY)}`;
  } else {
    pos.textContent = '—';
    size.textContent = '—';
  }
  count.textContent = canvas.getObjects().length;
}

// ============================================================
// Settings
// ============================================================
function toggleSetting(key) {
  settings[key] = !settings[key];
  const sw = document.getElementById('sw-' + key);
  if (sw) sw.classList.toggle('on', settings[key]);
  localStorage.setItem('editor-settings', JSON.stringify(settings));

  if (key === 'grid') {
    document.getElementById('canvas-container').classList.toggle('grid-bg', settings.grid);
  }
  if (key === 'autosave') {
    const txt = document.getElementById('save-text');
    txt.textContent = settings.autosave ? 'ذخیره خودکار روشن' : 'ذخیره خودکار خاموش';
  }
}

// ============================================================
// Export
// ============================================================
function exportPNG() { doExport('png'); }
function exportJPEG() { doExport('jpeg'); }

function doExport(format) {
  canvas.discardActiveObject();
  canvas.renderAll();

  const oldZoom = canvas.getZoom();
  const oldW = canvas.getWidth();
  const oldH = canvas.getHeight();

  canvas.setZoom(1);
  canvas.setDimensions({ width: templateMeta.width, height: templateMeta.height });
  canvas.renderAll();

  const dataURL = canvas.toDataURL({
    format: format,
    quality: format === 'jpeg' ? 0.95 : 1,
    multiplier: 2,
  });

  canvas.setZoom(oldZoom);
  canvas.setDimensions({ width: oldW, height: oldH });
  canvas.renderAll();

  const a = document.createElement('a');
  a.href = dataURL;
  a.download = `banner-${Date.now()}.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('دانلود شد', 'success');
}

// ============================================================
// UI helpers
// ============================================================
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const t = document.createElement('div');
  t.className = 'toast-msg ' + type;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transition = 'opacity 0.3s';
    setTimeout(() => t.remove(), 300);
  }, 2200);
}

function showShortcuts() {
  document.getElementById('shortcuts-modal').classList.add('show');
}

function goBack() {
  if (confirm('از ویرایشگر خارج می‌شوی؟ تغییرات ذخیره شده‌اند.')) {
    window.location.href = '/#/banners';
  }
}

// Auto-load on start if exists
setTimeout(() => {
  const saved = localStorage.getItem(`banner-${templateId}`);
  if (saved && undoStack.length <= 2) {
    // فقط اگر کاربر کار جدیدی شروع نکرده
  }
}, 1000);