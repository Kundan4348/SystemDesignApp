// ============ INTERACTIVE MODULES ============
// Animated diagrams, architecture builder, code challenges, mock interviews, flashcards

// ============ 1. ANIMATED FLOW DIAGRAMS ============
class AnimatedDiagram {
    constructor(container, config) {
        this.container = container;
        this.nodes = config.nodes;
        this.flows = config.flows; // [{from, to, label, color, delay}]
        this.currentStep = 0;
        this.playing = false;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="anim-diagram">
                <div class="anim-nodes">${this.renderNodes()}</div>
                <div class="anim-controls">
                    <button class="anim-btn" onclick="this.closest('.anim-diagram').__diagram.prev()">
                        <i class="fas fa-step-backward"></i>
                    </button>
                    <button class="anim-btn play-btn" onclick="this.closest('.anim-diagram').__diagram.togglePlay()">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="anim-btn" onclick="this.closest('.anim-diagram').__diagram.next()">
                        <i class="fas fa-step-forward"></i>
                    </button>
                    <span class="anim-step-label">Step <span class="step-num">0</span>/${this.flows.length}</span>
                </div>
                <div class="anim-description"></div>
            </div>
        `;
        this.container.querySelector('.anim-diagram').__diagram = this;
    }

    renderNodes() {
        return this.nodes.map((n, i) => `
            <div class="anim-node ${n.type}" id="anode-${i}" style="--delay:${i * 0.1}s">
                <i class="fas ${n.icon}"></i>
                <span>${n.label}</span>
            </div>
        `).join('<span class="anim-connector">→</span>');
    }

    next() {
        if (this.currentStep >= this.flows.length) return;
        const flow = this.flows[this.currentStep];
        this.animateFlow(flow);
        this.currentStep++;
        this.updateUI();
    }

    prev() {
        if (this.currentStep <= 0) return;
        this.currentStep--;
        this.resetFlows();
        for (let i = 0; i < this.currentStep; i++) {
            this.showFlowInstant(this.flows[i]);
        }
        this.updateUI();
    }

    togglePlay() {
        this.playing = !this.playing;
        const btn = this.container.querySelector('.play-btn i');
        btn.className = this.playing ? 'fas fa-pause' : 'fas fa-play';
        if (this.playing) this.autoPlay();
    }

    autoPlay() {
        if (!this.playing || this.currentStep >= this.flows.length) {
            this.playing = false;
            const btn = this.container.querySelector('.play-btn i');
            if (btn) btn.className = 'fas fa-play';
            return;
        }
        this.next();
        setTimeout(() => this.autoPlay(), 1500);
    }

    animateFlow(flow) {
        const fromNode = this.container.querySelector(`#anode-${flow.from}`);
        const toNode = this.container.querySelector(`#anode-${flow.to}`);
        if (fromNode) fromNode.classList.add('pulse-glow');
        setTimeout(() => {
            if (toNode) toNode.classList.add('pulse-glow', flow.hit ? 'hit' : flow.miss ? 'miss' : '');
            if (fromNode) fromNode.classList.remove('pulse-glow');
        }, 600);
    }

    showFlowInstant(flow) {
        const toNode = this.container.querySelector(`#anode-${flow.to}`);
        if (toNode && flow.hit) toNode.classList.add('hit');
        if (toNode && flow.miss) toNode.classList.add('miss');
    }

    resetFlows() {
        this.container.querySelectorAll('.anim-node').forEach(n => {
            n.classList.remove('pulse-glow', 'hit', 'miss');
        });
    }

    updateUI() {
        const label = this.container.querySelector('.step-num');
        const desc = this.container.querySelector('.anim-description');
        if (label) label.textContent = this.currentStep;
        if (desc && this.currentStep > 0) {
            desc.textContent = this.flows[this.currentStep - 1].label || '';
        }
    }
}

