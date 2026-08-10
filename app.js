// ============ STATE ============
let state = {
    xp: 0,
    level: 1,
    rank: 'SCRIPT_KIDDIE',
    streak: 0,
    lastActiveDate: null,
    completedLessons: [],
    quizScores: {},
    daysActive: 0
};

const RANKS = [
    { name: 'SCRIPT_KIDDIE', minLevel: 1, icon: 'fa-skull-crossbones', color: '#8888aa' },
    { name: 'HACKER', minLevel: 5, icon: 'fa-user-ninja', color: '#00ff41' },
    { name: 'ELITE', minLevel: 10, icon: 'fa-hat-wizard', color: '#00f0ff' },
    { name: 'GHOST', minLevel: 18, icon: 'fa-ghost', color: '#bf00ff' },
    { name: 'ARCHITECT', minLevel: 25, icon: 'fa-crown', color: '#ffd000' }
];

const XP_PER_LEVEL = 100;

// ============ INIT ============
function init() {
    extendContent();
    extendContent2();
    loadState();
    updateStreak();
    initMatrixRain();

    // Backfill: lessons completed before revision system existed
    state.completedLessons.forEach(day => RevisionEngine.addLesson(day));

    setTimeout(() => {
        showScreen('dashboard');
        renderDashboard();
    }, 2800);

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            if (page === 'lessons') {
                showScreen('lessons');
                renderLessonsList(1);
            } else if (page === 'quiz') {
                showScreen('quiz');
                renderQuizSelector();
            } else if (page === 'lab') {
                showScreen('lab');
            } else if (page === 'tutor') {
                showScreen('tutor');
                TUTOR.init();
            } else if (page === 'profile') {
                showScreen('profile');
                renderProfile();
            } else {
                showScreen('dashboard');
                renderDashboard();
            }
        });
    });
}

// ============ STATE MANAGEMENT ============
function loadState() {
    const saved = localStorage.getItem('sysbreach_state');
    if (saved) {
        state = { ...state, ...JSON.parse(saved) };
    }
}

function saveState() {
    localStorage.setItem('sysbreach_state', JSON.stringify(state));
}

function updateStreak() {
    const today = new Date().toDateString();
    if (state.lastActiveDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (state.lastActiveDate === yesterday.toDateString()) {
            state.streak++;
        } else if (state.lastActiveDate !== null) {
            state.streak = 1;
        } else {
            state.streak = 1;
        }
        state.lastActiveDate = today;
        state.daysActive++;
        saveState();
    }
}

function addXP(amount) {
    state.xp += amount;
    while (state.xp >= state.level * XP_PER_LEVEL) {
        state.xp -= state.level * XP_PER_LEVEL;
        state.level++;
        updateRank();
    }
    saveState();
    updateXPDisplay();
}

function updateRank() {
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (state.level >= RANKS[i].minLevel) {
            state.rank = RANKS[i].name;
            break;
        }
    }
}

function getXPNeeded() {
    return state.level * XP_PER_LEVEL;
}

// ============ SCREEN MANAGEMENT ============
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === screenId);
    });
}

// ============ DASHBOARD ============
function renderDashboard() {
    updateXPDisplay();
    document.getElementById('user-rank-text').textContent = state.rank;
    document.getElementById('streak-count').textContent = state.streak;
    document.getElementById('systems-breached').textContent = state.completedLessons.length;
    document.getElementById('quizzes-passed').textContent = Object.keys(state.quizScores).length;
    document.getElementById('days-completed').textContent = state.daysActive;
    document.getElementById('user-level').textContent = state.level;

    renderDailyMission();
    renderWeeksGrid();
    renderRevisionCard();
}

function updateXPDisplay() {
    const needed = getXPNeeded();
    const pct = (state.xp / needed) * 100;
    document.getElementById('xp-fill').style.width = pct + '%';
    document.getElementById('xp-current').textContent = state.xp;
    document.getElementById('xp-needed').textContent = needed;
    document.getElementById('user-level').textContent = state.level;
}

function renderDailyMission() {
    const nextLesson = getNextLesson();
    const el = document.getElementById('daily-mission-content');
    if (nextLesson) {
        el.innerHTML = `
            <p style="color: var(--text-primary);">
                <strong style="color: var(--neon-green);">TARGET:</strong> Complete Day ${nextLesson.day} — ${nextLesson.title}
            </p>
            <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.5rem;">
                Reward: +${nextLesson.xp} XP
            </p>
        `;
    } else {
        el.innerHTML = `<p style="color: var(--neon-green);">ALL SYSTEMS BREACHED. You are the Architect.</p>`;
    }
}

