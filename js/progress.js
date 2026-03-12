// js/progress.js - Raid Progress Tracker (GLOBAL REAL-TIME SYNC)
// ✅ ETERNIS GUILD - FULLY FUNCTIONAL FIREBASE VERSION

// 🔥 YOUR FIREBASE CONFIG (looks perfect!)
const firebaseConfig = {
  apiKey: "AIzaSyDxXh_68XFG_n8zUTAg1IPUe0lI4qQalsM",
  authDomain: "eternis-progress.firebaseapp.com",
  projectId: "eternis-progress",
  storageBucket: "eternis-progress.firebasestorage.app",
  messagingSenderId: "820448513456",
  appId: "1:820448513456:web:521976f61a9f6cdc34da75",
  measurementId: "G-X2C5X70TR5",
};

// 🔥 USE COMPAT VERSION (works in browser)
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const raidRef = db.ref("raidData");

// Rest of your raidData structure (KEEP EXACTLY AS IS)
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

// 🔥 GLOBAL REAL-TIME LISTENER
raidRef.on("value", (snapshot) => {
  const data = snapshot.val();
  console.log("📡 FIREBASE LIVE UPDATE received!", data);

  if (data) {
    Object.keys(data).forEach((expansion) => {
      if (!raidData[expansion]) raidData[expansion] = {};
      Object.keys(data[expansion]).forEach((raid) => {
        if (!raidData[expansion][raid]) {
          raidData[expansion][raid] = { kills: 0, total: 0, bosses: [] };
        }
        Object.assign(raidData[expansion][raid], data[expansion][raid]);
      });
    });
    renderBossTable();
    updateProgressStats();
    updateRaidButtons();
  }
});

// Load localStorage fallback
function loadLocalFallback() {
  const saved = localStorage.getItem("raidData");
  if (saved) {
    try {
      const data = JSON.parse(saved);
      Object.assign(raidData, data);
      console.log("✅ LocalStorage loaded");
    } catch (error) {
      console.error("❌ LocalStorage error:", error);
    }
  }
}

// ALL YOUR OTHER FUNCTIONS (KEEP EXACTLY AS IS)
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Eternis Progress - GLOBAL FIREBASE SYNC!");
  loadLocalFallback();
  updateRaidButtons();
  renderBossTable();
  updateProgressStats();
});

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

function updateRaidButtons() {
  const raidGroup = document.getElementById("raidGroup");
  if (!raidGroup) return;
  raidGroup.innerHTML = "";
  Object.keys(raidData[currentExpansion] || {}).forEach((raid) => {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.textContent = raid;
    btn.dataset.raid = raid;
    btn.onclick = () => selectRaid(btn);
    if (raid === currentRaid) btn.classList.add("active");
    raidGroup.appendChild(btn);
  });
}

function selectRaid(btn) {
  document
    .querySelectorAll(".raid-group .filter-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  currentRaid = btn.dataset.raid;
  renderBossTable();
  updateProgressStats();
}

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

function updateProgressStats() {
  const raidNameEl = document.getElementById("raidName");
  const killCountEl = document.getElementById("killCount");
  const totalCountEl = document.getElementById("totalCount");
  const progressFill = document.getElementById("progressFill");

  if (!raidNameEl || !killCountEl || !totalCountEl || !progressFill) return;

  const raid = raidData[currentExpansion]?.[currentRaid];
  if (!raid) return;

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

console.log("✅ Eternis Progress - READY FOR WORLDWIDE SYNC!");
