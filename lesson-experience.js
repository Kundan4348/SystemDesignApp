// ============ IN-LESSON EXPERIENCE ============
// Splits lessons into sections with progress bar, reading time, recap, confetti

const LessonExperience = {
    sections: [],
    currentSection: 0,
    weekId: null,
    dayNum: null,

    // Split lesson HTML into sections at each <h3>
    open(weekId, dayNum) {
        const week = WEEKS.find(w => w.id === weekId);
        const lesson = week.days.find(d => d.day === dayNum);
        if (!lesson) return;

        this.weekId = weekId;
        this.dayNum = dayNum;

        const div = document.createElement('div');
        div.innerHTML = lesson.content;

        // Build sections: banner+intro is section 0, then one per h3
        this.sections = [];
        let current = [];
        Array.from(div.children).forEach(el => {
            if (el.tagName === 'H3' && current.length > 0) {
                this.sections.push(current);
                current = [el];
            } else {
                current.push(el);
            }
        });
        if (current.length) this.sections.push(current);

        // If very few sections, don't paginate — show all at once
        if (this.sections.length <= 2) {
            this.sections = [Array.from(div.children)];
        }

        this.currentSection = 0;

        document.getElementById('lesson-title').textContent = `DAY ${dayNum}`;
        this.updateReadingTime(lesson);
        this.renderSection();
        showScreen('lesson-detail');
    },

    updateReadingTime(lesson) {
        const div = document.createElement('div');
        div.innerHTML = lesson.content;
        const words = (div.textContent || '').split(/\s+/).length;
        const minutes = Math.max(1, Math.round(words / 200));
        const el = document.getElementById('lesson-reading-time');
        if (el) el.textContent = `~${minutes} min read`;
    },

    renderSection() {
        const container = document.getElementById('lesson-content');
        const total = this.sections.length;
        const idx = this.currentSection;
        const pct = ((idx + 1) / total) * 100;

        const sectionHtml = this.sections[idx].map(el => el.outerHTML).join('');
        const isLast = idx === total - 1;
        const isFirst = idx === 0;

        container.innerHTML = `
            <div class="lesson-progress-track">
                <div class="lesson-progress-fill" style="width: ${pct}%"></div>
            </div>
            <div class="lesson-section-label">SECTION ${idx + 1} OF ${total}</div>
            <div class="lesson-section-body">${sectionHtml}</div>
            <div class="lesson-nav-row">
                ${!isFirst ? `<button class="neon-btn secondary" onclick="LessonExperience.prev()">← BACK</button>` : '<span></span>'}
                ${!isLast
                    ? `<button class="neon-btn" onclick="LessonExperience.next()">CONTINUE →</button>`
                    : `<button class="neon-btn" onclick="LessonExperience.finish()"><i class="fas fa-flag-checkered"></i> FINISH LESSON</button>`}
            </div>
        `;
        // Scroll to top of content
        container.scrollTop = 0;
        const detail = document.getElementById('lesson-detail');
        if (detail) detail.scrollTop = 0;
    },

    next() {
        if (this.currentSection < this.sections.length - 1) {
            this.currentSection++;
            this.renderSection();
        }
    },

    prev() {
        if (this.currentSection > 0) {
            this.currentSection--;
            this.renderSection();
        }
    },

    finish() {
        // Mark complete (existing logic) + add to revision queue + confetti
        currentLessonDay = this.dayNum;
        currentWeekId = this.weekId;
        if (!state.completedLessons.includes(this.dayNum)) {
            const week = WEEKS.find(w => w.id === this.weekId);
            const lesson = week.days.find(d => d.day === this.dayNum);
            state.completedLessons.push(this.dayNum);
            saveState();
            addXP(lesson.xp);
            RevisionEngine.addLesson(this.dayNum);
            fireConfetti();
            showBreachAnimation(lesson.title, lesson.xp);
            setTimeout(() => {
                showScreen('lessons');
                renderLessonsList(this.weekId);
            }, 2600);
        } else {
            showScreen('lessons');
            renderLessonsList(this.weekId);
        }
    }
};

// ============ CONFETTI ============
function fireConfetti() {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2000;';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const colors = ['#00ff41', '#00f0ff', '#bf00ff', '#ff006e', '#ffd000'];
    const pieces = Array.from({ length: 80 }, () => ({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 12 - 4,
        size: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 20
    }));

    let frame = 0;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.35; // gravity
            p.rotation += p.vr;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        });
        frame++;
        if (frame < 100) requestAnimationFrame(animate);
        else canvas.remove();
    }
    animate();
}
