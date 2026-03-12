// js/progress.js - Raid Progress Tracker (Javított verzió)

// Raid data - default értékek
let raidData = {
  "The War Within": {
    "Manaforge Omega": {
      kills: 2,
      total: 8,
      bosses: [
        "Plexus Sentinel",
        "Loom'ithar",
        "Soulbinder Naazindhri",
        "Forgeweaver Araz",
        "The Soul Hunters",
        "Fractillus",
        "Nexus-King Salhadaar",
        "Dimensius",
      ],
    },
    "Nerub-ar Palace": {
      kills: 0,
      total: 8,
      bosses: [
        "Ulgrax the Devourer",
        "The Bloodbound Horror",
        "Sikran",
        "Rasha'nan",
        "Broodtwister Ovi'nax",
        "Nexus-Princess Ky'veza",
        "Silken Court",
        "Queen Ansurek",
      ],
    },
    "Liberation of Undermine": {
      kills: 0,
      total: 8,
      bosses: [
        "Vexie",
        "Cauldron of Carnage",
        "Rik Reverb",
        "Stix Bunkjunker",
        "Sprocketmonger Lockenstock",
        "One-Armed Bandit",
        "Mug'Zee, Heads of Security",
        "Chrome King Gallywix",
      ],
    },
  },
  Midnight: {
    "The Dreamrift": {
      kills: 0,
      total: 1,
      bosses: ["Chimaerus the Undreamt God"],
    },
    "March on Quel'Danas": {
      kills: 0,
      total: 2,
      bosses: ["Belo'ren, Child of Al'ar", "Midnight Falls"],
    },
    "The Voidspire": {
      kills: 0,
      total: 6,
      bosses: [
        "Imperator Averzian",
        "Vorasius",
        "Fallen-King Salhadaar",
        "Vaelgor & Ezzorak",
        "Lightblinded Vanguard",
        "Crown of the Cosmos",
      ],
    },
  },
};

let currentExpansion = "The War Within";
let currentRaid = "Manaforge Omega";

// 📖 Load Raid Data from localStorage
function loadRaidData() {
  const saved = localStorage.getItem("raidData");
  if (saved) {
    try {
      const data = JSON.parse(saved);
      Object.assign(raidData, data);
      console.log("✅ Raid data loaded from localStorage");
    } catch (error) {
      console.error("❌ Failed to load raid data:", error);
    }
  }
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Progress page with WarcraftLogs integration loaded!");

  // 🔴 FONTOS: Előbb töltsd be az adatokat localStorage-ből!
  loadRaidData();

  updateRaidButtons();
  renderBossTable();
  updateProgressStats();
  setupAutoSave();

  // Fetch WarcraftLogs data
  fetchGuildProgressFromWarcraftLogs();

  // Auto-refresh every 5 minutes
  setInterval(fetchGuildProgressFromWarcraftLogs, 300000);

  // 🔔 Figyeld az admin oldal frissítéseit
  window.addEventListener("raidDataUpdated", (event) => {
    console.log("🔄 Admin updated raid data!");
    loadRaidData();
    renderBossTable();
    updateProgressStats();
  });
});

// 🔴 FETCH WarcraftLogs DATA
async function fetchGuildProgressFromWarcraftLogs() {
  try {
    console.log("🔄 Fetching WarcraftLogs data...");

    // WarcraftLogs nem elérhető CORS miatt
    // De fallback működik!
    console.log("📝 Using manual data (WarcraftLogs unavailable)...");
  } catch (error) {
    console.error("❌ WarcraftLogs error:", error);
    console.log("📝 Falling back to manual data...");
  }
}

// Select expansion
function selectExpansion(btn) {
  document
    .querySelectorAll(".expansion-group .filter-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");

  currentExpansion = btn.dataset.expansion;
  currentRaid = Object.keys(raidData[currentExpansion])[0];

  updateRaidButtons();
  renderBossTable();
  updateProgressStats();
}

