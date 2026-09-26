// ============================================================
// app.js — v4.0 with Video Background + Scroll Reveal
// ============================================================

let currentTemplate = null;
let formData = { positions: {} };
let previewTimer = null;
let templatesLoaded = false;
let generatedTemplateId = null;

// ==================== Router ====================
function router() {
    const hash = window.location.hash || '#/';

    const sections = ['home-section', 'gallery-section', 'editor-section', 'ai-section'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    if (hash === '#/' || hash === '') {
        document.getElementById('home-section').classList.remove('hidden');
    } else if (hash === '#/banners') {
        document.getElementById('gallery-section').classList.remove('hidden');
        if (!templatesLoaded) loadTemplates();
    } else if (hash === '#/ai') {
        document.getElementById('ai-section').classList.remove('hidden');
        initAISection();
    } else if (hash.startsWith('#/editor/')) {
        const templateId = hash.split('/')[2];
        if (templateId) {
            window.location.href = `/editor.html?t=${templateId}`;
            return;
        }
    }

    updateNavActive();
}

window.addEventListener('hashchange', router);
document.addEventListener('DOMContentLoaded', router);

// ==================== Nav Active ====================
function updateNavActive() {
    const hash = window.location.hash || '#/';
    document.querySelectorAll('.nav-item').forEach(tab => {
        tab.classList.remove('active');
        const tabHash = tab.getAttribute('data-hash');
        if (tabHash === hash ||
            (tabHash === '#/' && (hash === '#/' || hash === '')) ||
            (tabHash === '#/banners' && hash.includes('banners')) ||
            (tabHash === '#/ai' && hash.includes('ai'))) {
            tab.classList.add('active');
        }
    });
}

// ==================== Toast ====================
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==================== Positions from iframe ====================
window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'positions') {
        formData.positions = e.data.positions;
    }
});

// ==================== Gallery ====================
async function loadTemplates() {
    try {
        const response = await fetch('/api/templates');
        const templates = await response.json();
        const grid = document.getElementById('templates-grid');
        grid.innerHTML = '';
        templatesLoaded = true;

        if (templates.length === 0) {
            grid.innerHTML = '<p style="color: var(--t400);">هیچ قالبی یافت نشد.</p>';
            return;
        }

        templates.forEach(t => {
            const card = document.createElement('div');
            card.className = 'template-card';
            const previewPath = `/templates/${t.id}/background.png`;
            const catLabel = t.category === 'ai' ? 'AI' : (t.category === 'motion' ? 'موشن' : 'خبری');
            const catClass = t.category === 'ai' ? 'ai' : '';
            card.innerHTML = `
                <div class="category-badge ${catClass}">${catLabel}</div>
                <div class="template-preview">
                    <img src="${previewPath}" alt="${t.name}"
                         onerror="this.parentElement.innerHTML='<div class=\\'preview-placeholder\\'>بدون پیش‌نمایش</div>'">
                </div>
                <h3>${t.name}</h3>
                <p>ابعاد: ${t.width} × ${t.height}</p>
                <button class="btn-select">انتخاب این قالب</button>
            `;
            card.onclick = () => { window.location.href = `/editor.html?t=${t.id}`; };
            grid.appendChild(card);
        });
    } catch (err) {
        console.error(err);
        showToast('خطا در دریافت لیست قالب‌ها', 'error');
    }
}

// ==================== Editor ====================
function openEditor(templateId) {
    window.location.href = `/editor.html?t=${templateId}`;
}

async function openEditorOld(templateId) {
    try {
        const response = await fetch(`/api/templates/${templateId}`);
        if (!response.ok) throw new Error('قالب پیدا نشد');
        currentTemplate = await response.json();
        buildForm(currentTemplate);
        setTimeout(refreshPreview, 150);
    } catch (err) {
        console.error(err);
        showToast('خطا در دریافت اطلاعات قالب', 'error');
    }
}

