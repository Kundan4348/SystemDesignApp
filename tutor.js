// ============ BREACH_AI — In-app AI Tutor (Google Gemini, free tier) ============
// Calls the Gemini API directly from the browser using the user's own free API key.
// Context: full curriculum outline always + selected lesson's full text on demand.

const TUTOR = {
    apiKey: localStorage.getItem('sysbreach_gemini_key') || '',
    model: localStorage.getItem('sysbreach_ai_model') || 'gemini-2.0-flash',
    messages: [],          // conversation history [{role:'user'|'assistant', content}]
    contextDay: null,      // day number whose lesson text is loaded as context
    busy: false,

    init() {
        this.renderShell();
        if (!this.apiKey) {
            this.showKeySetup();
        } else {
            this.showChat();
        }
    },

    // ---------- UI SHELL ----------
    renderShell() {
        const container = document.getElementById('tutor-content');
        if (container.dataset.ready) return;
        container.dataset.ready = '1';
        container.innerHTML = `
            <div id="tutor-key-setup" class="tutor-setup hidden"></div>
            <div id="tutor-chat" class="tutor-chat hidden">
                <div class="tutor-context-bar">
                    <select id="tutor-context-select" onchange="TUTOR.setContext(this.value)"></select>
                    <button class="tutor-icon-btn" title="Clear chat" onclick="TUTOR.clearChat()"><i class="fas fa-broom"></i></button>
                    <button class="tutor-icon-btn" title="Settings" onclick="TUTOR.showKeySetup()"><i class="fas fa-gear"></i></button>
                </div>
                <div class="tutor-messages" id="tutor-messages"></div>
                <div class="tutor-input-row">
                    <textarea id="tutor-input" rows="1" placeholder="Ask anything about system design..."
                        onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();TUTOR.send();}"></textarea>
                    <button class="tutor-send-btn" id="tutor-send-btn" onclick="TUTOR.send()">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;
        this.populateContextSelect();
    },

    showKeySetup() {
        document.getElementById('tutor-chat').classList.add('hidden');
        const panel = document.getElementById('tutor-key-setup');
        panel.classList.remove('hidden');
        panel.innerHTML = `
            <div class="tutor-setup-card">
                <i class="fas fa-robot tutor-setup-icon"></i>
                <h3>ACTIVATE BREACH_AI</h3>
                <p>Your personal AI tutor, powered by Google Gemini. It knows the full curriculum and answers any doubt on any topic. The API key is <strong>100% free</strong> &mdash; no billing or credit card.</p>
                <label>Gemini API Key</label>
                <input type="password" id="tutor-api-key" placeholder="AIza..." value="${this.apiKey}">
                <label>Model</label>
                <select id="tutor-model">
                    <option value="gemini-2.0-flash" ${this.model === 'gemini-2.0-flash' ? 'selected' : ''}>Gemini 2.0 Flash — recommended</option>
                    <option value="gemini-2.5-flash" ${this.model === 'gemini-2.5-flash' ? 'selected' : ''}>Gemini 2.5 Flash — smarter</option>
                    <option value="gemini-1.5-flash" ${this.model === 'gemini-1.5-flash' ? 'selected' : ''}>Gemini 1.5 Flash — fallback</option>
                </select>
                <button class="neon-btn" onclick="TUTOR.saveKey()">CONNECT</button>
                ${this.apiKey ? '<button class="neon-btn secondary" onclick="TUTOR.showChat()">BACK TO CHAT</button>' : ''}
                <div class="tutor-setup-notes">
                    <p><i class="fas fa-gift"></i> Get a <strong>free</strong> key at <strong>aistudio.google.com/apikey</strong> &rarr; "Create API key". No credit card needed. Free tier allows generous daily usage.</p>
                    <p><i class="fas fa-lock"></i> The key is stored only in this browser (localStorage) and sent only to Google's API. Never share screenshots of it.</p>
                </div>
            </div>
        `;
    },

    saveKey() {
        const key = document.getElementById('tutor-api-key').value.trim();
        const model = document.getElementById('tutor-model').value;
        if (key.length < 20) {
            alert('That does not look like a Gemini API key. Get a free one at aistudio.google.com/apikey');
            return;
        }
        this.apiKey = key;
        this.model = model;
        localStorage.setItem('sysbreach_gemini_key', key);
        localStorage.setItem('sysbreach_ai_model', model);
        this.showChat();
    },

    showChat() {
        document.getElementById('tutor-key-setup').classList.add('hidden');
        document.getElementById('tutor-chat').classList.remove('hidden');
        if (this.messages.length === 0) {
            this.addBubble('assistant', "BREACH_AI online. I know every topic in your curriculum — HLD, LLD, and the problem-solving approach. Ask me anything: a concept you're stuck on, a \"why\" behind a tradeoff, or a mock question. Select a topic above to load that lesson as context, or just ask.");
        }
    },

    // ---------- CONTEXT ----------
    populateContextSelect() {
        const sel = document.getElementById('tutor-context-select');
        let html = '<option value="">All topics (general)</option>';
        WEEKS.forEach(week => {
            html += `<optgroup label="W${week.id}: ${week.title}">`;
            week.days.forEach(day => {
                html += `<option value="${day.day}">Day ${day.day}: ${day.title}</option>`;
            });
            html += '</optgroup>';
        });
        sel.innerHTML = html;
    },

    setContext(dayValue) {
        this.contextDay = dayValue ? parseInt(dayValue) : null;
        if (this.contextDay) {
            const found = this.findLesson(this.contextDay);
            if (found) {
                this.addBubble('assistant', `Context loaded: <strong>Day ${found.day.day} — ${found.day.title}</strong>. I now have this full lesson in front of me. Ask away.`);
            }
        }
    },

    findLesson(dayNum) {
        for (const week of WEEKS) {
            const day = week.days.find(d => d.day === dayNum);
            if (day) return { week, day };
        }
        return null;
    },

    curriculumOutline() {
        return WEEKS.map(w =>
            `Week ${w.id} — ${w.title}: ` + w.days.map(d => `Day ${d.day}: ${d.title}`).join('; ')
        ).join('\n');
    },

    lessonText(dayNum) {
        const found = this.findLesson(dayNum);
        if (!found) return '';
        const div = document.createElement('div');
        div.innerHTML = found.day.content;
        let text = (div.textContent || '').replace(/\s+/g, ' ').trim();
        if (text.length > 18000) text = text.slice(0, 18000) + ' [...truncated]';
        return `Day ${found.day.day}: ${found.day.title} (${found.day.subtitle})\n${text}`;
    },

    buildSystemPrompt() {
        let prompt = `You are BREACH_AI, the built-in tutor of SysBreach — a cyberpunk-themed system design study app. The student is preparing for software engineering interviews covering HLD (high-level design), LLD (low-level design, OOP, design patterns), and problem-solving methodology.

How to teach:
- Explain from first principles in plain language, then connect to the curriculum topic.
- Prefer DERIVING answers from requirements and tradeoffs over reciting templates. Show the "why" behind every choice.
- Use concrete numbers and short worked examples (QPS math, capacity estimates) where relevant.
- If the student's understanding is wrong, say so directly and explain the correction.
- Reference curriculum days ("this is covered in Day 10: Consistent Hashing") so they can study deeper.
- Keep answers focused and readable. Use short code snippets (Java for LLD, pseudocode for HLD) when they clarify.
- A light cyberpunk flavor is welcome occasionally, but clarity always wins.

THE CURRICULUM (8 weeks, 56 days):
${this.curriculumOutline()}`;

        if (this.contextDay) {
            prompt += `\n\nCURRENT TOPIC — the student is studying this lesson right now. Its full content follows; ground your answers in it and expand beyond it when helpful:\n\n${this.lessonText(this.contextDay)}`;
        }
        return prompt;
    },

    // ---------- CHAT ----------
    addBubble(role, html) {
        const box = document.getElementById('tutor-messages');
        const el = document.createElement('div');
        el.className = `tutor-bubble ${role}`;
        el.innerHTML = `<div class="tutor-bubble-inner">${html}</div>`;
        box.appendChild(el);
        box.scrollTop = box.scrollHeight;
        return el.querySelector('.tutor-bubble-inner');
    },

    clearChat() {
        this.messages = [];
        document.getElementById('tutor-messages').innerHTML = '';
        this.showChat();
    },

    async send() {
        if (this.busy) return;
        const input = document.getElementById('tutor-input');
        const text = input.value.trim();
        if (!text) return;
        input.value = '';

        this.addBubble('user', this.escapeHtml(text));
        this.messages.push({ role: 'user', content: text });
        if (this.messages.length > 24) {
            this.messages = this.messages.slice(-24);
            if (this.messages[0].role !== 'user') this.messages.shift();
        }

        this.busy = true;
        document.getElementById('tutor-send-btn').innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
        const bubble = this.addBubble('assistant', '<span class="tutor-typing">▋</span>');

        try {
            const reply = await this.streamCompletion(bubble);
            this.messages.push({ role: 'assistant', content: reply });
        } catch (err) {
            bubble.innerHTML = `<span class="tutor-error"><i class="fas fa-triangle-exclamation"></i> ${this.escapeHtml(err.message)}</span>`;
            this.messages.pop();
        } finally {
            this.busy = false;
            document.getElementById('tutor-send-btn').innerHTML = '<i class="fas fa-paper-plane"></i>';
        }
    },

    geminiContents() {
        return this.messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));
    },

    async streamCompletion(bubble) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:streamGenerateContent?alt=sse&key=${encodeURIComponent(this.apiKey)}`;
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: this.buildSystemPrompt() }] },
                contents: this.geminiContents(),
                generationConfig: { maxOutputTokens: 8192, temperature: 0.7 }
            })
        });

        if (!resp.ok) {
            let msg = `API error (HTTP ${resp.status})`;
            try {
                const err = await resp.json();
                msg = err.error && err.error.message ? err.error.message : msg;
            } catch (_) { }
            if (resp.status === 400 && /API key not valid/i.test(msg)) msg = 'Invalid API key. Tap the gear icon to update it.';
            if (resp.status === 403) msg = 'API key rejected or Gemini API not enabled. Get a fresh key at aistudio.google.com/apikey';
            if (resp.status === 429) msg = 'Free-tier rate limit hit — wait a minute and try again.';
            if (resp.status === 404) msg = `Model "${this.model}" not available for this key. Try another model in settings (gear icon).`;
            throw new Error(msg);
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullText = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();
            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const payload = line.slice(6).trim();
                if (!payload) continue;
                let ev;
                try { ev = JSON.parse(payload); } catch (_) { continue; }
                if (ev.promptFeedback && ev.promptFeedback.blockReason) {
                    throw new Error('Blocked by safety filter: ' + ev.promptFeedback.blockReason);
                }
                const cand = ev.candidates && ev.candidates[0];
                if (cand && cand.content && cand.content.parts) {
                    for (const part of cand.content.parts) {
                        if (part.text) fullText += part.text;
                    }
                    bubble.innerHTML = this.renderMarkdown(fullText) + '<span class="tutor-typing">▋</span>';
                    const box = document.getElementById('tutor-messages');
                    box.scrollTop = box.scrollHeight;
                }
            }
        }

        if (!fullText) throw new Error('Empty response — try again, or switch models in settings.');
        bubble.innerHTML = this.renderMarkdown(fullText);
        return fullText;
    },

    // ---------- RENDERING ----------
    escapeHtml(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },

    renderMarkdown(text) {
        let s = this.escapeHtml(text);
        s = s.replace(/```(\w*)\n([\s\S]*?)```/g, (m, lang, code) =>
            `<pre class="tutor-code">${code.replace(/\n$/, '')}</pre>`);
        s = s.replace(/`([^`\n]+)`/g, '<code>$1</code>');
        s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
        s = s.replace(/^#{1,4}\s+(.+)$/gm, '<strong class="tutor-h">$1</strong>');
        s = s.replace(/^[-•]\s+(.+)$/gm, '<span class="tutor-li">• $1</span>');
        s = s.replace(/^\d+\.\s+(.+)$/gm, (m, t) => `<span class="tutor-li">${m.match(/^\d+/)[0]}. ${t}</span>`);
        s = s.replace(/\n\n+/g, '<br><br>').replace(/\n/g, '<br>');
        s = s.replace(/<br>(<pre)/g, '$1').replace(/(<\/pre>)<br>/g, '$1');
        return s;
    }
};

function openTutorWithContext(dayNum) {
    showScreen('tutor');
    TUTOR.init();
    if (TUTOR.apiKey) {
        TUTOR.showChat();
        const sel = document.getElementById('tutor-context-select');
        if (sel) sel.value = String(dayNum);
        TUTOR.setContext(String(dayNum));
    }
}
