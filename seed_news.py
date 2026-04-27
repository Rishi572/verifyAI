"""
Seed recent news data (IPL 2026, Cricket, Politics) into the VerifyAI database.
Run: python seed_news.py
"""
import json, os, time
from datetime import datetime

DB_FILE = os.path.join(os.path.dirname(__file__), 'database.json')

# Load existing database
if os.path.exists(DB_FILE):
    with open(DB_FILE, 'r', encoding='utf-8') as f:
        database = json.load(f)
else:
    database = []

existing_count = len(database)

new_entries = [
    # === IPL 2026 - REAL NEWS ===
    {
        "type": "real",
        "title": "RCB demolish Delhi Capitals, DC bowled out for 75 in IPL 2026",
        "source": "NDTV Sports",
        "content": "Royal Challengers Bengaluru won by 9 wickets against Delhi Capitals at the Arun Jaitley Stadium. RCB bowlers dominated the match, bundling out Delhi Capitals for just 75 runs in 16.4 overs. Josh Hazlewood and Bhuvneshwar Kumar led the bowling attack, taking four and three wickets respectively. DC suffered a historic collapse, recording the lowest-ever powerplay score in IPL history at 13/6. RCB comfortably chased down the target of 76 runs in just 6.3 overs.",
        "url": "https://ndtv.com"
    },
    {
        "type": "real",
        "title": "KKR defeat LSG in dramatic Super Over after scores tied at 155",
        "source": "Hindustan Times",
        "content": "Kolkata Knight Riders defeated Lucknow Super Giants in a thrilling Super Over after the match tied at 155 runs each in the IPL 2026 league stage. KKR held their nerve in the Super Over to secure the two crucial points. This was one of the most dramatic finishes in the IPL 2026 season.",
        "url": "https://hindustantimes.com"
    },
    {
        "type": "real",
        "title": "Gujarat Titans defeat CSK by 8 wickets in IPL 2026",
        "source": "ESPN Cricinfo",
        "content": "Gujarat Titans registered a comprehensive 8-wicket victory over Chennai Super Kings in the IPL 2026 on April 26. The bowlers set up the win with a disciplined performance before the batters chased down the target with ease.",
        "url": "https://espncricinfo.com"
    },
    {
        "type": "real",
        "title": "Abhishek Sharma equals Virat Kohli T20 century record with 135-run masterclass",
        "source": "The Hindu",
        "content": "Sunrisers Hyderabad batter Abhishek Sharma equaled Virat Kohli record for T20 centuries with a stunning 135-run masterclass in the IPL 2026. The aggressive left-hander smashed bowlers all around the park in one of the most memorable innings of the season. His knock powered SRH to a massive total.",
        "url": "https://thehindu.com"
    },
    {
        "type": "real",
        "title": "Punjab Kings maintain top spot on IPL 2026 points table",
        "source": "Mykhel",
        "content": "Punjab Kings have maintained a strong lead at the top of the IPL 2026 points table throughout April. Teams like Royal Challengers Bengaluru, Sunrisers Hyderabad, and Rajasthan Royals are competing for the top playoff spots. Lucknow Super Giants have faced difficulties, recently dropping to the bottom of the table.",
        "url": "https://mykhel.com"
    },
    {
        "type": "real",
        "title": "CSK defeat Mumbai Indians by massive 103-run margin in IPL 2026",
        "source": "Rediff Sports",
        "content": "Chennai Super Kings registered a massive 103-run victory over Mumbai Indians in the IPL 2026 on April 23. CSK posted a huge total and then bowled out MI cheaply, inflicting one of the heaviest defeats in IPL history on the five-time champions.",
        "url": "https://rediff.com"
    },
    {
        "type": "real",
        "title": "Sunrisers Hyderabad beat Rajasthan Royals by 5 wickets in IPL 2026",
        "source": "India Today",
        "content": "Sunrisers Hyderabad defeated Rajasthan Royals by 5 wickets in the IPL 2026 match on April 25. SRH chased down the target set by RR with consistent batting performances across the lineup. The win boosted SRH position in the race for the playoffs.",
        "url": "https://indiatoday.in"
    },
    {
        "type": "real",
        "title": "IPL 2026 season runs from March 28 to May 31 with 70 league matches",
        "source": "BCCI Official",
        "content": "The 19th edition of the Indian Premier League runs from March 28 2026 to May 31 2026. The tournament features 10 teams playing 70 league matches followed by the playoffs. The season has seen intense competition with multiple teams fighting for the top four spots.",
        "url": "https://iplt20.com"
    },
    {
        "type": "real",
        "title": "Dust storm halts DC vs RCB match at Arun Jaitley Stadium",
        "source": "Outlook India",
        "content": "The IPL 2026 match between Delhi Capitals and Royal Challengers Bengaluru at the Arun Jaitley Stadium in New Delhi experienced a temporary halt during the 10th over due to a heavy dust storm that swept across the ground. Play was resumed after conditions improved.",
        "url": "https://outlookindia.com"
    },

    # === CRICKET INTERNATIONAL - REAL NEWS ===
    {
        "type": "real",
        "title": "Bangladesh clinch series comeback victory against New Zealand",
        "source": "NZ Herald",
        "content": "Bangladesh clinched a series comeback victory against New Zealand in their recent cricket series. The Black Caps touring Bangladesh saw competitive matches throughout the series. Bangladesh showed resilience and determination to overcome the initial setback and win the series.",
        "url": "https://nzherald.co.nz"
    },
    {
        "type": "real",
        "title": "Nepal secure 37-run win against UAE in Tri-Nation Series",
        "source": "Cricket World",
        "content": "Nepal secured a convincing 37-run victory against the United Arab Emirates on April 25 in the 2026 Nepal Tri-Nation Series. The host nation put on a strong display of cricket to dominate the UAE side. The ICC Cricket World Cup League 2 has featured competitive matches between associate nations.",
        "url": "https://cricketworld.com"
    },

    # === POLITICS - REAL NEWS ===
    {
        "type": "real",
        "title": "State Assembly elections held in Assam, Kerala, and Puducherry on April 9",
        "source": "The Hindu",
        "content": "Elections were held for several state legislative assemblies on April 9 2026 including in Assam, Kerala, and Puducherry. The polls were marked by intense political competition between major parties including BJP, Congress, and regional parties. Voter turnout was significant across all states.",
        "url": "https://thehindu.com"
    },
    {
        "type": "real",
        "title": "Tamil Nadu assembly elections held on April 23, 2026",
        "source": "The Hindu",
        "content": "Tamil Nadu held its state assembly elections on April 23 2026. The elections saw significant voter participation with DMK, AIADMK, and other parties contesting across constituencies. The Election Commission deployed extensive security measures for peaceful polling.",
        "url": "https://thehindu.com"
    },
    {
        "type": "real",
        "title": "AAP files petition seeking disqualification of 7 MPs who joined BJP",
        "source": "The Hindu",
        "content": "The Aam Aadmi Party filed a petition with the Rajya Sabha Chairman seeking the disqualification of seven AAP MPs who moved to the Bharatiya Janata Party. AAP alleged that the move violates anti-defection laws under the Tenth Schedule of the Constitution. The political development highlighted ongoing tensions between the two parties.",
        "url": "https://thehindu.com"
    },
    {
        "type": "real",
        "title": "Rajya Sabha elections for 37 seats held on March 16, 2026",
        "source": "Election Commission of India",
        "content": "Rajya Sabha elections for 37 seats took place on March 16 2026. The biennial elections saw candidates from various political parties including BJP, Congress, AAP and regional parties contest for the upper house seats. The results reflect the current political strength of parties across different states.",
        "url": "https://eci.gov.in"
    },
    {
        "type": "real",
        "title": "PM Modi visits Sikkim for 50th year statehood celebrations",
        "source": "PMIndia.gov.in",
        "content": "Prime Minister Narendra Modi visited Sikkim in late April 2026 for the state 50th year of statehood celebrations. The PM inaugurated various development projects during the visit including infrastructure and connectivity initiatives. The visit marks the golden jubilee of Sikkim becoming a state of India.",
        "url": "https://pmindia.gov.in"
    },
    {
        "type": "real",
        "title": "Violence reported during West Bengal assembly polls on April 23",
        "source": "Al Jazeera",
        "content": "Violence was reported during the West Bengal assembly polls on April 23 2026 with clashes between rival party workers. The Election Commission took note of the incidents and ordered additional security deployment. Political leaders condemned the violence and called for peaceful elections.",
        "url": "https://aljazeera.com"
    },

    # === IPL FAKE NEWS (DEBUNKED) ===
    {
        "type": "fake",
        "title": "CSK files official complaint against SRH over black magic ritual",
        "source": "Viral Social Media",
        "content": "BREAKING: Chennai Super Kings have officially filed a complaint with BCCI alleging black magic was performed by SRH fans during their IPL match. A fake document circulated online claiming CSK complained about a fan performing rituals with a lemon. This letter was confirmed to be a complete fabrication created for trolling and social media engagement.",
        "url": ""
    },
    {
        "type": "fake",
        "title": "Umpire deliberately gave six runs as four to fix IPL match",
        "source": "Viral WhatsApp",
        "content": "SHOCKING: Umpire deliberately cheated and gave six runs as four to fix IPL 2026 match between LSG and KKR! Rishabh Pant was robbed! Match fixing exposed! Fact checkers clarified that the umpire decision was correct as replays showed the ball bounced just before the boundary line. The broadcaster graphics indicating a six was erroneous not the umpire call.",
        "url": ""
    },
    {
        "type": "fake",
        "title": "CSK files complaint against Shubman Gill over social media post",
        "source": "Random Blog",
        "content": "EXPOSED! CSK has filed an official complaint against Gujarat Titans skipper Shubman Gill over a social media post! Sources claim major controversy brewing! This was confirmed to be completely false. While CSK did lodge a complaint about a stadium DJ remarks no action was taken against Gill.",
        "url": ""
    },
    {
        "type": "fake",
        "title": "Virat Kohli demands chartered flights to London during IPL",
        "source": "Fake Instagram Account",
        "content": "BREAKING: Virat Kohli DEMANDS RCB management arrange chartered flights to London during IPL season! Diva behavior EXPOSED! Share before deleted! This claim was debunked by Kohli himself who reacted to the viral Instagram story with laughing emojis signaling it was completely baseless and fabricated.",
        "url": ""
    },
    {
        "type": "fake",
        "title": "IPL 2026 match fixed between two teams evidence leaked",
        "source": "Unknown Blog",
        "content": "SHOCKING REVELATION! IPL 2026 match between was FIXED! Secret evidence leaked showing players were paid to lose! Cricket is RIGGED! Share this before BCCI censors it! They do not want you to know the TRUTH about corruption in cricket! WAKE UP!",
        "url": ""
    },
    {
        "type": "fake",
        "title": "BCCI bans multiple players for corruption in IPL 2026",
        "source": "Fake News Site",
        "content": "BREAKING NEWS! BCCI has BANNED 5 top players from IPL 2026 for match fixing and corruption! The entire tournament is RIGGED! Sources claim billions of dollars changed hands! This is the biggest scandal in cricket history that mainstream media is HIDING from you!!!",
        "url": ""
    },
    {
        "type": "fake",
        "title": "Election Commission caught manipulating EVM machines in state elections",
        "source": "Unknown WhatsApp Forward",
        "content": "SHOCKING: Election Commission officials caught RED HANDED manipulating EVM voting machines during state assembly elections! Democracy is DEAD in India! Secret video EXPOSES everything! Share before government DELETES this! They are STEALING your votes!!!",
        "url": ""
    },
    {
        "type": "fake",
        "title": "Opposition leader arrested for sedition over election speech",
        "source": "Fake News Portal",
        "content": "BREAKING: Top opposition leader ARRESTED under sedition charges for criticizing government during election rally! Democracy CRUSHED! Media SILENT! This is DICTATORSHIP! Share before they censor this completely! The government does not want you to know!!!",
        "url": ""
    },
]

# Add entries with proper IDs and timestamps
base_ts = int(time.time() * 1000)
for i, entry in enumerate(new_entries):
    entry["id"] = base_ts + i
    entry["timestamp"] = datetime.now().isoformat()
    database.append(entry)

# Save
with open(DB_FILE, 'w', encoding='utf-8') as f:
    json.dump(database, f, indent=2)

print(f"\n✅ Added {len(new_entries)} new entries to database!")
print(f"   Database: {existing_count} → {len(database)} total entries")
print(f"   Real: {sum(1 for e in database if e.get('type')=='real')}")
print(f"   Fake: {sum(1 for e in database if e.get('type')=='fake')}")
print("\n🔄 Restart your server for changes to take effect.")