function buildForm(template) {
    const form = document.getElementById('dynamic-form');
    if (!form) return;
    form.innerHTML = '';
    formData = { positions: {} };

    template.fields.forEach(field => {
        const group = document.createElement('div');
        group.className = 'form-group';

        if (field.type === 'text' || field.type === 'image') {
            const label = document.createElement('label');
            label.textContent = field.label;
            const input = document.createElement('input');
            input.type = field.type === 'image' ? 'file' : 'text';
            input.name = field.key;
            if (field.type === 'image') input.accept = 'image/*';
            if (field.default && field.type === 'text') input.value = field.default;

            input.oninput = (e) => {
                if (field.type === 'text') {
                    formData[field.key] = e.target.value;
                    schedulePreviewRefresh();
                }
            };
            input.onchange = (e) => {
                if (field.type === 'image') {
                    formData[field.key] = e.target.files[0];
                    refreshPreview();
                }
            };

            if (field.type === 'text' && field.default) formData[field.key] = field.default;
            group.appendChild(label);
            group.appendChild(input);
            form.appendChild(group);

        } else if (field.type === 'array') {
            const label = document.createElement('label');
            label.textContent = field.label;
            group.appendChild(label);

            const listContainer = document.createElement('div');
            listContainer.id = `array-${field.key}`;

            const renderRows = () => {
                listContainer.innerHTML = '';
                const items = formData[field.key] || [];
                items.forEach((item, index) => {
                    const row = document.createElement('div');
                    row.className = 'news-row';
                    field.itemFields.forEach(subField => {
                        const input = document.createElement('input');
                        input.type = 'text';
                        input.placeholder = subField.label;
                        input.value = item[subField.key] || '';
                        input.oninput = (e) => {
                            formData[field.key][index][subField.key] = e.target.value;
                            schedulePreviewRefresh();
                        };
                        row.appendChild(input);
                    });
                    const removeBtn = document.createElement('button');
                    removeBtn.textContent = '✖';
                    removeBtn.className = 'btn-remove';
                    removeBtn.type = 'button';
                    removeBtn.onclick = () => {
                        formData[field.key].splice(index, 1);
                        renderRows();
                        refreshPreview();
                    };
                    row.appendChild(removeBtn);
                    listContainer.appendChild(row);
                });
            };

            formData[field.key] = field.default ? JSON.parse(JSON.stringify(field.default)) : [];
            renderRows();

            const addBtn = document.createElement('button');
            addBtn.textContent = '+ افزودن سطر جدید';
            addBtn.className = 'btn-add';
            addBtn.type = 'button';
            addBtn.onclick = () => {
                const newItem = {};
                field.itemFields.forEach(sf => newItem[sf.key] = '');
                formData[field.key].push(newItem);
                renderRows();
                refreshPreview();
            };
            group.appendChild(listContainer);
            group.appendChild(addBtn);
            form.appendChild(group);
        }
    });
}

function schedulePreviewRefresh() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(refreshPreview, 400);
}

async function refreshPreview() {
    const iframe = document.getElementById('preview-frame');
    if (!iframe || !currentTemplate) return;

    const data = new FormData();
    data.append('templateId', currentTemplate.id);

    const fieldsToSend = { ...formData };
    if (fieldsToSend.logo instanceof File) {
        data.append('logo', fieldsToSend.logo);
        delete fieldsToSend.logo;
    }
    data.append('fields', JSON.stringify(fieldsToSend));

    try {
        const res = await fetch('/api/preview', { method: 'POST', body: data });
        const html = await res.text();
        iframe.srcdoc = html;
        setTimeout(applyIframeScale, 300);
    } catch (err) { console.error(err); }
}

function applyIframeScale() {
    const iframe = document.getElementById('preview-frame');
    const wrapper = iframe && iframe.parentElement;
    if (!iframe || !wrapper || !currentTemplate) return;

    const posterW = currentTemplate.width || 1080;
    const posterH = currentTemplate.height || 1080;
    const wrapperW = wrapper.clientWidth;
    const wrapperH = wrapper.clientHeight;
    const scale = Math.min(wrapperW / posterW, wrapperH / posterH);

    iframe.style.width = posterW + 'px';
    iframe.style.height = posterH + 'px';
    iframe.style.transform = `scale(${scale})`;
    iframe.style.left = ((wrapperW - posterW * scale) / 2) + 'px';
    iframe.style.top = ((wrapperH - posterH * scale) / 2) + 'px';
}

