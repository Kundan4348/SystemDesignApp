// ============ DESIGN CANVAS — interactive node diagrams (Drawflow) ============
// Self-contained LAB module. Loads Drawflow from CDN on demand.
// Injects its own lab cards + a full-screen canvas overlay. Touches nothing else.

const DesignCanvas = {
    editor: null,
    loaded: false,
    loading: false,
    _cbs: [],
    mode: 'free',
    addCount: 0,
    curChallenge: null,

    components: {
        client:  { label: 'Client',        icon: 'fa-mobile-alt',    color: '#00f0ff' },
        lb:      { label: 'Load Balancer',  icon: 'fa-scale-balanced',color: '#ff6600' },
        api:     { label: 'API Server',     icon: 'fa-server',        color: '#00ff41' },
        cache:   { label: 'Cache (Redis)',  icon: 'fa-bolt',          color: '#ffd000' },
        db:      { label: 'Database',       icon: 'fa-database',      color: '#bf00ff' },
        queue:   { label: 'Message Queue',  icon: 'fa-stream',        color: '#ff6600' },
        cdn:     { label: 'CDN',            icon: 'fa-globe',         color: '#ff006e' },
        storage: { label: 'Object Storage', icon: 'fa-cloud',         color: '#ff006e' },
        search:  { label: 'Search Index',   icon: 'fa-magnifying-glass', color: '#00f0ff' },
        worker:  { label: 'Worker',         icon: 'fa-gears',         color: '#00ff41' }
    },

    challenges: [
        {
            id: 'url', title: 'URL Shortener',
            brief: 'Shorten long URLs and redirect. Read-heavy (10:1). Build the request path.',
            expect: ['client', 'lb', 'api', 'cache', 'db'],
            nodes: [
                { type: 'client', x: 40,  y: 160 },
                { type: 'lb',     x: 250, y: 160 },
                { type: 'api',    x: 470, y: 160 },
                { type: 'cache',  x: 700, y: 70  },
                { type: 'db',     x: 700, y: 250 }
            ],
            conns: [[0, 1], [1, 2], [2, 3], [2, 4]]
        },
        {
            id: 'feed', title: 'Twitter / News Feed',
            brief: 'Post tweets, follow users, view a timeline. Read-heavy with fan-out. Include a queue for fan-out and a cache for feeds.',
            expect: ['client', 'lb', 'api', 'queue', 'cache', 'db'],
            nodes: [
                { type: 'client', x: 40,  y: 180 },
                { type: 'lb',     x: 240, y: 180 },
                { type: 'api',    x: 440, y: 180 },
                { type: 'db',     x: 660, y: 300 },
                { type: 'queue',  x: 660, y: 60  },
                { type: 'cache',  x: 860, y: 60  }
            ],
            conns: [[0, 1], [1, 2], [2, 3], [2, 4], [4, 5]]
        },
        {
            id: 'chat', title: 'Chat System',
            brief: 'Real-time 1:1 + group messaging. WebSocket to chat servers, cache for routing, durable store, push for offline.',
            expect: ['client', 'api', 'cache', 'queue', 'db'],
            nodes: [
                { type: 'client', x: 40,  y: 180 },
                { type: 'api',    x: 280, y: 180 },
                { type: 'cache',  x: 520, y: 60  },
                { type: 'db',     x: 520, y: 300 },
                { type: 'queue',  x: 760, y: 180 }
            ],
            conns: [[0, 1], [1, 2], [1, 3], [1, 4]]
        }
    ],

    // ---------- bootstrap ----------
    init() {
        this.injectStyles();
        this.injectLabSection();
    },
    injectLabSection() {
        const lab = document.getElementById('lab-content');
        if (!lab || document.getElementById('dc-lab-section')) return;
        const sec = document.createElement('div');
        sec.className = 'lab-section';
        sec.id = 'dc-lab-section';
        sec.innerHTML = `
            <h3><i class="fas fa-diagram-project" style="color:var(--neon-pink)"></i> DESIGN CANVAS</h3>
            <div class="lab-card" onclick="DesignCanvas.open('free')">
                <i class="fas fa-pen-ruler"></i>
                <div><h4>Interactive Design Canvas</h4><p>Drag components, connect them, pan & zoom — whiteboard your architecture</p></div>
            </div>
            <div class="lab-card" onclick="DesignCanvas.open('challenge')">
                <i class="fas fa-trophy"></i>
                <div><h4>Build-the-Architecture Challenges</h4><p>Given a problem, build it, then reveal the reference solution</p></div>
            </div>`;
        lab.appendChild(sec);
    },

    // ---------- CDN loader ----------
    loadLib(cb) {
        if (window.Drawflow) { cb(true); return; }
        this._cbs.push(cb);
        if (this.loading) return;
        this.loading = true;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/drawflow@0.0.60/dist/drawflow.min.css';
        document.head.appendChild(link);
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/drawflow@0.0.60/dist/drawflow.min.js';
        s.onload = () => { this.loading = false; const cbs = this._cbs; this._cbs = []; cbs.forEach(f => f(true)); };
        s.onerror = () => { this.loading = false; const cbs = this._cbs; this._cbs = []; cbs.forEach(f => f(false)); };
        document.head.appendChild(s);
    },

    // ---------- overlay ----------
    buildOverlay() {
        if (document.getElementById('dc-overlay')) return;
        const ov = document.createElement('div');
        ov.id = 'dc-overlay';
        ov.className = 'dc-overlay';
        ov.innerHTML = `
            <div class="dc-topbar">
                <span class="dc-title"><i class="fas fa-diagram-project"></i> <span id="dc-title-text">DESIGN CANVAS</span></span>
                <div class="dc-topbtns">
                    <button class="dc-btn" onclick="DesignCanvas.zoom(1)" title="Zoom in"><i class="fas fa-plus"></i></button>
                    <button class="dc-btn" onclick="DesignCanvas.zoom(-1)" title="Zoom out"><i class="fas fa-minus"></i></button>
                    <button class="dc-btn" onclick="DesignCanvas.simulate()" title="Animate a request"><i class="fas fa-play"></i> Simulate</button>
                    <button class="dc-btn" onclick="DesignCanvas.clear()" title="Clear canvas"><i class="fas fa-trash"></i></button>
                    <button class="dc-btn close" onclick="DesignCanvas.close()"><i class="fas fa-times"></i></button>
                </div>
            </div>
            <div id="dc-challenge-bar" class="dc-challenge-bar" style="display:none;">
                <select id="dc-challenge-select" onchange="DesignCanvas.loadChallenge(this.value)"></select>
                <button class="dc-btn" onclick="DesignCanvas.checkChallenge()"><i class="fas fa-circle-check"></i> Check</button>
                <button class="dc-btn" onclick="DesignCanvas.revealChallenge()"><i class="fas fa-eye"></i> Reveal solution</button>
            </div>
            <div id="dc-brief" class="dc-brief" style="display:none;"></div>
            <div class="dc-main">
                <div class="dc-palette" id="dc-palette"></div>
                <div class="dc-canvas-wrap"><div id="dc-drawflow"></div></div>
            </div>
            <div id="dc-toast" class="dc-toast"></div>
            <div id="dc-loading" class="dc-loading" style="display:none;">Loading canvas library…</div>`;
        document.body.appendChild(ov);
        this.buildPalette();
        this.wireDrop();
    },
    buildPalette() {
        const p = document.getElementById('dc-palette');
        p.innerHTML = '<div class="dc-palette-title">COMPONENTS</div>' +
            Object.keys(this.components).map(type => {
                const c = this.components[type];
                return `<div class="dc-palette-item" draggable="true" data-type="${type}"
                    style="--dc-c:${c.color}"
                    ondragstart="event.dataTransfer.setData('node','${type}')"
                    onclick="DesignCanvas.tapAdd('${type}')">
                    <i class="fas ${c.icon}"></i><span>${c.label}</span></div>`;
            }).join('') +
            '<div class="dc-palette-hint">Tap to add · drag on desktop · drag port-to-port to connect</div>';
    },
    wireDrop() {
        const wrap = document.querySelector('#dc-overlay .dc-canvas-wrap');
        wrap.addEventListener('dragover', e => e.preventDefault());
        wrap.addEventListener('drop', e => {
            e.preventDefault();
            const type = e.dataTransfer.getData('node');
            if (type) this.addNodeAt(type, e.clientX, e.clientY);
        });
    },

    open(mode, challengeId) {
        this.buildOverlay();
        this.mode = mode;
        const ov = document.getElementById('dc-overlay');
        ov.classList.add('open');
        document.getElementById('dc-loading').style.display = 'block';
        this.loadLib(ok => {
            document.getElementById('dc-loading').style.display = 'none';
            if (!ok) { this.toast('Canvas needs an internet connection to load the first time.'); return; }
            this.ensureEditor();
            if (mode === 'challenge') {
                document.getElementById('dc-challenge-bar').style.display = 'flex';
                document.getElementById('dc-title-text').textContent = 'BUILD THE ARCHITECTURE';
                this.populateChallenges();
                this.loadChallenge(challengeId || this.challenges[0].id);
            } else {
                document.getElementById('dc-challenge-bar').style.display = 'none';
                document.getElementById('dc-brief').style.display = 'none';
                document.getElementById('dc-title-text').textContent = 'DESIGN CANVAS';
                this.loadSaved();
            }
        });
    },
    close() {
        if (this.editor && this.mode === 'free') this.saveState();
        const ov = document.getElementById('dc-overlay');
        if (ov) ov.classList.remove('open');
    },

    ensureEditor() {
        if (this.editor) return;
        const el = document.getElementById('dc-drawflow');
        this.editor = new Drawflow(el);
        this.editor.reroute = true;
        this.editor.start();
    },

    nodeHtml(type) {
        const c = this.components[type];
        return `<div class="dc-node-inner"><i class="fas ${c.icon}"></i><span>${c.label}</span></div>`;
    },
    addNodeAt(type, clientX, clientY) {
        if (!this.editor || !this.components[type]) return;
        const pre = this.editor.precanvas;
        const z = this.editor.zoom;
        const rect = pre.getBoundingClientRect();
        const x = (clientX - rect.x) / z;
        const y = (clientY - rect.y) / z;
        this.editor.addNode(type, 1, 1, x, y, 'dc-' + type, { type }, this.nodeHtml(type));
    },
    tapAdd(type) {
        if (!this.editor) return;
        const i = this.addCount++;
        const x = 120 + (i % 5) * 155;
        const y = 90 + (Math.floor(i / 5) % 4) * 95;
        this.editor.addNode(type, 1, 1, x, y, 'dc-' + type, { type }, this.nodeHtml(type));
    },

    zoom(dir) { if (this.editor) dir > 0 ? this.editor.zoom_in() : this.editor.zoom_out(); },
    clear() {
        if (!this.editor) return;
        if (!confirm('Clear the whole canvas?')) return;
        this.editor.clear();
        this.addCount = 0;
    },

    // ---------- free mode persistence ----------
    saveState() {
        try { localStorage.setItem('sysbreach_canvas', JSON.stringify(this.editor.export())); } catch (e) {}
    },
    loadSaved() {
        this.editor.clear();
        this.addCount = 0;
        try {
            const raw = localStorage.getItem('sysbreach_canvas');
            if (raw) this.editor.import(JSON.parse(raw));
        } catch (e) {}
    },

    // ---------- challenges ----------
    populateChallenges() {
        const sel = document.getElementById('dc-challenge-select');
        sel.innerHTML = this.challenges.map(c => `<option value="${c.id}">${c.title}</option>`).join('');
    },
    loadChallenge(id) {
        const ch = this.challenges.find(c => c.id === id) || this.challenges[0];
        this.curChallenge = ch;
        document.getElementById('dc-challenge-select').value = ch.id;
        const brief = document.getElementById('dc-brief');
        brief.style.display = 'block';
        brief.innerHTML = `<strong>${ch.title}:</strong> ${ch.brief} <em>Expected components: ${ch.expect.map(t => this.components[t].label).join(', ')}.</em>`;
        this.editor.clear();
        this.addCount = 0;
    },
    revealChallenge() {
        const ch = this.curChallenge;
        if (!ch) return;
        this.editor.clear();
        const ids = ch.nodes.map(nd =>
            this.editor.addNode(nd.type, 1, 1, nd.x, nd.y, 'dc-' + nd.type, { type: nd.type }, this.nodeHtml(nd.type)));
        ch.conns.forEach(([a, b]) => {
            try { this.editor.addConnection(ids[a], ids[b], 'output_1', 'input_1'); } catch (e) {}
        });
        this.toast('Reference solution loaded — compare it to your design.');
    },
    checkChallenge() {
        const ch = this.curChallenge;
        if (!ch || !this.editor) return;
        const data = this.editor.export().drawflow.Home.data;
        const nodes = Object.values(data);
        const types = nodes.map(n => (n.data && n.data.type) || n.name);
        let hit = 0;
        ch.expect.forEach(t => { if (types.includes(t)) hit++; });
        const conns = nodes.reduce((s, n) => s + Object.values(n.outputs || {}).reduce((k, o) => k + ((o.connections || []).length), 0), 0);
        const pct = Math.round((hit / ch.expect.length) * 100);
        const missing = ch.expect.filter(t => !types.includes(t)).map(t => this.components[t].label);
        let msg = `Components: ${hit}/${ch.expect.length} (${pct}%). Connections drawn: ${conns}.`;
        if (missing.length) msg += ' Missing: ' + missing.join(', ') + '.';
        else if (conns < ch.expect.length - 1) msg += ' Add more connections to wire them together.';
        else msg += ' Looks complete — hit "Reveal solution" to compare.';
        this.toast(msg);
    },

    // ---------- simulate ----------
    simulate() {
        if (!this.editor) return;
        const data = this.editor.export().drawflow.Home.data;
        const nodes = Object.values(data);
        if (!nodes.length) { this.toast('Add some components first.'); return; }
        let start = nodes.find(n => ((n.data && n.data.type) || n.name) === 'client');
        if (!start) start = nodes.find(n => Object.values(n.inputs || {}).every(i => !(i.connections || []).length)) || nodes[0];
        const order = [], seen = new Set(), q = [String(start.id)];
        while (q.length) {
            const id = q.shift();
            if (seen.has(id)) continue;
            seen.add(id); order.push(id);
            const n = data[id];
            if (!n) continue;
            Object.values(n.outputs || {}).forEach(o => (o.connections || []).forEach(c => q.push(String(c.node))));
        }
        order.forEach((id, i) => setTimeout(() => this.pulse(id), i * 550));
    },
    pulse(id) {
        const el = document.getElementById('node-' + id);
        if (!el) return;
        el.classList.add('dc-pulse');
        setTimeout(() => el.classList.remove('dc-pulse'), 700);
    },

    toast(msg) {
        const t = document.getElementById('dc-toast');
        if (!t) return;
        t.textContent = msg;
        t.classList.add('show');
        clearTimeout(this._tt);
        this._tt = setTimeout(() => t.classList.remove('show'), 4200);
    },

    // ---------- styles ----------
    injectStyles() {
        if (document.getElementById('dc-styles')) return;
        const css = `
        .dc-overlay{position:fixed;inset:0;background:var(--bg-primary);z-index:1600;display:none;flex-direction:column;}
        .dc-overlay.open{display:flex;}
        .dc-topbar{display:flex;justify-content:space-between;align-items:center;padding:0.7rem 1rem;background:var(--bg-secondary);border-bottom:1px solid var(--border-color);}
        .dc-title{font-family:var(--font-display);font-size:0.75rem;letter-spacing:1px;color:var(--neon-pink);}
        .dc-topbtns{display:flex;gap:0.4rem;flex-wrap:wrap;}
        .dc-btn{display:inline-flex;align-items:center;gap:0.3rem;background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-secondary);border-radius:8px;padding:0.4rem 0.6rem;font-size:0.65rem;font-family:var(--font-mono);cursor:pointer;}
        .dc-btn:hover{border-color:var(--neon-cyan);color:var(--neon-cyan);}
        .dc-btn.close{border-color:var(--neon-pink);color:var(--neon-pink);}
        .dc-challenge-bar{display:flex;gap:0.5rem;align-items:center;padding:0.6rem 1rem;background:var(--bg-secondary);border-bottom:1px solid var(--border-color);flex-wrap:wrap;}
        #dc-challenge-select{background:var(--bg-card);border:1px solid var(--border-color);color:var(--neon-cyan);border-radius:8px;padding:0.4rem 0.6rem;font-family:var(--font-mono);font-size:0.7rem;}
        .dc-brief{padding:0.6rem 1rem;font-size:0.72rem;color:var(--text-secondary);line-height:1.5;background:rgba(191,0,255,0.05);border-bottom:1px solid var(--border-color);}
        .dc-brief strong{color:var(--neon-purple);}
        .dc-brief em{color:var(--text-dim);display:block;margin-top:0.25rem;}
        .dc-main{flex:1;display:flex;overflow:hidden;}
        .dc-palette{width:130px;flex-shrink:0;background:var(--bg-secondary);border-right:1px solid var(--border-color);overflow-y:auto;padding:0.6rem;}
        .dc-palette-title{font-size:0.55rem;letter-spacing:1px;color:var(--text-dim);margin-bottom:0.5rem;}
        .dc-palette-item{display:flex;align-items:center;gap:0.4rem;padding:0.5rem;margin-bottom:0.4rem;background:var(--bg-card);border:1px solid var(--border-color);border-left:3px solid var(--dc-c);border-radius:8px;font-size:0.62rem;color:var(--text-primary);cursor:grab;}
        .dc-palette-item i{color:var(--dc-c);width:14px;text-align:center;}
        .dc-palette-item:active{cursor:grabbing;}
        .dc-palette-hint{font-size:0.55rem;color:var(--text-dim);line-height:1.4;margin-top:0.6rem;}
        .dc-canvas-wrap{flex:1;position:relative;overflow:hidden;}
        #dc-drawflow{width:100%;height:100%;background:var(--bg-primary);background-image:radial-gradient(var(--border-color) 1px, transparent 1px);background-size:22px 22px;}
        #dc-drawflow .drawflow-node{background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;color:var(--text-primary);min-width:auto;padding:0;box-shadow:0 4px 12px rgba(0,0,0,0.4);}
        #dc-drawflow .drawflow-node .dc-node-inner{display:flex;align-items:center;gap:0.4rem;padding:0.5rem 0.7rem;font-size:0.66rem;white-space:nowrap;font-family:var(--font-mono);}
        #dc-drawflow .drawflow-node.dc-client{border-color:#00f0ff;}#dc-drawflow .drawflow-node.dc-client i{color:#00f0ff;}
        #dc-drawflow .drawflow-node.dc-lb{border-color:#ff6600;}#dc-drawflow .drawflow-node.dc-lb i{color:#ff6600;}
        #dc-drawflow .drawflow-node.dc-api{border-color:#00ff41;}#dc-drawflow .drawflow-node.dc-api i{color:#00ff41;}
        #dc-drawflow .drawflow-node.dc-cache{border-color:#ffd000;}#dc-drawflow .drawflow-node.dc-cache i{color:#ffd000;}
        #dc-drawflow .drawflow-node.dc-db{border-color:#bf00ff;}#dc-drawflow .drawflow-node.dc-db i{color:#bf00ff;}
        #dc-drawflow .drawflow-node.dc-queue{border-color:#ff6600;}#dc-drawflow .drawflow-node.dc-queue i{color:#ff6600;}
        #dc-drawflow .drawflow-node.dc-cdn{border-color:#ff006e;}#dc-drawflow .drawflow-node.dc-cdn i{color:#ff006e;}
        #dc-drawflow .drawflow-node.dc-storage{border-color:#ff006e;}#dc-drawflow .drawflow-node.dc-storage i{color:#ff006e;}
        #dc-drawflow .drawflow-node.dc-search{border-color:#00f0ff;}#dc-drawflow .drawflow-node.dc-search i{color:#00f0ff;}
        #dc-drawflow .drawflow-node.dc-worker{border-color:#00ff41;}#dc-drawflow .drawflow-node.dc-worker i{color:#00ff41;}
        #dc-drawflow .drawflow-node .input,#dc-drawflow .drawflow-node .output{background:var(--bg-primary);border:2px solid var(--neon-cyan);}
        #dc-drawflow .connection .main-path{stroke:var(--neon-cyan);stroke-width:2px;}
        #dc-drawflow .drawflow-node.dc-pulse{animation:dcPulse 0.7s ease;border-color:var(--neon-green)!important;box-shadow:0 0 22px rgba(0,255,65,0.6)!important;}
        @keyframes dcPulse{0%,100%{transform:scale(1);}50%{transform:scale(1.12);}}
        .dc-toast{position:absolute;left:50%;bottom:1.2rem;transform:translateX(-50%) translateY(2rem);background:var(--bg-card);border:1px solid var(--neon-cyan);color:var(--text-primary);padding:0.6rem 1rem;border-radius:10px;font-size:0.7rem;max-width:90%;text-align:center;opacity:0;transition:all 0.3s ease;pointer-events:none;z-index:5;}
        .dc-toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
        .dc-loading{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:var(--neon-cyan);font-size:0.8rem;font-family:var(--font-mono);z-index:5;}
        `;
        const el = document.createElement('style');
        el.id = 'dc-styles';
        el.textContent = css;
        document.head.appendChild(el);
    }
};

DesignCanvas.init();