function getNextLesson() {
    for (const week of WEEKS) {
        for (const day of week.days) {
            if (!state.completedLessons.includes(day.day)) {
                return day;
            }
        }
    }
    return null;
}

function renderWeeksGrid() {
    const grid = document.getElementById('weeks-grid');
    grid.innerHTML = WEEKS.map(week => {
        const completed = week.days.filter(d => state.completedLessons.includes(d.day)).length;
        const total = week.days.length;
        const pct = Math.round((completed / total) * 100);
        const isComplete = completed === total;

        return `
            <div class="week-card ${isComplete ? 'completed' : ''}" onclick="openWeek(${week.id})">
                <div class="week-card-left">
                    <span class="week-number" style="color: ${week.color}; text-shadow: 0 0 10px ${week.color}55;">${String(week.id).padStart(2, '0')}</span>
                    <div class="week-info">
                        <h4>${week.title}</h4>
                        <p>${week.subtitle}</p>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-family: var(--font-display); font-size: 0.75rem; color: ${week.color};">${pct}%</div>
                    <div style="font-size: 0.6rem; color: var(--text-dim);">${completed}/${total}</div>
                </div>
            </div>
        `;
    }).join('');
}

// ============ LESSONS ============
let currentWeekId = 1;

function openWeek(weekId) {
    currentWeekId = weekId;
    showScreen('lessons');
    renderLessonsList(weekId);
}

function renderLessonsList(weekId) {
    const week = WEEKS.find(w => w.id === weekId);
    if (!week) return;

    document.getElementById('lesson-week-title').textContent = `WEEK ${weekId}: ${week.title}`;
    const completed = week.days.filter(d => state.completedLessons.includes(d.day)).length;
    document.getElementById('lesson-progress-text').textContent = `${completed}/${week.days.length}`;

    const list = document.getElementById('lessons-list');
    list.innerHTML = week.days.map(day => {
        const isCompleted = state.completedLessons.includes(day.day);
        return `
            <div class="lesson-item ${isCompleted ? 'completed' : ''}" onclick="openLesson(${weekId}, ${day.day})">
                <span class="lesson-day">D${String(day.day).padStart(2, '0')}</span>
                <div class="lesson-item-info">
                    <h4>${day.title}</h4>
                    <p>${day.subtitle} • +${day.xp} XP</p>
                </div>
            </div>
        `;
    }).join('');
}

let currentLessonDay = null;

function openLesson(weekId, dayNum) {
    currentLessonDay = dayNum;
    currentWeekId = weekId;
    LessonExperience.open(weekId, dayNum);
}

function goBackFromLesson() {
    showScreen('lessons');
    renderLessonsList(currentWeekId);
}

function completeLesson() {
    // Legacy entry point — completion now flows through LessonExperience.finish()
    LessonExperience.finish();
}

// ============ BREACH ANIMATION ============
function showBreachAnimation(topicName, xp) {
    const overlay = document.getElementById('breach-overlay');
    document.getElementById('breach-topic-name').textContent = topicName;
    document.getElementById('breach-xp-earned').textContent = xp;
    overlay.classList.remove('hidden');

    setTimeout(() => {
        overlay.classList.add('hidden');
    }, 2500);
}

// ============ QUIZ ============
let currentQuiz = null;
let currentQuestionIndex = 0;
let quizCorrect = 0;
let quizAnswered = false;

function renderQuizSelector() {
    const selector = document.getElementById('quiz-selector');
    selector.innerHTML = QUIZZES.map(quiz => {
        const score = state.quizScores[quiz.id];
        const scoreText = score !== undefined ? `Best: ${score}/${quiz.questionCount}` : 'Not attempted';
        return `
            <div class="quiz-card" onclick="startQuiz('${quiz.id}')">
                <h4>${quiz.title}</h4>
                <p>${quiz.subtitle}</p>
                <div class="quiz-meta">
                    <span><i class="fas fa-question-circle"></i> ${quiz.questionCount} questions</span>
                    <span><i class="fas fa-trophy"></i> ${scoreText}</span>
                </div>
            </div>
        `;
    }).join('');
}

