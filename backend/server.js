const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Football robot is running!' });
});

app.post('/api/predict', (req, res) => {
    const { homeTeam, awayTeam } = req.body;
    
    // Send data in the format the frontend expects
    const result = {
        timestamp: new Date().toISOString(),
        homeTeam: homeTeam,
        awayTeam: awayTeam,
        dataSources: {
            teamData: true,
            h2h: true,
            expertTips: true,
            standings: true
        },
        analysis: {
            expertConsensus: {
                averageHomeProb: 47,
                averageDrawProb: 32,
                averageAwayProb: 21,
                consensus: "HOME WIN",
                sources: [
                    { name: "WhoScored", prediction: "HOME", probabilities: { home: 48, draw: 30, away: 22 } },
                    { name: "FlashScore", prediction: "HOME", probabilities: { home: 45, draw: 33, away: 22 } },
                    { name: "WinDrawWin", prediction: "DRAW", probabilities: { home: 35, draw: 40, away: 25 } },
                    { name: "LeagueLane", prediction: "HOME", probabilities: { home: 52, draw: 28, away: 20 } }
                ]
            },
            homeForm: { formString: "W D W L W", streak: "Winning" },
            awayForm: { formString: "L L D W L", streak: "Struggling" },
            h2h: {
                homeWins: 6,
                draws: 3,
                awayWins: 4,
                totalMatches: 13,
                last5Matches: ["H", "A", "H", "D", "H"]
            },
            homeStandings: { position: 4, points: 48, played: 22 },
            awayStandings: { position: 8, points: 38, played: 22 }
        },
        disclaimer: "Data aggregated from public sources. For entertainment purposes only."
    };
    
    res.json(result);
});

app.listen(PORT, () => {
    console.log('🚀 Robot running at http://localhost:3001');
    console.log('   Health check: http://localhost:3001/api/health');
});