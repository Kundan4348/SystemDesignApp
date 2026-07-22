// ============ DYNAMIC VISUAL COMPONENTS ============
// These generate rich HTML with icons, diagrams, and animations

const V = {
    // Topic Banner with animated icon
    banner(icon, title, subtitle, color = 'green') {
        return `<div class="topic-banner ${color}">
            <i class="fas ${icon}"></i>
            <h2>${title}</h2>
            <p>${subtitle}</p>
        </div>`;
    },

    // Architecture flow diagram (horizontal)
    archFlow(nodes) {
        return `<div class="arch-diagram"><div class="arch-flow">
            ${nodes.map((n, i) => {
                const arrow = i < nodes.length - 1 ? '<span class="arch-arrow">→</span>' : '';
                return `<span class="arch-node ${n.type}"><i class="fas ${n.icon}"></i> ${n.label}</span>${arrow}`;
            }).join('')}
        </div></div>`;
    },

    // Vertical architecture flow
    archVertical(nodes) {
        return `<div class="arch-diagram"><div class="arch-flow vertical">
            ${nodes.map((n, i) => {
                const arrow = i < nodes.length - 1 ? '<span class="arch-arrow down">→</span>' : '';
                return `<span class="arch-node ${n.type}"><i class="fas ${n.icon}"></i> ${n.label}</span>${arrow}`;
            }).join('')}
        </div></div>`;
    },

    // Multi-layer architecture (complex systems)
    archLayers(layers) {
        return `<div class="arch-diagram">
            ${layers.map((layer, li) => `
                <div class="arch-flow" style="margin-bottom: ${li < layers.length - 1 ? '0.5rem' : '0'}">
                    ${layer.map((n, i) => {
                        const arrow = i < layer.length - 1 ? '<span class="arch-arrow">→</span>' : '';
                        return `<span class="arch-node ${n.type}"><i class="fas ${n.icon}"></i> ${n.label}</span>${arrow}`;
                    }).join('')}
                </div>
                ${li < layers.length - 1 ? '<span class="arch-arrow down" style="display:block;text-align:center;">→</span>' : ''}
            `).join('')}
        </div>`;
    },

    // Concept card with icon
    concept(icon, title, text, color = 'cyan') {
        return `<div class="concept-card">
            <div class="concept-icon ${color}"><i class="fas ${icon}"></i></div>
            <div class="concept-body"><h4>${title}</h4><p>${text}</p></div>
        </div>`;
    },

    // VS comparison cards (good vs bad, or A vs B)
    vs(left, right) {
        return `<div class="vs-container">
            <div class="vs-card ${left.type || 'good'}">
                <h5><i class="fas ${left.icon || 'fa-check'}"></i> ${left.title}</h5>
                <p>${left.text}</p>
            </div>
            <div class="vs-card ${right.type || 'bad'}">
                <h5><i class="fas ${right.icon || 'fa-times'}"></i> ${right.title}</h5>
                <p>${right.text}</p>
            </div>
        </div>`;
    },

    // Numbered step flow
    steps(items) {
        return `<div class="step-flow">
            ${items.map((item, i) => `
                <div class="step-item" data-step="${i + 1}">
                    <h5>${item.title}</h5>
                    <p>${item.text}</p>
                </div>
            `).join('')}
        </div>`;
    },

    // Metric tiles row
    metrics(items) {
        return `<div class="metric-row">
            ${items.map(m => `
                <div class="metric-tile">
                    <span class="metric-value">${m.value}</span>
                    <span class="metric-label">${m.label}</span>
                </div>
            `).join('')}
        </div>`;
    },

    // Tags (pro/con/info)
    tags(items) {
        return `<div class="tag-row">
            ${items.map(t => `<span class="tag ${t.type}">${t.text}</span>`).join('')}
        </div>`;
    },

    // Info/Warning box with icon
    infoBox(title, text, type = 'info') {
        const icons = { info: 'fa-circle-info', warning: 'fa-triangle-exclamation', tip: 'fa-lightbulb', key: 'fa-key' };
        const colors = { info: 'var(--neon-cyan)', warning: 'var(--neon-orange)', tip: 'var(--neon-green)', key: 'var(--neon-purple)' };
        return `<div class="info-box" style="border-color: ${colors[type]}; background: ${colors[type]}11;">
            <h4 style="color: ${colors[type]}"><i class="fas ${icons[type]}"></i> ${title}</h4>
            <p>${text}</p>
        </div>`;
    },

    // Comparison table
    table(headers, rows) {
        return `<table>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
            ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
        </table>`;
    },

    // Code block with title
    code(title, content) {
        return `<div style="margin: 1rem 0;">
            ${title ? `<div style="font-size: 0.65rem; color: var(--neon-purple); margin-bottom: 0.3rem; letter-spacing: 1px;"><i class="fas fa-code"></i> ${title}</div>` : ''}
            <pre>${content}</pre>
        </div>`;
    },

    // Section header with icon
    section(icon, title) {
        return `<h3><i class="fas ${icon}" style="margin-right: 0.5rem;"></i>${title}</h3>`;
    },

    // Deep dive toggle (expandable advanced section)
    deepDive(title, content) {
        const id = 'dd_' + Math.random().toString(36).substr(2, 9);
        return `<div class="deep-dive" id="${id}">
            <div class="deep-dive-header" onclick="document.getElementById('${id}').classList.toggle('open')">
                <h4><i class="fas fa-microscope"></i> DEEP DIVE: ${title}</h4>
                <i class="fas fa-chevron-down toggle-icon"></i>
            </div>
            <div class="deep-dive-content">${content}</div>
        </div>`;
    },

    // Why box — explains the reasoning behind a choice
    why(text) {
        return `<div class="why-box">
            <h4><i class="fas fa-lightbulb"></i> WHY?</h4>
            <p>${text}</p>
        </div>`;
    },

    // Interview tip
    interviewTip(text) {
        return `<div class="interview-tip">
            <h5><i class="fas fa-user-tie"></i> INTERVIEW TIP</h5>
            <p>${text}</p>
        </div>`;
    },

    // Interactive walkthrough question
    walkthrough(title, questions) {
        const id = 'wt_' + Math.random().toString(36).substr(2, 9);
        return `<div class="walkthrough">
            <div class="walkthrough-header">
                <i class="fas fa-gamepad"></i>
                <h4>${title}</h4>
            </div>
            ${questions.map((q, qi) => {
                const qid = id + '_q' + qi;
                return `<div class="wt-question">
                    <p>${q.question}</p>
                    <div class="wt-options" id="${qid}_opts">
                        ${q.options.map((opt, oi) => `
                            <div class="wt-option" onclick="handleWT('${qid}', ${oi}, ${q.correct})">${opt}</div>
                        `).join('')}
                    </div>
                    <div class="wt-reveal" id="${qid}_reveal">
                        <p><strong style="color:var(--neon-green)">✓</strong> ${q.explanation}</p>
                    </div>
                </div>`;
            }).join('')}
        </div>`;
    },

    // Real-world example box
    realWorld(company, text) {
        return `<div class="concept-card" style="border-color: var(--neon-yellow);">
            <div class="concept-icon yellow"><i class="fas fa-building"></i></div>
            <div class="concept-body">
                <h4 style="color: var(--neon-yellow)">${company} — Real World</h4>
                <p>${text}</p>
            </div>
        </div>`;
    },

    // Analogy box
    analogy(text) {
        return `<div class="concept-card" style="border-color: var(--neon-orange);">
            <div class="concept-icon orange"><i class="fas fa-brain"></i></div>
            <div class="concept-body">
                <h4 style="color: var(--neon-orange)">ANALOGY</h4>
                <p>${text}</p>
            </div>
        </div>`;
    }
};
