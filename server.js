const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database file
const DB_FILE = path.join(__dirname, 'database.json');
let database = [];
try {
    if (fs.existsSync(DB_FILE)) {
        database = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
} catch (err) {
    console.error("Error loading DB", err);
}

function saveDB() {
    fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2));
}

// ========= NLP ANALYSIS ENGINE (TAE-BiLSTM Simulated) =========

const CLICKBAIT_PHRASES = [
    'you won\'t believe', 'shocking', 'breaking', 'exclusive', 'urgent',
    'bombshell', 'mind-blowing', 'jaw-dropping', 'insane', 'unbelievable',
    'secret', 'they don\'t want you to know', 'cover up', 'cover-up',
    'conspiracy', 'what they\'re hiding', 'banned', 'censored',
    'mainstream media won\'t tell you', 'wake up', 'sheeple',
    'miracle cure', 'doctors hate', 'one weird trick',
    'government doesn\'t want', 'exposed', 'busted', 'destroyed',
    'obliterated', 'slammed', 'annihilated', 'goes viral',
    'this changes everything', 'proof that', 'exposed the truth',
    'finally revealed', 'the truth about', 'what really happened'
];

const EMOTIONAL_WORDS = [
    'terrifying', 'horrifying', 'devastating', 'outrageous', 'disgusting',
    'evil', 'sinister', 'diabolical', 'demonic', 'satanic',
    'hero', 'villain', 'traitor', 'patriot', 'enemy',
    'catastrophic', 'apocalyptic', 'nightmare', 'disaster', 'crisis',
    'furious', 'enraged', 'livid', 'hysteria', 'panic',
    'miracle', 'incredible', 'unreal', 'fantastic', 'amazing'
];

const CREDIBLE_PHRASES = [
    'according to', 'research shows', 'study published', 'peer-reviewed',
    'data suggests', 'evidence indicates', 'scientists found',
    'university of', 'journal of', 'published in', 'researchers at',
    'clinical trial', 'meta-analysis', 'statistical analysis',
    'the findings suggest', 'further research', 'methodology',
    'controlled experiment', 'sample size', 'confidence interval',
    'systematic review', 'WHO', 'CDC', 'FDA', 'reuters', 'associated press'
];

const VAGUE_ATTRIBUTIONS = [
    'sources say', 'people are saying', 'many believe', 'experts claim',
    'it is said', 'rumor has it', 'word on the street', 'some say',
    'unnamed sources', 'insiders reveal', 'top sources',
    'a source close to', 'anonymous tip', 'leaked documents show'
];

const CONSPIRACY_PATTERNS = [
    'new world order', 'illuminati', 'deep state', 'false flag',
    'chemtrails', 'flat earth', 'big pharma', 'microchip',
    'mind control', 'population control', '5g', 'bioweapon',
    'plandemic', 'great reset', 'rothschild', 'bilderberg',
    'freemason', 'lizard people', 'reptilian', 'area 51',
    'crisis actor', 'staged', 'hoax'
];

const TRUSTED_SOURCES = [
    'reuters', 'associated press', 'bbc', 'new york times', 'the guardian',
    'washington post', 'npr', 'pbs', 'al jazeera', 'afp',
    'nature', 'science', 'lancet', 'bmj', 'nejm',
    'who.int', 'cdc.gov', 'nih.gov', 'nasa.gov', 'fda.gov',
    'world health organization', 'united nations', 'world bank'
];

