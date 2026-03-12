// js/progress.js - Raid Progress Tracker (FIXED - Real-time sync)

// Raid data - default values
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

// BroadcastChannel for REAL-TIME sync
let raidChannel;

// 🔄 FIXED: Proper deep-merge load
function loadRaidData() {
  const saved = localStorage.getItem("raidData");
  if (saved) {
    try {
      const data = JSON.parse(saved);
      // Deep merge to preserve structure
      Object.keys(data).forEach(expansion => {
        if (!raidData[expansion]) raidData[expansion] = {};
        Object.keys(data[expansion]).forEach(raid => {
          if (!raidData[expansion][raid]) {
            raidData[expansion][raid] = { kills: 0, total: 0, bosses: [] };
          }
          Object.assign(raidData[expansion][raid], data[expansion][raid]);
        });
      });
      console.log("✅ Raid data LOADED from localStorage");
    } catch (error) {
      console.error("❌ Failed to load raid data:", error);
    }
  }
}

// 💾 Save to localStorage
function saveToLocalStorage() {
  localStorage.setItem("raidData", JSON.stringify(raidData));
  console.log("✅ Data SAVED to localStorage");
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Progress page with REAL-TIME sync loaded!");

  // Load data FIRST
  loadRaidData();

  // Setup BroadcastChannel for REAL-TIME updates
  raidChannel = new BroadcastChannel('raidDataChannel');
  raidChannel.addEventListener('message', (event) => {
    if (event.data.type === 'raidDataUpdated') {
      console.log("📡 LIVE UPDATE from admin received!");
      loadRaidData();
      renderBossTable();
      updateProgressStats();
    }
  });

  updateRaidButtons();
  renderBossTable();
  updateProgressStats();
  setupAutoSave();

  // Auto-refresh every 30 seconds (backup)
  setInterval(() => {
    loadRaidData();
    renderBossTable();
    updateProgressStats();
  }, 30000);

  // Auto-select Midnight
  setTimeout(() => {
    const midnightBtn = document.querySelector('[data-expansion="Midnight"]');
    if (midnightBtn) {
      midnightBtn.click();
      console.log("✅ Loaded with Midnight expansion");
    }
  }, 100);
});

// Local event listener (backup)
window.addEventListener("raidDataUpdated", (event) => {
  console.log("🔄 Local raidDataUpdated event!");
  loadRaidData();
  renderBossTable();
  updateProgressStats();
});

// Select expansion
function selectExpansion(btn) {
  document.querySelectorAll(".expansion-group .filter-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  currentExpansion = btn.dataset.expansion;
  currentRaid = Object.keys(raidData[currentExpansion])[0];
  updateRaidButtons();
  renderBossTable();
  updateProgressStats();
}

// Update raid buttons
function updateRaidButtons() {
  const raidGroup = document.getElementById("raidGroup");
  if (!raidGroup) return;
  raidGroup.innerHTML = "";
  Object.keys(raidData[currentExpansion]).forEach((raid) => {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.textContent = raid;
    btn.dataset.raid = raid;
    btn.onclick = () => selectRaid(btn);
    if (raid === currentRaid) btn.classList.add("active");
    raidGroup.appendChild(btn);
  });
}

// Select raid
function selectRaid(btn) {
  document.querySelectorAll(".raid-group .filter-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  currentRaid = btn.dataset.raid;
  renderBossTable();
  updateProgressStats();
}

// Render boss table
function renderBossTable() {
  const tbody = document.getElementById("bossTableBody");
  if (!tbody || !raidData[currentExpansion]?.[currentRaid]) return;
  const raid = raidData[currentExpansion][currentRaid];
  tbody.innerHTML = "";
  raid.bosses.forEach((bossName, index) => {
    const isKilled = index < raid.kills;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="boss-name ${isKilled ? "killed" : ""}">${bossName}</td>
      <td style="text-align: right;">
        <span class="status-badge ${isKilled ? "status-killed" : "status-alive"}">
          ${isKilled ? " KILLED" : " ALIVE"}
        </span>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Update progress stats
function updateProgressStats() {
  const raidNameEl = document.getElementById("raidName");
  const killCountEl = document.getElementById("killCount");
  const totalCountEl = document.getElementById("totalCount");
  const progressFill = document.getElementById("progressFill");
  
  if (!raidNameEl || !killCountEl || !totalCountEl || !progressFill) return;
  
  const raid = raidData[currentExpansion][currentRaid];
  raidNameEl.innerHTML = `${currentRaid} <span class="mythic-label">MYTHIC</span>`;
  killCountEl.textContent = raid.kills;
  totalCountEl.textContent = raid.total;
  
  const percentage = (raid.kills / raid.total) * 100;
  progressFill.style.width = percentage + "%";
  
  if (percentage === 100) {
    progressFill.style.background = "linear-gradient(90deg, #22c55e, #16a34a)";
  } else if (percentage >= 50) {
    progressFill.style.background = "linear-gradient(90deg, #d4af37, #e0cfa9)";
  } else {
    progressFill.style.background = "linear-gradient(90deg, #f59e0b, #d4af37)";
  }
}

// Auto-save setup
function setupAutoSave() {
  loadRaidData();
  window.addEventListener("beforeunload", saveToLocalStorage);
}

console.log("✅ Progress page with REAL-TIME sync initialized!");