// ==================== Editor Buttons (old) ====================
document.addEventListener('DOMContentLoaded', () => {
    const genBtn = document.getElementById('generate-btn');
    if (genBtn) {
        genBtn.onclick = async () => {
            if (!currentTemplate) return;
            const btn = genBtn;
            const spinner = document.getElementById('loading-spinner');
            btn.disabled = true;
            btn.textContent = 'در حال تولید...';
            if (spinner) spinner.classList.remove('hidden');

            const data = new FormData();
            data.append('templateId', currentTemplate.id);

            const fieldsToSend = { ...formData };
            if (fieldsToSend.logo instanceof File) {
                data.append('logo', fieldsToSend.logo);
                delete fieldsToSend.logo;
            }
            data.append('fields', JSON.stringify(fieldsToSend));
            data.append('format', 'png');

            try {
                const response = await fetch('/api/generate', { method: 'POST', body: data });
                if (!response.ok) throw new Error('خطا');
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `poster-${Date.now()}.png`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                showToast('تصویر با موفقیت دانلود شد', 'success');
            } catch (err) {
                showToast('خطا در تولید تصویر', 'error');
            } finally {
                btn.disabled = false;
                btn.textContent = '🚀 دانلود تصویر نهایی (PNG)';
                if (spinner) spinner.classList.add('hidden');
            }
        };
    }

    const resetBtn = document.getElementById('reset-positions-btn');
    if (resetBtn) {
        resetBtn.onclick = () => {
            formData.positions = {};
            refreshPreview();
            showToast('موقعیت‌ها بازنشانی شد', 'success');
        };
    }

    initAISection();
    const aiBtn = document.getElementById('ai-generate-btn');
    if (aiBtn) aiBtn.addEventListener('click', generateAIBackground);
    const aiUseBtn = document.getElementById('ai-use-btn');
    if (aiUseBtn) aiUseBtn.addEventListener('click', useGeneratedTemplate);

    initScrollReveal();
});

// ==================== AI ====================
function initAISection() {
    const catSelect = document.getElementById('ai-category');
    if (!catSelect) return;
    refreshCategoryList();
    updatePromptFileInfo();
}

function refreshCategoryList() {
    const catSelect = document.getElementById('ai-category');
    if (!catSelect) return;
    if (typeof getAllPromptCategories !== 'function') return;
    const allCats = getAllPromptCategories();
    const current = catSelect.value;
    catSelect.innerHTML = '';
    allCats.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.name;
        catSelect.appendChild(opt);
    });
    if (current && allCats.find(c => c.id === current)) catSelect.value = current;
    loadPromptsForCategory();
}

function loadPromptsForCategory() {
    const catId = document.getElementById('ai-category').value;
    if (typeof getAllPromptCategories !== 'function') return;
    const cat = getAllPromptCategories().find(c => c.id === catId);
    const list = document.getElementById('ai-prompt-list');
    if (!list) return;
    list.innerHTML = '<option value="">— پرامپت دلخواه —</option>';
    if (!cat) return;
    cat.items.forEach((p, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = p.name;
        list.appendChild(opt);
    });
}

function selectPrompt() {
    const catId = document.getElementById('ai-category').value;
    const idx = document.getElementById('ai-prompt-list').value;
    if (idx === '') return;
    if (typeof getAllPromptCategories !== 'function') return;
    const cat = getAllPromptCategories().find(c => c.id === catId);
    if (!cat) return;
    document.getElementById('ai-prompt').value = cat.items[+idx].prompt;
}

