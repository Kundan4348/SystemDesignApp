// ============ REVISION SYSTEM ============
// Completed lessons enter a spaced-repetition queue: 1d → 3d → 7d → 14d → 30d
// Due revisions surface on the dashboard and prompt the user.

const REVISION_INTERVALS = [1, 3, 7, 14, 30]; // days

const RevisionEngine = {
    load() {
        return JSON.parse(localStorage.getItem('sysbreach_revisions') || '{}');
    },

    save(data) {
        localStorage.setItem('sysbreach_revisions', JSON.stringify(data));
    },

    // Called when a lesson is completed for the first time
    addLesson(dayNum) {
        const data = this.load();
        if (data[dayNum]) return; // already tracked
        data[dayNum] = {
            stage: 0,
            due: Date.now() + REVISION_INTERVALS[0] * 86400000,
            lastRevised: null,
            timesRevised: 0
        };
        this.save(data);
    },

    // Lessons due for revision right now
    getDue() {
        const data = this.load();
        const now = Date.now();
        return Object.entries(data)
            .filter(([day, rec]) => rec.due <= now && rec.stage < REVISION_INTERVALS.length)
            .map(([day, rec]) => ({ day: parseInt(day), ...rec }))
            .sort((a, b) => a.due - b.due);
    },

    // Upcoming (not yet due) — for the schedule view
    getUpcoming() {
        const data = this.load();
        const now = Date.now();
        return Object.entries(data)
            .filter(([day, rec]) => rec.due > now && rec.stage < REVISION_INTERVALS.length)
            .map(([day, rec]) => ({ day: parseInt(day), ...rec }))
            .sort((a, b) => a.due - b.due);
    },

    // Mark a lesson as revised — advance to next interval
    markRevised(dayNum, remembered) {
        const data = this.load();
        const rec = data[dayNum];
        if (!rec) return;
        rec.timesRevised++;
        rec.lastRevised = Date.now();
        if (remembered) {
            rec.stage = Math.min(rec.stage + 1, REVISION_INTERVALS.length);
            if (rec.stage < REVISION_INTERVALS.length) {
                rec.due = Date.now() + REVISION_INTERVALS[rec.stage] * 86400000;
            } else {
                rec.due = Infinity; // mastered!
            }
        } else {
            // Forgot → back to stage 0
            rec.stage = 0;
            rec.due = Date.now() + REVISION_INTERVALS[0] * 86400000;
        }
        this.save(data);
    },

    getMasteredCount() {
        const data = this.load();
        return Object.values(data).filter(r => r.stage >= REVISION_INTERVALS.length).length;
    },

    findLesson(dayNum) {
        for (const week of WEEKS) {
            const day = week.days.find(d => d.day === dayNum);
            if (day) return { week, day };
        }
        return null;
    }
};

// ============ REVISION UI ============
function renderRevisionCard() {
    const due = RevisionEngine.getDue();
    const container = document.getElementById('revision-card-container');
    if (!container) return;

    if (due.length === 0) {
        const upcoming = RevisionEngine.getUpcoming();
        if (upcoming.length === 0 && Object.keys(RevisionEngine.load()).length === 0) {
            container.innerHTML = '';
            return;
        }
        const next = upcoming[0];
        const nextText = next
            ? `Next revision: Day ${next.day} in ${Math.ceil((next.due - Date.now()) / 86400000)}d`
            : 'All lessons mastered!';
        container.innerHTML = `
            <div class="revision-card all-clear">
                <i class="fas fa-brain"></i>
                <div>
                    <h4>MEMORY BANK SECURE</h4>
                    <p>${nextText} • ${RevisionEngine.getMasteredCount()} mastered</p>
                </div>
            </div>`;
        return;
    }

    container.innerHTML = `
        <div class="revision-card due" onclick="startRevisionSession()">
            <i class="fas fa-rotate"></i>
            <div>
                <h4>REVISION REQUIRED</h4>
                <p>${due.length} lesson${due.length > 1 ? 's' : ''} fading from memory — revise now to lock ${due.length > 1 ? 'them' : 'it'} in</p>
            </div>
            <span class="revision-badge">${due.length}</span>
        </div>`;
}

let revisionQueue = [];
let revisionIdx = 0;

function startRevisionSession() {
    revisionQueue = RevisionEngine.getDue();
    revisionIdx = 0;
    if (revisionQueue.length === 0) return;
    showScreen('revision-session');
    renderRevisionItem();
}

