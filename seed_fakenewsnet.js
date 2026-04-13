const fs = require('fs');
const path = require('path');
const https = require('https');

const dbPath = path.join(__dirname, 'database.json');
const FAKE_URL = 'https://raw.githubusercontent.com/KaiDMML/FakeNewsNet/master/dataset/politifact_fake.csv';
const REAL_URL = 'https://raw.githubusercontent.com/KaiDMML/FakeNewsNet/master/dataset/politifact_real.csv';

function downloadFile(filename) {
    return new Promise((resolve, reject) => {
        try {
            const data = fs.readFileSync(path.join(__dirname, filename), 'utf8');
            resolve(data);
        } catch (e) {
            reject(e);
        }
    });
}

function parseCSV(csvText, type) {
    const lines = csvText.split('\n');
    const result = [];
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        
        // Split by comma taking quotes into account
        const columns = line.match(/(?<=^|,)(?:"([^"]*)"|([^,]*))/g);
        if (!columns || columns.length < 3) continue;

        let id = columns[0] ? columns[0].replace(/^"|"$/g, '') : '';
        let url = columns[1] ? columns[1].replace(/^"|"$/g, '') : '';
        let title = columns[2] ? columns[2].replace(/^"|"$/g, '') : '';
        
        if (title.length < 10) continue;

        result.push({
            id: 'fnn_' + Date.now() + '_' + Math.floor(Math.random() * 1000000),
            type: type,
            title: title,
            source: 'PolitiFact/' + type,
            content: title, // Using title as content since FakeNewsNet doesn't provide body without scraping
            url: url,
            timestamp: new Date().toISOString()
        });
    }
    return result;
}

async function seedDatabase() {
    try {
        console.log("Loading existing database...");
        let database = [];
        if (fs.existsSync(dbPath)) {
            database = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        }

        console.log("Reading FakeNewsNet Polarifact Fake data...");
        const fakeCSV = await downloadFile('fake.csv');
        const fakeEntries = parseCSV(fakeCSV, 'fake');
        console.log(`Parsed ${fakeEntries.length} fake entries.`);

        console.log("Reading FakeNewsNet Polarifact Real data...");
        const realCSV = await downloadFile('real.csv');
        const realEntries = parseCSV(realCSV, 'real');
        console.log(`Parsed ${realEntries.length} real entries.`);

        const combined = [...database, ...fakeEntries, ...realEntries];
        
        fs.writeFileSync(dbPath, JSON.stringify(combined, null, 2));
        console.log(`Successfully seeded ${fakeEntries.length + realEntries.length} entries from FakeNewsNet!`);
        console.log(`Total database size: ${combined.length} entries.`);
    } catch (e) {
        console.error("Error generating dataset", e);
    }
}

seedDatabase();
