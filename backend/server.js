const express = require('express');
const cors = require('cors');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();
const PORT = 3001;

const cache = new NodeCache({ stdTTL: 300 });

app.use(cors());
app.use(express.json());

// Simple rate limiting (stops too many requests)
const rateLimit = new Map();
function checkRateLimit(ip) {
    const now = Date.now();
    const windowMs = 60000;
    const maxRequests = 30;
    
    if (!rateLimit.has(ip)) {
        rateLimit.set(ip, []);
    }
    
    const timestamps = rateLimit.get(ip).filter(t => now - t < windowMs);
    timestamps.push(now);
    rateLimit.set(ip, timestamps);
    
    return timestamps.length <= maxRequests;
}

// Health check endpoint (like asking "are you alive?")
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Football predictions API is running' });
});

// The main prediction endpoint (the magic happens here!)
app.post('/api/predict', async (req, res) => {
    const clientIp = req.ip || req.connection.remoteAddress;
    
    if (!checkRateLimit(clientIp)) {
        return res.status(429).json({ 
            error: 'Too many requests. Please wait a moment.'
        });
    }
    
    const { homeTeam, awayTeam } = req.body;
    
    if (!homeTeam || !awayTeam) {
        return res.status(400).json({ error: 'Both teams are required' });
    }
    
    const cacheKey = `${homeTeam.toLowerCase()}_${awayTeam.toLowerCase()}`;
    const cachedResult = cache.get(cacheKey);
    
    if (cachedResult) {
        return res.json(cachedResult);
    }
    
    try {
        // Simulated data (since we don't have API keys yet)
        const predictionResult = {
            timestamp: new Date().toISOString(),
            homeTeam,
            awayTeam,
            dataSources: {
                teamData: false,
                h2h: false,
                expertTips: true,
                standings: false
            },
            analysis: {
                home: { name: homeTeam, form: "W D L W D" },
                away: { name: awayTeam, form: "L W D L L" },
                h2h: {
                    totalMatches: 12,
                    homeWins: 5,
                    draws: 3,
                    awayWins: 4,
                    last5Matches: ["H", "A", "D", "H", "A"]
                },
                expertConsensus: {
                    sources: [
                        { name: "WhoScored", prediction: "HOME", probabilities: { home: 45, draw: 30, away: 25 } },
                        { name: "FlashScore", prediction: "DRAW", probabilities: { home: 35, draw: 40, away: 25 } },
                        { name: "WinDrawWin", prediction: "HOME", probabilities: { home: 50, draw: 25, away: 25 } }
                    ],
                    averageHomeProb: 43.3,
                    averageDrawProb: 31.7,
                    averageAwayProb: 25.0,
                    consensus: "HOME WIN"
                },
                homeStandings: { position: 5, points: 45 },
                awayStandings: { position: 8, points: 38 },
                homeForm: { formString: "W D L W D", streak: "Mixed" },
                awayForm: { formString: "L W D L L", streak: "2L" }
            },
            disclaimer: "Data aggregated from public sources. For entertainment only."
        };
        
        cache.set(cacheKey, predictionResult);
        res.json(predictionResult);
        
    } catch (error) {
        res.status(500).json({ error: 'Unable to fetch data. Please try again.' });
    }
});

// Team search endpoint
app.get('/api/teams/search', async (req, res) => {
    const { query } = req.query;
    
    const commonTeams = [
        "Arsenal", "Aston Villa", "Chelsea", "Liverpool", "Manchester City", 
        "Manchester United", "Tottenham Hotspur", "Newcastle United", "West Ham United",
        "Real Madrid", "Barcelona", "Atletico Madrid", "Bayern Munich", "Borussia Dortmund",
        "Paris Saint-Germain", "Inter Milan", "AC Milan", "Juventus", "Napoli"
    ];
    
    const filtered = commonTeams.filter(team => 
        team.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);
    
    res.json({ teams: filtered });
});

app.listen(PORT, () => {
    console.log(`🚀 Football robot running at http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
});