// ============ 2. ARCHITECTURE BUILDER ============
class ArchBuilder {
    constructor(container, config) {
        this.container = container;
        this.components = config.components; // available to drag
        this.correctAnswer = config.answer;  // correct connections
        this.placed = [];
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="arch-builder">
                <div class="arch-builder-header">
                    <h4><i class="fas fa-drafting-compass"></i> BUILD THE ARCHITECTURE</h4>
                    <p>${this.correctAnswer.description || 'Drag components to build the system'}</p>
                </div>
                <div class="arch-palette">
                    ${this.components.map((c, i) => `
                        <div class="arch-palette-item" draggable="true" data-idx="${i}"
                             ondragstart="event.dataTransfer.setData('text/plain', ${i})">
                            <i class="fas ${c.icon}"></i>
                            <span>${c.label}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="arch-canvas" ondrop="this.closest('.arch-builder').__builder.drop(event)"
                     ondragover="event.preventDefault()">
                    <p class="arch-canvas-hint">Drop components here in order</p>
                    <div class="arch-canvas-nodes"></div>
                </div>
                <div class="arch-builder-actions">
                    <button class="neon-btn" onclick="this.closest('.arch-builder').__builder.check()">
                        CHECK DESIGN
                    </button>
                    <button class="neon-btn secondary" onclick="this.closest('.arch-builder').__builder.reset()">
                        RESET
                    </button>
                </div>
                <div class="arch-builder-result"></div>
            </div>
        `;
        this.container.querySelector('.arch-builder').__builder = this;
    }

    drop(event) {
        event.preventDefault();
        const idx = parseInt(event.dataTransfer.getData('text/plain'));
        const comp = this.components[idx];
        this.placed.push(comp);
        this.renderCanvas();
    }

    renderCanvas() {
        const canvas = this.container.querySelector('.arch-canvas-nodes');
        canvas.innerHTML = this.placed.map((c, i) => `
            <span class="arch-node ${c.type}">
                <i class="fas ${c.icon}"></i> ${c.label}
            </span>
            ${i < this.placed.length - 1 ? '<span class="arch-arrow">→</span>' : ''}
        `).join('');
        this.container.querySelector('.arch-canvas-hint').style.display =
            this.placed.length ? 'none' : 'block';
    }

    check() {
        const result = this.container.querySelector('.arch-builder-result');
        const userOrder = this.placed.map(c => c.id);
        const correctOrder = this.correctAnswer.order;
        const match = JSON.stringify(userOrder) === JSON.stringify(correctOrder);
        const partial = this.scorePartial(userOrder, correctOrder);

        if (match) {
            result.innerHTML = `<div class="arch-result-card correct">
                <i class="fas fa-check-circle"></i>
                <strong>PERFECT ARCHITECTURE!</strong>
                <p>All components in correct order. +20 XP</p>
            </div>`;
            addXP(20);
        } else if (partial >= 0.7) {
            result.innerHTML = `<div class="arch-result-card partial">
                <i class="fas fa-exclamation-circle"></i>
                <strong>CLOSE! ${Math.round(partial * 100)}% correct</strong>
                <p>Expected: ${correctOrder.join(' → ')}</p>
            </div>`;
            addXP(10);
        } else {
            result.innerHTML = `<div class="arch-result-card wrong">
                <i class="fas fa-times-circle"></i>
                <strong>NOT QUITE</strong>
                <p>Correct order: ${correctOrder.join(' → ')}</p>
            </div>`;
        }
    }

    scorePartial(user, correct) {
        let matches = 0;
        const len = Math.max(user.length, correct.length);
        for (let i = 0; i < Math.min(user.length, correct.length); i++) {
            if (user[i] === correct[i]) matches++;
        }
        return len > 0 ? matches / len : 0;
    }

    reset() {
        this.placed = [];
        this.renderCanvas();
        this.container.querySelector('.arch-builder-result').innerHTML = '';
    }
}

// ============ 3. LIVE CODE CHALLENGE ============
class CodeChallenge {
    constructor(container, config) {
        this.container = container;
        this.title = config.title;
        this.description = config.description;
        this.starterCode = config.starterCode;
        this.testCases = config.testCases;
        this.solution = config.solution;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="code-challenge">
                <div class="cc-header">
                    <h4><i class="fas fa-code"></i> CODE CHALLENGE: ${this.title}</h4>
                    <p>${this.description}</p>
                </div>
                <textarea class="cc-editor" spellcheck="false">${this.starterCode}</textarea>
                <div class="cc-actions">
                    <button class="neon-btn" onclick="this.closest('.code-challenge').__cc.run()">
                        <i class="fas fa-play"></i> RUN TESTS
                    </button>
                    <button class="neon-btn secondary" onclick="this.closest('.code-challenge').__cc.showSolution()">
                        <i class="fas fa-eye"></i> SHOW SOLUTION
                    </button>
                </div>
                <div class="cc-results"></div>
            </div>
        `;
        this.container.querySelector('.code-challenge').__cc = this;
    }

    run() {
        const code = this.container.querySelector('.cc-editor').value;
        const results = this.container.querySelector('.cc-results');
        let html = '';
        let passed = 0;

        for (const tc of this.testCases) {
            try {
                const fn = new Function(code + '\n' + tc.test);
                const result = fn();
                if (result === tc.expected) {
                    passed++;
                    html += `<div class="cc-test pass"><i class="fas fa-check"></i> ${tc.name}</div>`;
                } else {
                    html += `<div class="cc-test fail"><i class="fas fa-times"></i> ${tc.name}: expected ${tc.expected}, got ${result}</div>`;
                }
            } catch (e) {
                html += `<div class="cc-test fail"><i class="fas fa-bug"></i> ${tc.name}: ${e.message}</div>`;
            }
        }

        html = `<div class="cc-summary">${passed}/${this.testCases.length} tests passed</div>` + html;
        if (passed === this.testCases.length) {
            html += `<div class="cc-success"><i class="fas fa-trophy"></i> ALL TESTS PASSED! +30 XP</div>`;
            addXP(30);
        }
        results.innerHTML = html;
    }

    showSolution() {
        this.container.querySelector('.cc-editor').value = this.solution;
    }
}

// ============ 4. MOCK INTERVIEW SIMULATOR ============
class MockInterview {
    constructor(container, config) {
        this.container = container;
        this.problem = config.problem;
        this.steps = config.steps; // [{title, prompt, timeMin, idealAnswer}]
        this.currentStep = 0;
        this.answers = [];
        this.startTime = null;
        this.timerInterval = null;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="mock-interview">
                <div class="mi-header">
                    <h4><i class="fas fa-user-tie"></i> MOCK INTERVIEW</h4>
                    <div class="mi-timer" id="mi-timer">45:00</div>
                </div>
                <div class="mi-problem">
                    <h3>${this.problem}</h3>
                </div>
                <div class="mi-step-content"></div>
            </div>
        `;
        this.container.querySelector('.mock-interview').__mi = this;
        this.showStep();
    }

    showStep() {
        if (this.currentStep >= this.steps.length) {
            this.showResults();
            return;
        }
        if (!this.startTime) {
            this.startTime = Date.now();
            this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        }

        const step = this.steps[this.currentStep];
        const content = this.container.querySelector('.mi-step-content');
        content.innerHTML = `
            <div class="mi-step">
                <div class="mi-step-badge">STEP ${this.currentStep + 1}/${this.steps.length}</div>
                <h4>${step.title}</h4>
                <p class="mi-prompt">${step.prompt}</p>
                <p class="mi-time-hint"><i class="fas fa-clock"></i> Spend ~${step.timeMin} minutes</p>
                <textarea class="mi-answer" placeholder="Type your answer here... Think out loud as you would in an interview."></textarea>
                <button class="neon-btn" onclick="this.closest('.mock-interview').__mi.nextStep()">
                    NEXT STEP →
                </button>
            </div>
        `;
    }

    nextStep() {
        const answer = this.container.querySelector('.mi-answer').value;
        this.answers.push(answer);
        this.currentStep++;
        this.showStep();
    }

    updateTimer() {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const remaining = Math.max(0, 45 * 60 - elapsed);
        const min = Math.floor(remaining / 60);
        const sec = remaining % 60;
        const timer = this.container.querySelector('#mi-timer');
        if (timer) {
            timer.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
            if (remaining < 300) timer.style.color = 'var(--error)';
            else if (remaining < 600) timer.style.color = 'var(--neon-orange)';
        }
        if (remaining === 0) {
            clearInterval(this.timerInterval);
            this.showResults();
        }
    }

    showResults() {
        clearInterval(this.timerInterval);
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const content = this.container.querySelector('.mi-step-content');
        content.innerHTML = `
            <div class="mi-results">
                <h3><i class="fas fa-flag-checkered"></i> INTERVIEW COMPLETE</h3>
                <p>Time used: ${Math.floor(elapsed / 60)} min ${elapsed % 60} sec</p>
                <div class="mi-comparison">
                    ${this.steps.map((step, i) => `
                        <div class="mi-compare-item">
                            <h5>${step.title}</h5>
                            <div class="mi-your-answer">
                                <strong>Your answer:</strong>
                                <p>${this.answers[i] || '(skipped)'}</p>
                            </div>
                            <div class="mi-ideal-answer">
                                <strong style="color:var(--neon-green)">Ideal answer:</strong>
                                <p>${step.idealAnswer}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        addXP(50);
    }
}

// ============ 5. FLASHCARDS WITH SPACED REPETITION ============
class FlashcardDeck {
    constructor(container, config) {
        this.container = container;
        this.cards = config.cards.map((c, i) => ({
            ...c, id: i, interval: 1, ease: 2.5, due: 0, reps: 0
        }));
        this.currentIdx = 0;
        this.flipped = false;
        this.sessionCorrect = 0;
        this.sessionTotal = 0;
        this.loadProgress();
        this.sortByDue();
        this.render();
    }

    loadProgress() {
        const saved = localStorage.getItem('sysbreach_flashcards_' + this.cards.length);
        if (saved) {
            const data = JSON.parse(saved);
            this.cards.forEach(c => {
                if (data[c.id]) Object.assign(c, data[c.id]);
            });
        }
    }

    saveProgress() {
        const data = {};
        this.cards.forEach(c => {
            data[c.id] = { interval: c.interval, ease: c.ease, due: c.due, reps: c.reps };
        });
        localStorage.setItem('sysbreach_flashcards_' + this.cards.length, JSON.stringify(data));
    }

    sortByDue() {
        this.cards.sort((a, b) => a.due - b.due);
    }

    render() {
        const card = this.cards[this.currentIdx];
        this.container.innerHTML = `
            <div class="flashcard-deck">
                <div class="fc-progress">
                    <span>${this.sessionCorrect}/${this.sessionTotal} this session</span>
                    <span>Card ${this.currentIdx + 1}/${this.cards.length}</span>
                </div>
                <div class="fc-card ${this.flipped ? 'flipped' : ''}" onclick="this.closest('.flashcard-deck').__fc.flip()">
                    <div class="fc-front">
                        <p>${card.front}</p>
                        <span class="fc-hint">tap to reveal</span>
                    </div>
                    <div class="fc-back">
                        <p>${card.back}</p>
                    </div>
                </div>
                ${this.flipped ? `
                    <div class="fc-buttons">
                        <button class="fc-btn hard" onclick="this.closest('.flashcard-deck').__fc.rate(1)">
                            <i class="fas fa-times"></i> HARD
                        </button>
                        <button class="fc-btn ok" onclick="this.closest('.flashcard-deck').__fc.rate(3)">
                            <i class="fas fa-check"></i> OK
                        </button>
                        <button class="fc-btn easy" onclick="this.closest('.flashcard-deck').__fc.rate(5)">
                            <i class="fas fa-bolt"></i> EASY
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        this.container.querySelector('.flashcard-deck').__fc = this;
    }

    flip() {
        this.flipped = true;
        this.render();
    }

    rate(quality) {
        const card = this.cards[this.currentIdx];
        this.sessionTotal++;
        if (quality >= 3) this.sessionCorrect++;

        // SM-2 algorithm (simplified)
        if (quality < 3) {
            card.reps = 0;
            card.interval = 1;
        } else {
            card.reps++;
            if (card.reps === 1) card.interval = 1;
            else if (card.reps === 2) card.interval = 3;
            else card.interval = Math.round(card.interval * card.ease);
            card.ease = Math.max(1.3, card.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
        }
        card.due = Date.now() + card.interval * 86400000;
        this.saveProgress();

        this.flipped = false;
        this.currentIdx = (this.currentIdx + 1) % this.cards.length;
        this.sortByDue();
        this.render();
    }
}
