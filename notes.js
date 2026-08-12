// ============ NOTES — per-topic notes + save AI answers ============
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
    dayTitle(k) {
        if (k === 'general') return 'General / AI Chat';
        const n = parseInt(k);
        if (typeof WEEKS !== 'undefined') {
            for (const w of WEEKS) { const day = w.days.find(x => x.day === n); if (day) return 'Day ' + n + ': ' + day.title; }
        }
        return 'Day ' + k;
    },

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
        if (day) this.refreshLessonPanel(day); // if that lesson is open behind, keep it fresh
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
        const keys = Object.keys(data).sort((a, b) => {
            if (a === 'general') return 1;
            if (b === 'general') return -1;
            return parseInt(a) - parseInt(b);
        });
        let body;
        if (keys.length === 0) {
            body = '<p class="notes-empty">No notes yet. Add notes from any lesson, or save an AI answer from the AI tab.</p>';
        } else {
            body = keys.map(k => `<div class="notes-hub-group">
                <h4>${this.esc(this.dayTitle(k))} <span class="notes-count">${data[k].length}</span></h4>
                ${data[k].map(n => this.noteItemHtml(k, n)).join('')}
            </div>`).join('');
        }
        modal.innerHTML = `
            <div class="notes-hub-inner">
                <div class="notes-hub-head">
                    <h3><i class="fas fa-book-bookmark"></i> MY NOTES <span class="notes-count">${this.total()}</span></h3>
                    <button class="notes-hub-close" onclick="Notes.closeHub()"><i class="fas fa-times"></i></button>
                </div>
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
        .notes-hub-body{overflow-y:auto;padding:1rem 1.25rem;}
        .notes-hub-group{margin-bottom:1.25rem;}
        .notes-hub-group h4{font-size:0.75rem;color:var(--neon-cyan);margin-bottom:0.5rem;}
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
