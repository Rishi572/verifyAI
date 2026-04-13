// ========================================
// VerifyAI — Fake News Detector Engine (Backend Powered)
// ========================================

(function () {
    'use strict';

    // ========= LOCAL STORAGE FOR HISTORY/STATS =========
    const HISTORY_KEY = 'verifyai_history';
    const STATS_KEY = 'verifyai_stats';

    let history = loadFromStorage(HISTORY_KEY, []);
    let stats = loadFromStorage(STATS_KEY, { analyzed: 0 });
    let database = []; // Managed by backend

    function loadFromStorage(key, fallback) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : fallback;
        } catch { return fallback; }
    }

    function saveToStorage(key, data) {
        try { localStorage.setItem(key, JSON.stringify(data)); } catch { }
    }

    // ========= UI HELPERS =========

    function $(id) { return document.getElementById(id); }
    function $$(sel) { return document.querySelectorAll(sel); }

    function showToast(message, type = 'info') {
        const container = $('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = { success: '✅', error: '❌', info: 'ℹ️' };
        toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span>${message}`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function getVerdictInfo(score) {
        if (score >= 50) return { text: `PREDICTED: REAL (${score}% Confidence)`, color: '#22c55e', class: 'credible' };
        return { text: `PREDICTED: FAKE (${100 - score}% Confidence)`, color: '#ef4444', class: 'fake' };
    }

    function getBreakdownColor(score) {
        if (score >= 70) return '#22c55e';
        if (score >= 45) return '#f59e0b';
        return '#ef4444';
    }

    function getScoreClass(score) {
        if (score >= 70) return 'high';
        if (score >= 45) return 'medium';
        return 'low';
    }

    // ========= NAVIGATION =========

    $$('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            $$('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            $$('.section').forEach(s => s.classList.remove('active'));
            $(`section-${section}`).classList.add('active');

            if (section === 'stats') updateStats();
            if (section === 'history') renderHistory();
        });
    });

    // ========= INPUT TABS =========

    $$('.input-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            $$('.input-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const inputType = tab.dataset.input;
            $('input-text-container').classList.toggle('hidden', inputType !== 'text');
            $('input-url-container').classList.toggle('hidden', inputType !== 'url');
        });
    });

    // Character count
    $('news-text-input').addEventListener('input', () => {
        const len = $('news-text-input').value.length;
        $('char-count').textContent = `${len} character${len !== 1 ? 's' : ''}`;
    });

    // ========= SAMPLE ARTICLES =========

    const sampleArticles = {
        fake1: "BREAKING: Scientists discover that drinking coffee makes you immortal — government tries to cover it up! EXPOSED: Big Pharma has been HIDING this miracle cure for DECADES. Sources say they don't want you to know the truth. WAKE UP people! This changes EVERYTHING about what we thought we knew!!! Share before they censor this!!!",
        real1: "WHO reports global decline in malaria deaths by 12% following widespread distribution of treated bed nets in Sub-Saharan Africa. According to a peer-reviewed study published in The Lancet, data from 30 countries suggests that systematic distribution programs, combined with improved diagnostic methods, have contributed to a significant reduction in malaria-related mortality. The World Health Organization confirmed these findings during their annual conference, noting that further research is needed to sustain these gains.",
        fake2: "SHOCKING: Secret documents reveal that the moon landing was filmed in a Hollywood studio by Stanley Kubrick!!! The TRUTH has been EXPOSED and the deep state is PANICKING!!! Anonymous insiders say NASA has been covering this up for decades. They don't want you to know!!! SHARE THIS before it gets CENSORED!!! The illuminati is behind EVERYTHING!!!"
    };

    $$('.sample-card').forEach(card => {
        card.addEventListener('click', () => {
            const sampleKey = card.dataset.sample;
            $('news-text-input').value = sampleArticles[sampleKey];
            $('news-text-input').dispatchEvent(new Event('input'));

            // Switch to text tab
            $$('.input-tab').forEach(t => t.classList.remove('active'));
            $('tab-text').classList.add('active');
            $('input-text-container').classList.remove('hidden');
            $('input-url-container').classList.add('hidden');

            // Scroll to input
            $('input-area').scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });

    // ========= ANALYZE =========

    let currentAnalysisText = '';

    $('btn-analyze').addEventListener('click', () => {
        const isTextMode = $('tab-text').classList.contains('active');
        let text = '';

        if (isTextMode) {
            text = $('news-text-input').value.trim();
        } else {
            const url = $('news-url-input').value.trim();
            if (!url) {
                showToast('Please enter a URL to analyze', 'error');
                return;
            }
            text = `Article from ${url}: This is simulated content extracted from the provided URL for analysis purposes. In a production environment, the system would fetch and parse the actual page content.`;
        }

        if (!text || text.length < 10) {
            showToast('Please enter at least 10 characters to analyze', 'error');
            return;
        }

        currentAnalysisText = text;
        runAnalysis(text);
    });

    async function runAnalysis(text) {
        // Show results area & loading
        $('results-area').classList.remove('hidden');
        $('loading-state').classList.remove('hidden');
        $('result-display').classList.add('hidden');
        $('samples-area').classList.add('hidden');

        // Reset steps
        $$('.step').forEach(s => { s.classList.remove('active', 'done'); });

        // Start step animation
        const steps = ['step-1', 'step-2', 'step-3', 'step-4'];
        let stepIndex = 0;
        let animationDone = false;
        let resultData = null;

        function updateStepAnimation() {
            if (stepIndex < steps.length) {
                if (stepIndex > 0) $(steps[stepIndex - 1]).classList.replace('active', 'done');
                $(steps[stepIndex]).classList.add('active');
                stepIndex++;
                setTimeout(updateStepAnimation, 500 + Math.random() * 400);
            } else {
                $(steps[steps.length - 1]).classList.replace('active', 'done');
                animationDone = true;
                checkDisplayResults();
            }
        }

        function checkDisplayResults() {
            if (animationDone && resultData) {
                setTimeout(() => showResults(text, resultData), 400);
            }
        }

        $('results-area').scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(updateStepAnimation, 300);

        // Fetch from backend
        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            if (!response.ok) throw new Error('Analysis failed');
            
            resultData = await response.json();
            
            // Map specific project variables strictly explicitly for external binding tracking if necessary
            window.bilstmScore = resultData.confidence * 100;
            
            checkDisplayResults();
        } catch (error) {
            console.error('Error during analysis:', error);
            showToast('Error connecting to backend server', 'error');
            $('loading-state').classList.add('hidden');
        }
    }

    function showResults(text, result) {
        $('loading-state').classList.add('hidden');
        $('result-display').classList.remove('hidden');

        const verdict = getVerdictInfo(result.credibility);

        // Animate gauge
        const gaugeEl = $('gauge-fill');
        const maxDashOffset = 251.3;
        const targetOffset = maxDashOffset - (maxDashOffset * result.credibility / 100);

        setTimeout(() => {
            gaugeEl.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)';
            gaugeEl.style.strokeDashoffset = targetOffset;
        }, 100);

        // Animate number
        animateNumber($('gauge-number'), 0, result.credibility, 1500);

        // Verdict
        $('gauge-verdict').textContent = verdict.text;
        $('gauge-verdict').style.color = verdict.color;
        $('gauge-number').style.color = verdict.color;
        
        // Explanation
        if (result.explanation && $('gauge-explanation')) {
            $('gauge-explanation').textContent = result.explanation;
        }

        // Breakdown
        const breakdownContainer = $('breakdown-items');
        breakdownContainer.innerHTML = '';
        Object.values(result.breakdown).forEach((item, i) => {
            const color = getBreakdownColor(item.score);
            const el = document.createElement('div');
            el.className = 'breakdown-item';
            el.innerHTML = `
                <div class="breakdown-header">
                    <span class="breakdown-name">${item.label}</span>
                    <span class="breakdown-value" style="color: ${color}">${item.score}%</span>
                </div>
                <div class="breakdown-bar">
                    <div class="breakdown-fill" style="background: ${color}" data-width="${item.score}%"></div>
                </div>
            `;
            breakdownContainer.appendChild(el);
            // Animate bar
            setTimeout(() => {
                el.querySelector('.breakdown-fill').style.width = `${item.score}%`;
            }, 200 + i * 100);
        });

        // Flags
        const flagsContainer = $('flags-list');
        flagsContainer.innerHTML = '';
        result.flags.forEach((flag, i) => {
            const el = document.createElement('div');
            el.className = `flag-item ${flag.type === 'red' ? 'red' : flag.type === 'yellow' ? 'yellow' : 'green'}`;
            el.style.animationDelay = `${i * 0.1}s`;
            el.innerHTML = `<span class="flag-icon">${flag.icon}</span><span>${flag.text}</span>`;
            flagsContainer.appendChild(el);
        });

        // Phrases
        const phrasesContainer = $('phrases-cloud');
        phrasesContainer.innerHTML = '';
        if (result.phrases.length === 0) {
            phrasesContainer.innerHTML = '<span style="color: var(--text-muted); font-size: 0.85rem;">No notable phrases detected</span>';
        } else {
            result.phrases.forEach((phrase, i) => {
                const tag = document.createElement('span');
                tag.className = `phrase-tag ${phrase.type}`;
                tag.style.animationDelay = `${i * 0.05}s`;
                tag.textContent = phrase.text;
                phrasesContainer.appendChild(tag);
            });
        }

        // Save to history
        const historyEntry = {
            id: Date.now(),
            text: text.substring(0, 200),
            score: result.credibility,
            verdict: verdict.text,
            verdictClass: verdict.class,
            timestamp: new Date().toISOString(),
            wordCount: result.wordCount,
        };
        history.unshift(historyEntry);
        if (history.length > 50) history.pop();
        saveToStorage(HISTORY_KEY, history);

        stats.analyzed = (stats.analyzed || 0) + 1;
        saveToStorage(STATS_KEY, stats);

        updateDBCount();
    }

    function animateNumber(element, start, end, duration) {
        const range = end - start;
        const startTime = performance.now();
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            element.textContent = Math.round(start + range * eased);
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    // ========= TRAIN BUTTONS (from results) =========

    $('btn-mark-real').addEventListener('click', () => {
        if (!currentAnalysisText) return;
        addToDatabase('real', 'User-analyzed article', 'Manual Analysis', currentAnalysisText);
    });

    $('btn-mark-fake').addEventListener('click', () => {
        if (!currentAnalysisText) return;
        addToDatabase('fake', 'User-analyzed article', 'Manual Analysis', currentAnalysisText);
    });

    // ========= TRAIN DB SECTION =========

    let currentTrainType = 'real';

    $$('.type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTrainType = btn.dataset.type;
        });
    });

    $('btn-submit-train').addEventListener('click', () => {
        const title = $('train-title').value.trim();
        const source = $('train-source').value.trim();
        const content = $('train-content').value.trim();
        const url = $('train-url').value.trim();

        if (!title) { showToast('Please enter an article title', 'error'); return; }
        if (!content) { showToast('Please enter article content', 'error'); return; }

        addToDatabase(currentTrainType, title, source || 'Unknown', content, url);

        // Reset form
        $('train-title').value = '';
        $('train-source').value = '';
        $('train-content').value = '';
        $('train-url').value = '';
    });

    async function addToDatabase(type, title, source, content, url = '') {
        try {
            const response = await fetch('/api/train', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, title, source, content, url })
            });

            if (!response.ok) throw new Error('Training submission failed');

            const data = await response.json();
            if (data.success) {
                database.push(data.entry);
                updateDBCount();
                renderSubmissions();
                showToast(`Article added as ${type.toUpperCase()} to Database`, 'success');
            }
        } catch (error) {
            console.error('Error submitting to database:', error);
            showToast('Failed to connect to backend', 'error');
        }
    }

    function renderSubmissions() {
        const list = $('submissions-list');
        if (database.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                    <p>No submissions yet. Start training the database!</p>
                </div>`;
            return;
        }

        const recent = [...database].reverse().slice(0, 20);
        list.innerHTML = recent.map(entry => `
            <div class="submission-item">
                <span class="submission-type ${entry.type}">${entry.type}</span>
                <div class="submission-info">
                    <div class="submission-title">${escapeHtml(entry.title)}</div>
                    <div class="submission-source">${escapeHtml(entry.source)}</div>
                </div>
            </div>
        `).join('');
    }

    // ========= HISTORY =========

    function renderHistory() {
        const list = $('history-list');
        if (history.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <p>No analyses yet. Start by analyzing an article!</p>
                </div>`;
            return;
        }

        list.innerHTML = history.map(item => {
            const scoreClass = getScoreClass(item.score);
            const date = new Date(item.timestamp);
            const timeStr = date.toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            return `
                <div class="history-item">
                    <div class="history-score ${scoreClass}">${item.score}</div>
                    <div class="history-info">
                        <div class="history-text">${escapeHtml(item.text)}</div>
                        <div class="history-meta">
                            <span>${timeStr}</span>
                            <span>${item.wordCount} words</span>
                        </div>
                    </div>
                    <span class="history-verdict ${item.verdictClass}">${item.verdict}</span>
                </div>
            `;
        }).join('');
    }

    // ========= STATS =========

    function updateStats() {
        const totalEntries = database.length;
        const realEntries = database.filter(e => e.type === 'real').length;
        const fakeEntries = database.filter(e => e.type === 'fake').length;
        const analyzed = stats.analyzed || 0;

        animateNumber($('stat-total-val'), 0, totalEntries, 800);
        animateNumber($('stat-real-val'), 0, realEntries, 800);
        animateNumber($('stat-fake-val'), 0, fakeEntries, 800);
        animateNumber($('stat-analyzed-val'), 0, analyzed, 800);

        // Composition bar
        if (totalEntries > 0) {
            const realPct = Math.round((realEntries / totalEntries) * 100);
            const fakePct = 100 - realPct;
            $('comp-real').style.width = `${realPct}%`;
            $('comp-fake').style.width = `${fakePct}%`;
            $('comp-real-pct').textContent = `${realPct}%`;
            $('comp-fake-pct').textContent = `${fakePct}%`;
        } else {
            $('comp-real').style.width = '50%';
            $('comp-fake').style.width = '50%';
            $('comp-real-pct').textContent = '0%';
            $('comp-fake-pct').textContent = '0%';
        }
    }

    function updateDBCount() {
        $('db-count').textContent = database.length;
    }

    // ========= UTILS =========

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // ========= INIT =========

    async function init() {
        try {
            const res = await fetch('/api/database');
            if (res.ok) {
                database = await res.json();
            }
        } catch (error) {
            console.error("Failed to load DB from backend:", error);
        }

        updateDBCount();
        renderSubmissions();
        renderHistory();
        updateStats();

        // Seed data is now handled by backend (or just rely on the API array).
        // Since backend starts empty, let's optionally seed here if backend is empty
        if (database.length === 0) {
            const seedData = [
                {
                    type: 'fake', title: 'Miracle Drug Cures All Diseases', source: 'UnknownBlog.com',
                    content: 'SHOCKING DISCOVERY! Scientists don\'t want you to know about this miracle cure they\'ve been hiding. Big pharma is trying to cover up this secret that doctors hate! Share before they censor this!!!'
                },
                {
                    type: 'real', title: 'Climate Change Report 2024', source: 'Reuters',
                    content: 'According to a peer-reviewed study published in Nature, global temperatures have risen by 1.2 degrees Celsius since pre-industrial times. The research, conducted by scientists at the University of Oxford, analyzed data from over 100 monitoring stations. The World Health Organization has expressed concern about the health implications.'
                }
            ];

            // Submit seed data to backend asynchronously
            for (const item of seedData) {
                await addToDatabase(item.type, item.title, item.source, item.content);
            }
        }
    }

    init();

    async function fetchMetrics() {
        try {
            const res = await fetch('/api/metrics');
            if (res.ok) {
                const data = await res.json();
                const logContainer = $('terminal-logs');
                if (!logContainer) return;

                let logHtml = `<div style="color:#06b6d4; margin-bottom: 5px;">$ python3 train.py</div>`;
                logHtml += `<div style="color:#a3a3a3; margin-bottom: 5px;">Building vocabulary...<br>Encoding text to sequences...<br>Training BiLSTM Model...</div>`;
                data.epochs.forEach(ep => {
                    logHtml += `<div>[Epoch ${ep.epoch}/10] - Loss: ${ep.loss.toFixed(4)}</div>`;
                });
                logHtml += `<div style="color:#f59e0b; margin-top: 10px; border-top: 1px dashed #444; padding-top: 5px;">
                    EVALUATION METRICS:<br>
                    Accuracy : ${data.metrics.accuracy}%<br>
                    Precision: ${data.metrics.precision}%<br>
                    Recall   : ${data.metrics.recall}%<br>
                    F1-score : ${data.metrics.f1}
                </div>`;
                logContainer.innerHTML = logHtml;
            }
        } catch(e) { console.error('Metrics fetch error:', e); }
    }

    fetchMetrics();
})();