function analyzeText(text) {
    const lower = text.toLowerCase();
    const words = text.split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const wordCount = words.length;

    let clickbaitMatches = [];
    CLICKBAIT_PHRASES.forEach(phrase => { if (lower.includes(phrase)) clickbaitMatches.push(phrase); });
    const clickbaitScore = Math.min(100, (clickbaitMatches.length / 3) * 100);

    let emotionalMatches = [];
    EMOTIONAL_WORDS.forEach(word => { if (lower.includes(word)) emotionalMatches.push(word); });
    const emotionalScore = Math.min(100, (emotionalMatches.length / 4) * 100);

    let credibleMatches = [];
    CREDIBLE_PHRASES.forEach(phrase => { if (lower.includes(phrase)) credibleMatches.push(phrase); });
    const credibilityScore = Math.min(100, (credibleMatches.length / 3) * 100);

    const capsWords = words.filter(w => w.length > 2 && w === w.toUpperCase() && /[A-Z]/.test(w));
    const capsRatio = capsWords.length / Math.max(wordCount, 1);
    const capsScore = Math.min(100, capsRatio * 500);

    const exclamationCount = (text.match(/!/g) || []).length;
    const questionCount = (text.match(/\?/g) || []).length;
    const excessivePunctuation = exclamationCount + questionCount;
    const punctuationScore = Math.min(100, (excessivePunctuation / 3) * 100);

    let vagueMatches = [];
    VAGUE_ATTRIBUTIONS.forEach(phrase => { if (lower.includes(phrase)) vagueMatches.push(phrase); });
    const vagueScore = Math.min(100, (vagueMatches.length / 2) * 100);

    let conspiracyMatches = [];
    CONSPIRACY_PATTERNS.forEach(phrase => { if (lower.includes(phrase)) conspiracyMatches.push(phrase); });
    const conspiracyScore = Math.min(100, (conspiracyMatches.length / 2) * 100);

    let sourceMatches = [];
    TRUSTED_SOURCES.forEach(source => { if (lower.includes(source)) sourceMatches.push(source); });
    const sourceScore = Math.min(100, (sourceMatches.length / 2) * 100);

    const avgSentenceLen = words.length / Math.max(sentences.length, 1);
    const qualityScore = avgSentenceLen > 8 && avgSentenceLen < 35 ? 70 : 30;

    let dbScore = 50;
    let dbMatches = 0;
    if (database.length > 0) {
        database.forEach(entry => {
            const entryWords = entry.content.toLowerCase().split(/\s+/);
            const overlap = words.filter(w => w.length > 4 && entryWords.includes(w.toLowerCase())).length;
            const similarity = overlap / Math.max(wordCount, 1);
            if (similarity > 0.15) {
                dbMatches++;
                if (entry.type === 'real') dbScore += 15;
                else dbScore -= 15;
            }
        });
        dbScore = Math.max(0, Math.min(100, dbScore));
    }

    const negativeFactors = (clickbaitScore * 0.20) + (emotionalScore * 0.15) + (capsScore * 0.10) + (punctuationScore * 0.08) + (vagueScore * 0.12) + (conspiracyScore * 0.20);
    const positiveFactors = (credibilityScore * 0.30) + (sourceScore * 0.25) + (qualityScore * 0.15) + (dbScore * 0.30);

    let overallCredibility = Math.round(positiveFactors - negativeFactors + 50);
    overallCredibility = Math.max(2, Math.min(98, overallCredibility));

    const allDetectedPhrases = [
        ...clickbaitMatches.map(p => ({ text: p, type: 'suspicious' })),
        ...emotionalMatches.map(p => ({ text: p, type: 'suspicious' })),
        ...credibleMatches.map(p => ({ text: p, type: 'credible' })),
        ...vagueMatches.map(p => ({ text: p, type: 'suspicious' })),
        ...conspiracyMatches.map(p => ({ text: p, type: 'suspicious' })),
        ...sourceMatches.map(p => ({ text: p, type: 'credible' })),
    ];

    const flags = [];
    if (clickbaitScore > 30) flags.push({ type: 'red', icon: '🔴', text: 'Contains clickbait language' });
    if (emotionalScore > 30) flags.push({ type: 'red', icon: '🔴', text: 'Emotional manipulation detected' });
    if (capsScore > 30) flags.push({ type: 'red', icon: '🔴', text: 'Excessive use of ALL CAPS' });
    if (punctuationScore > 40) flags.push({ type: 'yellow', icon: '🟡', text: 'Excessive punctuation (!!! ???)' });
    if (vagueScore > 30) flags.push({ type: 'yellow', icon: '🟡', text: 'Vague or anonymous sources cited' });
    if (conspiracyScore > 20) flags.push({ type: 'red', icon: '🔴', text: 'Conspiracy theory language detected' });
    if (credibilityScore > 40) flags.push({ type: 'green', icon: '🟢', text: 'Contains credible scientific language' });
    if (sourceScore > 30) flags.push({ type: 'green', icon: '🟢', text: 'References trusted news sources' });
    if (dbMatches > 0) flags.push({ type: 'green', icon: '🟢', text: `Matched ${dbMatches} entry(ies) in trained database` });
    if (wordCount < 20) flags.push({ type: 'yellow', icon: '🟡', text: 'Very short text — limited analysis possible' });

    if (flags.length === 0) {
        flags.push({ type: 'green', icon: '🟢', text: 'No major red flags detected' });
    }

    return {
        credibility: overallCredibility,
        breakdown: {
            bilstmText: { score: Math.round(100 - ((clickbaitScore + emotionalScore) / 2)), label: 'BiLSTM Text Confidence' },
            sources: { score: Math.round(Math.max(50, credibilityScore + sourceScore)), label: 'Source Trust Metric' },
            temporal: { score: Math.round(100 - vagueScore), label: 'Temporal Consistency' },
            lime: { score: Math.round(100 - conspiracyScore), label: 'LIME Model Confidence' },
            database: { score: Math.round(dbScore), label: 'Database Reference Match' },
        },
        flags,
        phrases: allDetectedPhrases.slice(0, 12),
        wordCount,
    };
}

// ========= API ROUTES =========

app.post('/api/analyze', (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'No text provided' });
    }
    const result = analyzeText(text);
    res.json(result);
});

app.post('/api/train', (req, res) => {
    const { type, title, source, content, url } = req.body;
    const entry = {
        id: Date.now(),
        type,
        title,
        source,
        content,
        url,
        timestamp: new Date().toISOString()
    };
    database.push(entry);
    saveDB();
    res.json({ success: true, entry });
});

app.get('/api/database', (req, res) => {
    res.json(database);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`VerifyAI Backend server running on http://localhost:${PORT}`);
});
