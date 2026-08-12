// ============ NOTES — per-topic notes + save AI answers + export/import ============
// Self-contained: hooks into LessonExperience and TUTOR at runtime.
// Storage: localStorage['sysbreach_notes'] = { "<dayNum|general>": [ {id,text,source,ts} ] }

const Notes = {
    KEY: 'sysbreach_notes',
    observer: null,

    // ---------- storage ----------
    _all() { try { return JSON.parse(localStorage.getItem(this.KEY) || '{}'); } catch (e) { return {}; } },
    _write(d) { localStorage.setItem(this.KEY, JSON.stringify(d)); },
    key(dayNum) { return dayNum ? String(dayNum) : 'general'; },
    forDay(dayNum) { return this._all()[this.key(dayNum)] || []; },
    add(dayNum, text, source) {
        text = (text || '').trim();
        if (!text) return;
        const d = this._all(), k = this.key(dayNum);
        if (!d[k]) d[k] = [];
        d[k].push({ id: 'n' + Date.now() + Math.random().toString(36).slice(2, 6), text, source: source || 'manual', ts: Date.now() });
        this._write(d);
    },
    remove(dayNum, id) {
        const d = this._all(), k = this.key(dayNum);
        if (!d[k]) return;
        d[k] = d[k].filter(n => n.id !== id);
        if (d[k].length === 0) delete d[k];
        this._write(d);
    },
    total() { const d = this._all(); return Object.values(d).reduce((s, a) => s + a.length, 0); },

    esc(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); },
    dayTitle(k) { return this.weekAndDay(k).title; },
    weekAndDay(k) {
        if (k === 'general') return { week: null, title: 'General / AI Chat' };
        const n = parseInt(k);
        if (typeof WEEKS !== 'undefined') {
            for (const w of WEEKS) {
                const d = w.days.find(x => x.day === n);
                if (d) return { week: 'Week ' + w.id + ': ' + w.title, title: 'Day ' + n + ': ' + d.title };
            }
        }
        return { week: null, title: 'Day ' + k };
    },
    sortedKeys(data) {
        return Object.keys(data).sort((a, b) => {
            if (a === 'general') return 1;
            if (b === 'general') return -1;
            return parseInt(a) - parseInt(b);
        });
    },
    fmtDate(ts) { try { return new Date(ts).toLocaleString(); } catch (e) { return ''; } },

    // ---------- shared note item ----------
    noteItemHtml(dayKey, n) {
        const tag = n.source === 'ai'
            ? '<span class="notes-tag ai"><i class="fas fa-robot"></i> AI</span>'
            : '<span class="notes-tag"><i class="fas fa-pen"></i> Note</span>';
        return `<div class="notes-item">
            <div class="notes-item-top">${tag}<button class="notes-del" onclick="Notes.delNote('${dayKey}','${n.id}')" title="Delete"><i class="fas fa-trash"></i></button></div>
            <div class="notes-item-text">${this.esc(n.text)}</div>
        </div>`;
    },
    delNote(dayKey, id) {
        const dayNum = dayKey === 'general' ? null : parseInt(dayKey);
        this.remove(dayNum, id);
        this.refreshLessonPanel(dayNum);
        const hub = document.getElementById('notes-hub');
        if (hub && hub.classList.contains('open')) this.openHub();
    },

    // ---------- lessons ----------
    patchLessons() {
        if (typeof LessonExperience === 'undefined') return;
        const self = this;
        const orig = LessonExperience.renderSection;
        LessonExperience.renderSection = function () {
            orig.apply(this, arguments);
            self.renderLessonPanel(this.dayNum);
        };
    },
    renderLessonPanel(dayNum) {
        const container = document.getElementById('lesson-content');
        if (!container) return;
        const key = this.key(dayNum);
        const notes = this.forDay(dayNum);
        const panel = document.createElement('div');
        panel.className = 'notes-panel';
        panel.innerHTML = `
            <div class="notes-panel-head">
                <span><i class="fas fa-book-bookmark"></i> MY NOTES <span class="notes-count">${notes.length}</span></span>
                <button class="notes-viewall" onclick="Notes.openHub()">View all</button>
            </div>
            <div class="notes-list">${notes.length ? notes.map(n => this.noteItemHtml(key, n)).join('') : '<p class="notes-empty">No notes yet. Jot down anything you want to remember for this topic.</p>'}</div>
            <div class="notes-add">
                <textarea id="notes-input-${dayNum}" placeholder="Write a note for this topic..."></textarea>
                <button class="notes-add-btn" onclick="Notes.addFromLesson(${dayNum})"><i class="fas fa-plus"></i> Add note</button>
            </div>`;
        container.appendChild(panel);
    },
    refreshLessonPanel(dayNum) {
        const container = document.getElementById('lesson-content');
        if (!container) return;
        const old = container.querySelector('.notes-panel');
        if (old) old.remove();
        this.renderLessonPanel(dayNum);
    },
    addFromLesson(dayNum) {
        const ta = document.getElementById('notes-input-' + dayNum);
        if (!ta) return;
        this.add(dayNum, ta.value, 'manual');
        ta.value = '';
        this.refreshLessonPanel(dayNum);
    },

    // ---------- tutor (save AI answers) ----------
    patchTutor() {
        if (typeof TUTOR === 'undefined') return;
        const self = this;
        const origShell = TUTOR.renderShell;
        TUTOR.renderShell = function () { origShell.apply(this, arguments); self.watchTutor(); };
        const origAdd = TUTOR.addBubble;
        TUTOR.addBubble = function (role, html) {
            const inner = origAdd.apply(this, arguments);
            if (role === 'assistant' && /tutor-typing/.test(html)) inner.dataset.answer = '1';
            return inner;
        };
    },
    watchTutor() {
        const box = document.getElementById('tutor-messages');
        if (!box || box.dataset.notesWatched) return;
        box.dataset.notesWatched = '1';
        const self = this;
        const scan = () => {
            box.querySelectorAll('.tutor-bubble-inner[data-answer="1"]').forEach(inner => {
                if (inner.querySelector('.tutor-typing')) return;
                if (inner.querySelector('.notes-save-inline')) return;
                if (!inner.textContent.trim()) return;
                const btn = document.createElement('button');
                btn.className = 'notes-save-inline';
                btn.innerHTML = '<i class="fas fa-bookmark"></i> Save to notes';
                btn.onclick = () => self.saveAiAnswer(inner, btn);
                inner.appendChild(btn);
            });
        };
        this.observer = new MutationObserver(scan);
        this.observer.observe(box, { childList: true, subtree: true, characterData: true });
    },
    saveAiAnswer(inner, btn) {
        const clone = inner.cloneNode(true);
        clone.querySelectorAll('.notes-save-inline').forEach(b => b.remove());
        const text = (clone.innerText || clone.textContent || '').trim();
        const day = (typeof TUTOR !== 'undefined') ? TUTOR.contextDay : null;
        this.add(day, text, 'ai');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-check"></i> Saved' + (day ? (' to Day ' + day) : ' (general)');
            btn.classList.add('saved');
            btn.disabled = true;
        }
        if (day) this.refreshLessonPanel(day);
    },

    // ---------- export: Markdown (for reading) ----------
    exportMarkdown() {
        const data = this._all();
        const keys = this.sortedKeys(data);
        const now = new Date();
        let out = '# SysBreach — My System Design Notes\n\n';
        out += '_Exported: ' + now.toLocaleString() + '_  \n';
        out += '**Total notes:** ' + this.total() + '\n';
        if (keys.length === 0) { out += '\n_No notes saved yet._\n'; return out; }
        keys.forEach(k => {
            const meta = this.weekAndDay(k);
            out += '\n\n---\n\n';
            out += '## ' + meta.title + '\n';
            if (meta.week) out += '*' + meta.week + '*\n';
            out += '\n';
            data[k].forEach((n, i) => {
                const label = n.source === 'ai' ? 'AI Answer' : 'My Note';
                out += '### ' + (i + 1) + '. ' + label + '  \n';
                out += '_saved ' + this.fmtDate(n.ts) + '_\n\n';
                out += n.text.trim() + '\n\n';
            });
        });
        out += '\n---\n\n_Generated by SysBreach — System Design Academy_\n';
        return out;
    },
    download() {
        if (this.total() === 0) { alert('No notes to download yet.'); return; }
        this._save(this.exportMarkdown(), 'md', 'text/markdown;charset=utf-8');
    },

    // ---------- backup / import: JSON (lossless, for device transfer) ----------
    exportBackup() {
        if (this.total() === 0) { alert('No notes to back up yet.'); return; }
        const payload = { app: 'SysBreach', type: 'notes-backup', version: 1, exportedAt: new Date().toISOString(), notes: this._all() };
        this._save(JSON.stringify(payload, null, 2), 'json', 'application/json', 'backup-');
    },
    importBackup() {
        let input = document.getElementById('notes-import-input');
        if (!input) {
            input = document.createElement('input');
            input.type = 'file';
            input.id = 'notes-import-input';
            input.accept = '.json,application/json';
            input.style.display = 'none';
            input.addEventListener('change', e => {
                const file = e.target.files && e.target.files[0];
                if (file) this._readImport(file);
                input.value = '';
            });
            document.body.appendChild(input);
        }
        input.click();
    },
    _readImport(file) {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const parsed = JSON.parse(reader.result);
                const incoming = (parsed && parsed.notes && typeof parsed.notes === 'object') ? parsed.notes : parsed;
                if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) throw new Error('shape');
                const res = this._merge(incoming);
                alert('Import complete: ' + res.added + ' new note' + (res.added === 1 ? '' : 's') + ' added'
                    + (res.skipped ? (', ' + res.skipped + ' already present (skipped)') : '') + '.');
                this.openHub();
                const c = document.getElementById('lesson-content');
                if (c && c.querySelector('.notes-panel') && typeof LessonExperience !== 'undefined')
                    this.refreshLessonPanel(LessonExperience.dayNum);
            } catch (err) {
                alert('Could not import that file. Pick a SysBreach notes backup (.json) exported from this app.');
            }
        };
        reader.onerror = () => alert('Could not read the file.');
        reader.readAsText(file);
    },
    _merge(incoming) {
        const data = this._all();
        let added = 0, skipped = 0;
        Object.keys(incoming).forEach(k => {
            const arr = incoming[k];
            if (!Array.isArray(arr)) return;
            if (!data[k]) data[k] = [];
            const ids = new Set(data[k].map(n => n.id));
            arr.forEach(n => {
                if (!n || typeof n.text !== 'string' || !n.text.trim()) return;
                if (n.id && ids.has(n.id)) { skipped++; return; }
                const id = n.id || ('n' + Date.now() + Math.random().toString(36).slice(2, 6));
                data[k].push({
                    id: id,
                    text: n.text,
                    source: n.source === 'ai' ? 'ai' : 'manual',
                    ts: typeof n.ts === 'number' ? n.ts : Date.now()
                });
                ids.add(id);
                added++;
            });
            if (data[k].length === 0) delete data[k];
        });
        this._write(data);
        return { added: added, skipped: skipped };
    },

    // shared file-saver
    _save(text, ext, mime, prefix) {
        const blob = new Blob([text], { type: mime });
        const url = URL.createObjectURL(blob);
        const d = new Date(); const pad = x => String(x).padStart(2, '0');
        const fname = 'sysbreach-notes-' + (prefix || '') + d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + '.' + ext;
        const a = document.createElement('a');
        a.href = url; a.download = fname;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1500);
    },

    // ---------- global hub ----------
    addFab() {
        if (document.getElementById('notes-fab')) return;
        const fab = document.createElement('button');
        fab.id = 'notes-fab';
        fab.className = 'notes-fab';
        fab.title = 'My Notes';
        fab.innerHTML = '<i class="fas fa-book-bookmark"></i>';
        fab.onclick = () => this.openHub();
        document.body.appendChild(fab);
    },
    openHub() {
        let modal = document.getElementById('notes-hub');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'notes-hub';
            modal.className = 'notes-hub';
            document.body.appendChild(modal);
        }
        const data = this._all();
        const keys = this.sortedKeys(data);
        let body;
        if (keys.length === 0) {
            body = '<p class="notes-empty">No notes yet. Add notes from any lesson, save an AI answer from the AI tab, or Import a backup below.</p>';
        } else {
            body = keys.map(k => {
                const meta = this.weekAndDay(k);
                return `<div class="notes-hub-group">
                    <h4>${this.esc(meta.title)} <span class="notes-count">${data[k].length}</span></h4>
                    ${meta.week ? `<div class="notes-hub-week">${this.esc(meta.week)}</div>` : ''}
                    ${data[k].map(n => this.noteItemHtml(k, n)).join('')}
                </div>`;
            }).join('');
        }
        const tools = [];
        if (this.total() > 0) {
            tools.push('<button class="notes-tool-btn" onclick="Notes.download()"><i class="fas fa-file-lines"></i> Download .md</button>');
            tools.push('<button class="notes-tool-btn" onclick="Notes.exportBackup()"><i class="fas fa-download"></i> Backup .json</button>');
        }
        tools.push('<button class="notes-tool-btn" onclick="Notes.importBackup()"><i class="fas fa-upload"></i> Import backup</button>');
        modal.innerHTML = `
            <div class="notes-hub-inner">
                <div class="notes-hub-head">
                    <h3><i class="fas fa-book-bookmark"></i> MY NOTES <span class="notes-count">${this.total()}</span></h3>
                    <button class="notes-hub-close" onclick="Notes.closeHub()"><i class="fas fa-times"></i></button>
                </div>
                <div class="notes-hub-toolbar">${tools.join('')}</div>
                <div class="notes-hub-body">${body}</div>
            </div>`;
        modal.classList.add('open');
    },
    closeHub() { const m = document.getElementById('notes-hub'); if (m) m.classList.remove('open'); },

    // ---------- styles ----------
    injectStyles() {
        if (document.getElementById('notes-styles')) return;
        const css = `
        .notes-panel{margin:1.5rem 0 0;padding:1rem;background:var(--bg-secondary);border:1px solid var(--neon-purple);border-radius:14px;}
        .notes-panel-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;}
        .notes-panel-head span{font-family:var(--font-display);font-size:0.7rem;letter-spacing:1px;color:var(--neon-purple);}
        .notes-count{background:var(--neon-purple);color:var(--bg-primary);border-radius:10px;padding:0 0.4rem;font-size:0.65rem;margin-left:0.25rem;}
        .notes-viewall{background:none;border:1px solid var(--border-color);color:var(--text-secondary);border-radius:8px;padding:0.25rem 0.6rem;font-size:0.62rem;cursor:pointer;font-family:var(--font-mono);}
        .notes-viewall:hover{border-color:var(--neon-cyan);color:var(--neon-cyan);}
        .notes-empty{font-size:0.72rem;color:var(--text-dim);line-height:1.5;padding:0.25rem 0;}
        .notes-item{background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.6rem 0.75rem;margin-bottom:0.5rem;}
        .notes-item-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;}
        .notes-tag{font-size:0.58rem;color:var(--neon-cyan);letter-spacing:1px;}
        .notes-tag.ai{color:var(--neon-purple);}
        .notes-del{background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:0.7rem;}
        .notes-del:hover{color:var(--error);}
        .notes-item-text{font-size:0.78rem;color:var(--text-primary);line-height:1.5;white-space:pre-wrap;word-wrap:break-word;}
        .notes-add{margin-top:0.5rem;}
        .notes-add textarea{width:100%;min-height:52px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:8px;padding:0.55rem 0.7rem;color:var(--text-primary);font-family:var(--font-mono);font-size:0.78rem;resize:vertical;outline:none;}
        .notes-add textarea:focus{border-color:var(--neon-purple);}
        .notes-add-btn{margin-top:0.5rem;background:rgba(191,0,255,0.12);border:1px solid var(--neon-purple);color:var(--neon-purple);border-radius:8px;padding:0.45rem 0.9rem;font-size:0.72rem;font-family:var(--font-mono);cursor:pointer;}
        .notes-add-btn:hover{box-shadow:0 0 10px rgba(191,0,255,0.3);}
        .notes-save-inline{display:inline-flex;align-items:center;gap:0.35rem;margin-top:0.6rem;background:rgba(191,0,255,0.1);border:1px solid var(--neon-purple);color:var(--neon-purple);border-radius:16px;padding:0.3rem 0.75rem;font-size:0.65rem;font-family:var(--font-mono);cursor:pointer;}
        .notes-save-inline:hover{box-shadow:0 0 8px rgba(191,0,255,0.3);}
        .notes-save-inline.saved{border-color:var(--neon-green);color:var(--neon-green);background:rgba(0,255,65,0.1);cursor:default;}
        .notes-fab{position:fixed;bottom:5.5rem;right:1rem;width:48px;height:48px;border-radius:50%;background:var(--bg-card);border:1px solid var(--neon-purple);color:var(--neon-purple);font-size:1.1rem;cursor:pointer;z-index:900;box-shadow:0 0 15px rgba(191,0,255,0.35);display:flex;align-items:center;justify-content:center;}
        .notes-fab:active{transform:scale(0.9);}
        .notes-hub{position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:1500;display:none;align-items:center;justify-content:center;padding:1rem;}
        .notes-hub.open{display:flex;animation:fadeIn 0.2s ease;}
        .notes-hub-inner{width:100%;max-width:560px;max-height:85vh;display:flex;flex-direction:column;background:var(--bg-secondary);border:1px solid var(--neon-purple);border-radius:16px;overflow:hidden;}
        .notes-hub-head{display:flex;justify-content:space-between;align-items:center;padding:1rem 1.25rem;border-bottom:1px solid var(--border-color);}
        .notes-hub-head h3{font-family:var(--font-display);font-size:0.8rem;letter-spacing:1px;color:var(--neon-purple);}
        .notes-hub-close{background:none;border:none;color:var(--text-secondary);font-size:1.1rem;cursor:pointer;}
        .notes-hub-close:hover{color:var(--neon-cyan);}
        .notes-hub-toolbar{display:flex;flex-wrap:wrap;gap:0.5rem;padding:0.75rem 1.25rem;border-bottom:1px solid var(--border-color);}
        .notes-tool-btn{display:inline-flex;align-items:center;gap:0.35rem;background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-secondary);border-radius:8px;padding:0.4rem 0.7rem;font-size:0.65rem;font-family:var(--font-mono);cursor:pointer;}
        .notes-tool-btn:hover{border-color:var(--neon-cyan);color:var(--neon-cyan);}
        .notes-hub-body{overflow-y:auto;padding:1rem 1.25rem;}
        .notes-hub-group{margin-bottom:1.25rem;}
        .notes-hub-group h4{font-size:0.75rem;color:var(--neon-cyan);margin-bottom:0.15rem;}
        .notes-hub-week{font-size:0.6rem;color:var(--text-dim);margin-bottom:0.5rem;letter-spacing:0.5px;}
        `;
        const el = document.createElement('style');
        el.id = 'notes-styles';
        el.textContent = css;
        document.head.appendChild(el);
    },

    init() {
        this.injectStyles();
        this.patchLessons();
        this.patchTutor();
    }
};

// Bootstrap
Notes.init();
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(() => Notes.addFab(), 2900));
} else {
    setTimeout(() => Notes.addFab(), 500);
}