function startQuiz(quizId) {
    currentQuiz = QUIZZES.find(q => q.id === quizId);
    currentQuestionIndex = 0;
    quizCorrect = 0;
    quizAnswered = false;
    showScreen('quiz-active');
    renderQuestion();
}

function renderQuestion() {
    if (currentQuestionIndex >= currentQuiz.questions.length) {
        showQuizResult();
        return;
    }

    const q = currentQuiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / currentQuiz.questions.length) * 100;
    document.getElementById('quiz-progress-fill').style.width = progress + '%';
    document.getElementById('quiz-q-count').textContent = `${currentQuestionIndex + 1}/${currentQuiz.questions.length}`;

    quizAnswered = false;

    document.getElementById('quiz-body').innerHTML = `
        <div class="quiz-question">${q.q}</div>
        <div class="quiz-options">
            ${q.options.map((opt, i) => `
                <div class="quiz-option" onclick="selectAnswer(${i})" id="opt-${i}">
                    ${opt}
                </div>
            `).join('')}
        </div>
        <div id="quiz-feedback"></div>
    `;
}

function selectAnswer(index) {
    if (quizAnswered) return;
    quizAnswered = true;

    const q = currentQuiz.questions[currentQuestionIndex];
    const isCorrect = index === q.correct;

    if (isCorrect) quizCorrect++;

    document.getElementById(`opt-${index}`).classList.add(isCorrect ? 'correct' : 'wrong');
    if (!isCorrect) {
        document.getElementById(`opt-${q.correct}`).classList.add('correct');
    }

    document.getElementById('quiz-feedback').innerHTML = `
        <div class="quiz-explanation">
            <strong style="color: ${isCorrect ? 'var(--neon-green)' : 'var(--error)'}">
                ${isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
            </strong><br><br>
            ${q.explanation}
        </div>
        <button class="neon-btn quiz-next-btn" onclick="nextQuestion()">
            ${currentQuestionIndex < currentQuiz.questions.length - 1 ? 'NEXT →' : 'SEE RESULTS'}
        </button>
    `;
}

function nextQuestion() {
    currentQuestionIndex++;
    renderQuestion();
}

function showQuizResult() {
    const total = currentQuiz.questions.length;
    const pct = Math.round((quizCorrect / total) * 100);
    const passed = pct >= 70;
    const xpEarned = passed ? quizCorrect * 15 : quizCorrect * 5;

    if (!state.quizScores[currentQuiz.id] || quizCorrect > state.quizScores[currentQuiz.id]) {
        state.quizScores[currentQuiz.id] = quizCorrect;
    }
    saveState();
    addXP(xpEarned);

    const resultIcon = document.getElementById('result-icon');
    resultIcon.innerHTML = passed
        ? '<i class="fas fa-unlock-alt"></i>'
        : '<i class="fas fa-lock"></i>';
    resultIcon.className = 'result-icon ' + (passed ? 'success' : 'fail');

    document.getElementById('result-title').textContent = passed ? 'EXPLOIT SUCCESSFUL' : 'EXPLOIT FAILED';
    document.getElementById('result-subtitle').textContent = passed
        ? `${pct}% — System compromised!`
        : `${pct}% — Access denied. Need 70% to breach.`;
    document.getElementById('result-correct').textContent = `${quizCorrect}/${total}`;
    document.getElementById('result-xp').textContent = `+${xpEarned}`;

    showScreen('quiz-result');
}

function retryQuiz() {
    if (currentQuiz) startQuiz(currentQuiz.id);
}

function exitQuiz() {
    showScreen('quiz');
    renderQuizSelector();
}

