// backend/server.js

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config(); // load .env variables

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Simple in-memory storage
const balances = {};
const referrals = {};

// Example: Get balance for a referral
app.get("/balance", (req, res) => {
  const ref = req.query.ref;
  if (!ref) return res.status(400).json({ error: "Missing ref" });
  const balance = balances[ref] || 0;
  res.json({ balance });
});

// Example: Log referral
app.post("/log-referral", (req, res) => {
  const { ref, amount } = req.body;
  if (!ref || !amount) return res.status(400).json({ error: "Missing ref or amount" });

  referrals[ref] = referrals[ref] || 0;
  referrals[ref] += amount;

  balances[ref] = balances[ref] || 0;
  balances[ref] += amount;

  res.json({ success: true, total: balances[ref] });
});

// Example: Logging from frontend
app.post("/log", (req, res) => {
  const { entry } = req.body;
  console.log("[Frontend Log]", entry);
  res.json({ success: true });
});

// Example: Send BTC using BlockCypher API
app.post("/withdraw", async (req, res) => {
  const { address, amount } = req.body;
  if (!address || !amount) return res.status(400).json({ error: "Missing address or amount" });

  try {
    const token = process.env.BLOCKCYPHER_TOKEN;
    // Example request to BlockCypher (testnet/mainnet depends on your key)
    const response = await axios.post(
      `https://api.blockcypher.com/v1/btc/main/txs/new?token=${token}`,
      {
        // Construct transaction payload here
      }
    );
    res.json({ success: true, tx: response.data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "BTC withdrawal failed", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
