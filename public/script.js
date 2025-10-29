const wordList = document.getElementById("wordList");
const addBtn = document.getElementById("addBtn");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");

// Load words from localStorage
function loadWords() {
  const stored = localStorage.getItem("dictionary");
  return stored ? JSON.parse(stored) : [];
}

// Save words to localStorage
function saveWords(words) {
  localStorage.setItem("dictionary", JSON.stringify(words));
}

// Display words
function displayWords(words) {
  // Group by language
  const grouped = {};
  for (const w of words) {
    if (!grouped[w.language]) grouped[w.language] = [];
    grouped[w.language].push(w);
  }

  wordList.innerHTML = "";
  for (const [lang, items] of Object.entries(grouped)) {
    const langHeader = document.createElement("h2");
    langHeader.textContent = lang;
    wordList.appendChild(langHeader);

    for (const item of items) {
      const card = document.createElement("div");
      card.className = "card";

      // Bold the word in example
      let exampleText = item.example || "";
      if (item.word) {
        const escaped = item.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`(^|[^\\p{L}\\p{N}])(${escaped})(?=[^\\p{L}\\p{N}]|$)`, "giu");
        exampleText = exampleText.replace(regex, (match, before, word) => `${before}<b>${word}</b>`);
      }

      const translation = item.translation || "(no translation provided)";
      const example = exampleText || "(no example provided)";

      card.innerHTML = `
        <h3>${item.word || "(no word)"}</h3>
        <p><strong>Translation:</strong> ${translation}</p>
        <p><strong>Example:</strong> ${example}</p>
      `;

      wordList.appendChild(card);
    }
  }
}

// Add new word
addBtn.onclick = () => {
  const words = loadWords();
  const data = {
    language: document.getElementById("language").value.trim(),
    word: document.getElementById("word").value.trim(),
    translation: document.getElementById("translation").value.trim(),
    example: document.getElementById("example").value.trim()
  };

  if (!data.language || !data.word) {
    alert("Please provide at least a language and a word.");
    return;
  }

  words.push(data);
  saveWords(words);
  displayWords(words);

  // Clear inputs
  document.getElementById("language").value = "";
  document.getElementById("word").value = "";
  document.getElementById("translation").value = "";
  document.getElementById("example").value = "";
};

// Export dictionary as JSON file
exportBtn.onclick = () => {
  const words = loadWords();
  const blob = new Blob([JSON.stringify(words, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "dictionary.json";
  a.click();
  URL.revokeObjectURL(url);
};

// Import dictionary from JSON file
importBtn.onclick = () => importFile.click();
importFile.onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  try {
    const data = JSON.parse(text);
    if (!Array.isArray(data)) throw new Error("Invalid JSON format");
    saveWords(data);
    displayWords(data);
  } catch (err) {
    alert("Failed to import: " + err.message);
  }
};

// Initial display
displayWords(loadWords());
