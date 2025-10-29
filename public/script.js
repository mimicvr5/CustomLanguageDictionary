const wordList = document.getElementById("wordList");
const addBtn = document.getElementById("addBtn");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");

function fetchWords() {
  fetch("/api/words")
    .then(res => res.json())
    .then(words => displayWords(words));
}

function displayWords(words) {
  // Sort by language
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
        // Escape special regex characters in the word
        const escaped = item.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        // Match even if surrounded by punctuation or at string boundaries
        const regex = new RegExp(`(^|[^\\p{L}\\p{N}])(${escaped})(?=[^\\p{L}\\p{N}]|$)`, "giu");
        exampleText = exampleText.replace(regex, (match, before, word) => `${before}<b>${word}</b>`);
      }

      const translation = item.meaning ? `<p><strong>Translation:</strong> ${item.meaning}</p>` : "";
      const example = exampleText || "(no example provided)";

      card.innerHTML = `
      <h3>${item.word || "(no word)"}</h3>
      ${translation}
      <p><strong>Example:</strong> ${example}</p>
      `;
      wordList.appendChild(card);
    }
  }
}

// Add new word
addBtn.onclick = async () => {
  const data = {
    language: document.getElementById("language").value,
    word: document.getElementById("word").value,
    translation: document.getElementById("translation").value,
    example: document.getElementById("example").value
  };

  await fetch("/api/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  fetchWords();
};

// Export
exportBtn.onclick = () => {
  window.location.href = "/api/export";
};

// Import
importBtn.onclick = () => importFile.click();
importFile.onchange = async (e) => {
  const file = e.target.files[0];
  const text = await file.text();
  const data = JSON.parse(text);
  await fetch("/api/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  fetchWords();
};

fetchWords();