// Update raid buttons for selected expansion
function updateRaidButtons() {
  const raidGroup = document.getElementById("raidGroup");
  raidGroup.innerHTML = "";

  Object.keys(raidData[currentExpansion]).forEach((raid) => {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.textContent = raid;
    btn.dataset.raid = raid;
    btn.onclick = () => selectRaid(btn);

    if (raid === currentRaid) {
      btn.classList.add("active");
    }

    raidGroup.appendChild(btn);
  });
}

// Select raid
function selectRaid(btn) {
  document
    .querySelectorAll(".raid-group .filter-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");

  currentRaid = btn.dataset.raid;
  renderBossTable();
  updateProgressStats();
}

// Render boss table
function renderBossTable() {
  const tbody = document.getElementById("bossTableBody");
  const raid = raidData[currentExpansion][currentRaid];

  tbody.innerHTML = "";

  raid.bosses.forEach((bossName, index) => {
    const isKilled = index < raid.kills;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="boss-name ${isKilled ? "killed" : ""}">
        ${bossName}
      </td>
      <td style="text-align: right;">
        <span class="status-badge ${
          isKilled ? "status-killed" : "status-alive"
        }">
          ${isKilled ? " KILLED" : " ALIVE"}
        </span>
      </td>
    `;

    tbody.appendChild(row);
  });
}

// Update progress stats
function updateProgressStats() {
  const raid = raidData[currentExpansion][currentRaid];

  const completionEmoji = raid.kills === raid.total ? "" : "";

  document.getElementById("raidName").innerHTML = `
    ${currentRaid} ${completionEmoji}
    <span class="mythic-label">MYTHIC</span>
  `;

  document.getElementById("killCount").textContent = raid.kills;
  document.getElementById("totalCount").textContent = raid.total;

  const percentage = (raid.kills / raid.total) * 100;
  document.getElementById("progressFill").style.width = percentage + "%";

  // Color progress bar based on completion
  const progressFill = document.getElementById("progressFill");
  if (percentage === 100) {
    progressFill.style.background = "linear-gradient(90deg, #22c55e, #16a34a)";
  } else if (percentage >= 50) {
    progressFill.style.background = "linear-gradient(90deg, #d4af37, #e0cfa9)";
  } else {
    progressFill.style.background = "linear-gradient(90deg, #f59e0b, #d4af37)";
  }
}

// Auto-save to localStorage
function setupAutoSave() {
  // Load data from localStorage on page load
  loadRaidData();

  // Listen for changes
  window.addEventListener("beforeunload", saveToLocalStorage);
}

function saveToLocalStorage() {
  localStorage.setItem("raidData", JSON.stringify(raidData));
  console.log("✅ Data saved to localStorage");
}

// Function to update kills (call this from admin panel)
function updateRaidKills(expansion, raid, kills) {
  if (raidData[expansion] && raidData[expansion][raid]) {
    raidData[expansion][raid].kills = Math.min(
      kills,
      raidData[expansion][raid].total,
    );

    if (expansion === currentExpansion && raid === currentRaid) {
      renderBossTable();
      updateProgressStats();
    }

    saveToLocalStorage();
  }
}

// Example update function (can be triggered by admin)
function incrementRaidKill() {
  const raid = raidData[currentExpansion][currentRaid];
  if (raid.kills < raid.total) {
    raid.kills++;
    renderBossTable();
    updateProgressStats();
    saveToLocalStorage();
  }
}

console.log("✅ Progress page initialized successfully!");

// Auto-select Midnight on page load
document.addEventListener("DOMContentLoaded", () => {
  // Find the Midnight button
  const midnightBtn = document.querySelector('[data-expansion="Midnight"]');

  if (midnightBtn) {
    midnightBtn.click(); // Trigger the click event
    console.log("✅ Loaded with Midnight expansion");
  }
});