async function generateAIBackground() {
    const prompt = document.getElementById('ai-prompt').value.trim();
    const size = document.getElementById('ai-size').value;

    if (prompt.length < 10) {
        showToast('پرامپت حداقل ۱۰ کاراکتر باشد', 'error');
        return;
    }

    const btn = document.getElementById('ai-generate-btn');
    const loading = document.getElementById('ai-loading');
    const previewBox = document.getElementById('ai-preview-box');
    const useBtn = document.getElementById('ai-use-btn');

    btn.disabled = true;
    btn.textContent = 'در حال تولید... (ممکن است ۳۰ ثانیه طول بکشد)';
    if (loading) loading.classList.remove('hidden');
    if (useBtn) useBtn.classList.add('hidden');
    previewBox.innerHTML = '<p class="text-muted">در حال تولید تصویر...</p>';

    try {
        const res = await fetch('/api/ai/generate-background', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, size }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error || data.details || 'خطای ناشناخته');
        }

        generatedTemplateId = data.templateId;
        previewBox.innerHTML = `<img src="${data.previewUrl}" style="max-width:100%;border-radius:10px">`;
        if (useBtn) useBtn.classList.remove('hidden');
        showToast('تصویر با موفقیت تولید شد!', 'success');

    } catch (err) {
        console.error(err);
        previewBox.innerHTML = `<p style="color:var(--error)">خطا: ${err.message}</p>`;
        showToast('خطا در تولید: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '🎨 تولید تصویر';
        if (loading) loading.classList.add('hidden');
    }
}

function useGeneratedTemplate() {
    if (!generatedTemplateId) return;
    window.location.href = `/editor.html?t=${generatedTemplateId}`;
}

// ==================== Prompt Loader ====================
function loadPromptFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (typeof parsePromptFile !== 'function') {
        showToast('ماژول بارگذاری پرامپت یافت نشد', 'error');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const categories = parsePromptFile(e.target.result, file.name);
            if (!categories.length || categories.every(c => c.items.length === 0)) {
                throw new Error('هیچ پرامپتی در فایل پیدا نشد');
            }
            saveCustomPrompts(categories);
            refreshCategoryList();
            updatePromptFileInfo();
            const total = categories.reduce((sum, c) => sum + c.items.length, 0);
            showToast(`✅ ${total} پرامپت در ${categories.length} دسته بارگذاری شد`, 'success');
        } catch (err) {
            console.error(err);
            showToast('خطا در خواندن فایل: ' + err.message, 'error');
        }
    };
    reader.readAsText(file);
}

function clearCustomPromptsUI() {
    if (!confirm('همه پرامپت‌های سفارشی حذف شوند؟')) return;
    if (typeof clearCustomPrompts === 'function') clearCustomPrompts();
    refreshCategoryList();
    updatePromptFileInfo();
    const pf = document.getElementById('prompt-file');
    if (pf) pf.value = '';
    showToast('پرامپت‌های سفارشی حذف شدند', 'info');
}

function updatePromptFileInfo() {
    const info = document.getElementById('prompt-file-info');
    if (!info) return;
    if (typeof getCustomPrompts !== 'function') return;
    const custom = getCustomPrompts();
    if (custom.length === 0) {
        info.textContent = 'هیچ فایل سفارشی بارگذاری نشده. از پرامپت‌های پیش‌فرض استفاده می‌شود.';
        info.style.color = 'var(--t400)';
    } else {
        const total = custom.reduce((sum, c) => sum + c.items.length, 0);
        info.textContent = `✅ ${total} پرامپت سفارشی در ${custom.length} دسته بارگذاری شده`;
        info.style.color = 'var(--e500)';
    }
}

// ==================== Scroll Reveal ====================
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    reveals.forEach(el => observer.observe(el));
}

// ==================== Pause Video When Tab Hidden ====================
document.addEventListener('visibilitychange', () => {
    const video = document.querySelector('.bg-video');
    if (!video) return;
    if (document.hidden) video.pause();
    else video.play().catch(() => {});
});

// ==================== Auto-play Video Fallback ====================
document.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('.bg-video');
    if (video) {
        video.play().catch((err) => {
            console.log('Autoplay blocked:', err);
        });
    }
});