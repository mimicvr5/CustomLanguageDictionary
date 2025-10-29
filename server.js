import express from "express";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const DATA_FILE = path.join(__dirname, "data.json");

app.use(bodyParser.json());
app.use(express.static("public"));

// Cached data in memory
let cachedData = [];

// Load data from file
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const json = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      cachedData = json;
      console.log("✅ Data reloaded (" + cachedData.length + " entries)");
    }
  } catch (err) {
    console.error("❌ Error reading data.json:", err);
  }
}

// Save data to file
function saveData(data) {
  cachedData = data;
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// Watch data.json for external edits
fs.watchFile(DATA_FILE, (curr, prev) => {
  if (curr.mtime !== prev.mtime) {
    console.log("🔄 Detected change in data.json, reloading...");
    loadData();
  }
});

// Initial load
loadData();

// Get all words
app.get("/api/words", (req, res) => {
  res.json(cachedData);
});

// Add new word
app.post("/api/add", (req, res) => {
  const newWord = req.body;
  cachedData.push(newWord);
  saveData(cachedData);
  res.json({ success: true });
});

// Export data
app.get("/api/export", (req, res) => {
  res.download(DATA_FILE, "dictionary_backup.json");
});

// Import data
app.post("/api/import", (req, res) => {
  const newData = req.body;
  saveData(newData);
  res.json({ success: true });
});

app.listen(3000, () => console.log("🚀 Server running at http://localhost:3000"));