// ============ PROFILE ============
function renderProfile() {
    const content = document.getElementById('profile-content');
    const currentRankIdx = RANKS.findIndex(r => r.name === state.rank);

    content.innerHTML = `
        <div class="profile-avatar">
            <i class="fas ${RANKS[currentRankIdx].icon}"></i>
            <h3>${state.rank.replace('_', ' ')}</h3>
            <p>Level ${state.level} • ${state.xp}/${getXPNeeded()} XP</p>
        </div>

        <div class="profile-ranks">
            <h4><i class="fas fa-layer-group"></i> RANK PROGRESSION</h4>
            ${RANKS.map((rank, i) => {
                let cls = '';
                if (i < currentRankIdx) cls = 'achieved';
                else if (i === currentRankIdx) cls = 'current';
                return `
                    <div class="rank-item ${cls}">
                        <i class="fas ${rank.icon}" style="color: ${rank.color};"></i>
                        <span>${rank.name.replace('_', ' ')} — Level ${rank.minLevel}+</span>
                    </div>
                `;
            }).join('')}
        </div>

        <div class="profile-achievements">
            <h4><i class="fas fa-medal"></i> ACHIEVEMENTS</h4>
            <div class="achievements-grid">
                ${renderAchievement('fa-fire', 'First Streak', state.streak >= 1)}
                ${renderAchievement('fa-bolt', '7-Day Streak', state.streak >= 7)}
                ${renderAchievement('fa-server', '5 Systems', state.completedLessons.length >= 5)}
                ${renderAchievement('fa-database', '15 Systems', state.completedLessons.length >= 15)}
                ${renderAchievement('fa-network-wired', 'HLD Master (35)', state.completedLessons.length >= 35)}
                ${renderAchievement('fa-cube', 'LLD Master (50)', state.completedLessons.length >= 50)}
                ${renderAchievement('fa-crosshairs', 'Quiz Ace', Object.values(state.quizScores).some(s => s >= 9))}
                ${renderAchievement('fa-trophy', 'All Quizzes', Object.keys(state.quizScores).length >= 10)}
                ${renderAchievement('fa-crown', 'Architect', state.level >= 25)}
            </div>
        </div>

        <div style="margin-top: 2rem; text-align: center;">
            <button class="neon-btn secondary" onclick="resetProgress()">RESET PROGRESS</button>
        </div>
    `;
}

function renderAchievement(icon, label, unlocked) {
    return `
        <div class="achievement ${unlocked ? 'unlocked' : ''}">
            <i class="fas ${icon}"></i>
            <span>${label}</span>
        </div>
    `;
}

function resetProgress() {
    if (confirm('Reset all progress? This cannot be undone.')) {
        localStorage.removeItem('sysbreach_state');
        state = {
            xp: 0, level: 1, rank: 'SCRIPT_KIDDIE', streak: 0,
            lastActiveDate: null, completedLessons: [], quizScores: {}, daysActive: 0
        };
        saveState();
        renderDashboard();
        showScreen('dashboard');
    }
}

// ============ MATRIX RAIN ============
function initMatrixRain() {
    const canvas = document.getElementById('matrix-bg');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ{}[]<>/\\|=+-*&^%$#@!';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    function draw() {
        ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ff41';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(draw, 50);

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ============ LAB MODULE HANDLER ============
function openLabModule(type, key) {
    const container = document.getElementById('lab-module-content');
    const title = document.getElementById('lab-module-title');

    if (type === 'anim') {
        const config = ANIM_CONFIGS[key];
        title.textContent = 'ANIMATED FLOW';
        container.innerHTML = '';
        new AnimatedDiagram(container, config);
    } else if (type === 'builder') {
        const config = BUILDER_CONFIGS[key];
        title.textContent = 'ARCHITECTURE BUILDER';
        container.innerHTML = '';
        new ArchBuilder(container, config);
    } else if (type === 'code') {
        const config = CODE_CHALLENGES[key];
        title.textContent = 'CODE CHALLENGE';
        container.innerHTML = '';
        new CodeChallenge(container, config);
    } else if (type === 'mock') {
        const config = MOCK_CONFIGS[key];
        title.textContent = 'MOCK INTERVIEW';
        container.innerHTML = '';
        new MockInterview(container, config);
    } else if (type === 'flash') {
        const config = FLASHCARD_DECKS[key];
        title.textContent = 'FLASHCARDS';
        container.innerHTML = '';
        new FlashcardDeck(container, config);
    }

    showScreen('lab-module');
}

// ============ WALKTHROUGH HANDLER ============
function handleWT(qid, selected, correct) {
    const opts = document.getElementById(qid + '_opts');
    const reveal = document.getElementById(qid + '_reveal');
    const options = opts.querySelectorAll('.wt-option');

    options.forEach((opt, i) => {
        opt.classList.add('disabled');
        if (i === correct) opt.classList.add('correct');
        if (i === selected && i !== correct) opt.classList.add('wrong');
    });

    reveal.classList.add('visible');
}

// ============ SERVICE WORKER ============
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
}

// ============ START ============
document.addEventListener('DOMContentLoaded', init);