function renderRevisionItem() {
    const container = document.getElementById('revision-session-content');
    if (revisionIdx >= revisionQueue.length) {
        container.innerHTML = `
            <div class="revision-complete">
                <i class="fas fa-brain"></i>
                <h2>MEMORY REINFORCED</h2>
                <p>${revisionQueue.length} lesson${revisionQueue.length > 1 ? 's' : ''} revised. +${revisionQueue.length * 15} XP</p>
                <button class="neon-btn" onclick="showScreen('dashboard'); renderDashboard();">RETURN TO HQ</button>
            </div>`;
        addXP(revisionQueue.length * 15);
        if (typeof fireConfetti === 'function') fireConfetti();
        return;
    }

    const item = revisionQueue[revisionIdx];
    const found = RevisionEngine.findLesson(item.day);
    if (!found) { revisionIdx++; renderRevisionItem(); return; }

    const { week, day } = found;
    const takeaways = extractTakeaways(day.content);

    document.getElementById('revision-progress-text').textContent =
        `${revisionIdx + 1}/${revisionQueue.length}`;

    container.innerHTML = `
        <div class="revision-item">
            <div class="revision-stage">
                <span class="stage-label">REVISION ${item.timesRevised + 1}</span>
                <span class="stage-dots">${REVISION_INTERVALS.map((_, i) =>
                    `<span class="stage-dot ${i < item.stage ? 'done' : i === item.stage ? 'current' : ''}"></span>`
                ).join('')}</span>
            </div>
            <h3>Day ${day.day}: ${day.title}</h3>
            <p class="revision-subtitle">${day.subtitle} • Week ${week.id}: ${week.title}</p>

            <div class="revision-recall-prompt">
                <h4><i class="fas fa-lightbulb"></i> ACTIVE RECALL</h4>
                <p>Before revealing — try to recall out loud:</p>
                <ul>
                    <li>What is the core concept of this topic?</li>
                    <li>What are the main tradeoffs?</li>
                    <li>When would you use it in a design?</li>
                </ul>
                <button class="neon-btn" onclick="revealTakeaways()">REVEAL KEY POINTS</button>
            </div>

            <div class="revision-takeaways hidden" id="revision-takeaways">
                ${takeaways}
                <div class="revision-verdict">
                    <p>Did you remember the core ideas?</p>
                    <div class="revision-buttons">
                        <button class="fc-btn hard" onclick="finishRevision(false)">
                            <i class="fas fa-times"></i> FORGOT — RESET
                        </button>
                        <button class="fc-btn easy" onclick="finishRevision(true)">
                            <i class="fas fa-check"></i> REMEMBERED
                        </button>
                    </div>
                    <button class="neon-btn secondary" style="margin-top:0.75rem" onclick="openFullLesson(${week.id}, ${day.day})">
                        <i class="fas fa-book-open"></i> RE-READ FULL LESSON
                    </button>
                </div>
            </div>
        </div>`;
}

function extractTakeaways(content) {
    // Pull out concept cards, info boxes, and tables as the revision digest
    const div = document.createElement('div');
    div.innerHTML = content;
    const parts = [];
    // Grab concept cards (key concepts)
    div.querySelectorAll('.concept-card').forEach((el, i) => {
        if (i < 5) parts.push(el.outerHTML);
    });
    // Grab info boxes (key rules)
    div.querySelectorAll('.info-box, .why-box').forEach((el, i) => {
        if (i < 2) parts.push(el.outerHTML);
    });
    if (parts.length === 0) {
        // Fallback: first table or first two paragraphs
        const table = div.querySelector('table');
        if (table) parts.push(table.outerHTML);
        else div.querySelectorAll('p').forEach((el, i) => { if (i < 3) parts.push(el.outerHTML); });
    }
    return parts.join('');
}

function revealTakeaways() {
    document.getElementById('revision-takeaways').classList.remove('hidden');
    document.querySelector('.revision-recall-prompt button').style.display = 'none';
}

function finishRevision(remembered) {
    const item = revisionQueue[revisionIdx];
    RevisionEngine.markRevised(item.day, remembered);
    revisionIdx++;
    renderRevisionItem();
}

function openFullLesson(weekId, dayNum) {
    openLesson(weekId, dayNum);
}
