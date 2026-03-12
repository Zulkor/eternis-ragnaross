// js/admin.js - Admin Panel Logic (REAL-TIME SYNC FIXED)

// ⚠️ Admin password
const ADMIN_PASSWORD = "Manson1994!";

// Raid data
let raidData = {
  "The War Within": {
    "Manaforge Omega": { kills: 2, total: 8, bosses: ["Plexus Sentinel","Loom'ithar","Soulbinder Naazindhri","Forgeweaver Araz","The Soul Hunters","Fractillus","Nexus-King Salhadaar","Dimensius"] },
    "Nerub-ar Palace": { kills: 0, total: 8, bosses: ["Ulgrax the Devourer","The Bloodbound Horror","Sikran","Rasha'nan","Broodtwister Ovi'nax","Nexus-Princess Ky'veza","Silken Court","Queen Ansurek"] },
    "Liberation of Undermine": { kills: 0, total: 8, bosses: ["Vexie","Cauldron of Carnage","Rik Reverb","Stix Bunkjunker","Sprocketmonger Lockenstock","One-Armed Bandit","Mug'Zee, Heads of Security","Chrome King Gallywix"] },
  },
  Midnight: {
    "The Dreamrift": { kills: 0, total: 1, bosses: ["Chimaerus the Undreamt God"] },
    "March on Quel'Danas": { kills: 0, total: 2, bosses: ["Belo'ren, Child of Al'ar", "Midnight Falls"] },
    "The Voidspire": { kills: 0, total: 6, bosses: ["Imperator Averzian","Vorasius","Fallen-King Salhadaar","Vaelgor & Ezzorak","Lightblinded Vanguard","Crown of the Cosmos"] },
  },
};

// Roster data
let rosterData = [];

const classColorMap = {
  Warrior: "class-warrior", Paladin: "class-paladin", Hunter: "class-hunter", Rogue: "class-rogue",
  Priest: "class-priest", Shaman: "class-shaman", Mage: "class-mage", Warlock: "class-warlock",
  Monk: "class-monk", Druid: "class-druid", "Demon Hunter": "class-demon-hunter", "Death Knight": "class-death-knight", Evoker: "class-evoker",
};

const roleMap = { Tank: "tank", Healer: "healer", DPS: "dps" };
const roleIcons = { Tank: "css/icons/tank.png", Healer: "css/icons/healer.png", DPS: "css/icons/dps.png" };

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Admin panel with REAL-TIME sync initializing...");
  loadRaidData();
  loadRosterData();
  checkAdminSession();
  console.log("✅ Admin panel ready!");
});

// LOGIN/LOGOUT
function handleLogin(event) {
  event.preventDefault();
  const password = document.getElementById("passwordInput").value;
  const errorMsg = document.getElementById("errorMessage");
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem("adminSession", JSON.stringify({ loggedIn: true, timestamp: Date.now(), expiresIn: 3600000 }));
    console.log("✅ Login successful!");
    showAdminDashboard();
  } else {
    errorMsg.textContent = "❌ Hibás jelszó! Próbáld újra.";
    errorMsg.classList.add("show");
    document.getElementById("passwordInput").value = "";
    setTimeout(() => errorMsg.classList.remove("show"), 3000);
  }
}

function handleLogout() {
  sessionStorage.removeItem("adminSession");
  document.getElementById("loginSection").classList.remove("hidden");
  document.getElementById("adminDashboard").classList.remove("show");
  document.getElementById("passwordInput").value = "";
}

function checkAdminSession() {
  const session = sessionStorage.getItem("adminSession");
  if (session) {
    const data = JSON.parse(session);
    if (Date.now() - data.timestamp < data.expiresIn) {
      showAdminDashboard();
    } else {
      sessionStorage.removeItem("adminSession");
    }
  }
}

function showAdminDashboard() {
  document.getElementById("loginSection").classList.add("hidden");
  document.getElementById("adminDashboard").classList.add("show");
  renderStatsGrid();
  renderRaidsGrid();
  renderRosterTable();
}

// RENDER FUNCTIONS
function renderStatsGrid() {
  const statsGrid = document.getElementById("statsGrid");
  if (!statsGrid) return;
  statsGrid.innerHTML = "";
  Object.entries(raidData).forEach(([expansion, raids]) => {
    Object.entries(raids).forEach(([raidName, raidInfo]) => {
      const percentage = Math.round((raidInfo.kills / raidInfo.total) * 100);
      const stat = document.createElement("div");
      stat.className = "stat-item";
      stat.innerHTML = `<h4>${raidName}</h4><div class="stat-value">${raidInfo.kills}/${raidInfo.total}</div><div style="color: #888; font-size: 12px; margin-top: 8px;">${percentage}%</div>`;
      statsGrid.appendChild(stat);
    });
  });
}

function renderRaidsGrid() {
  const raidsGrid = document.getElementById("raidsGrid");
  if (!raidsGrid) return;
  raidsGrid.innerHTML = "";
  let raidIndex = 0;
  Object.entries(raidData).forEach(([expansion, raids]) => {
    Object.entries(raids).forEach(([raidName, raidInfo]) => {
      const card = document.createElement("div");
      card.className = "raid-card";
      const inputId = `input-${raidIndex}`;
      const msgId = `msg-${raidIndex}`;
      card.innerHTML = `
        <h3>${raidName}</h3>
        <div class="form-group">
          <label>Jelenlegi Kill-ek: ${raidInfo.kills}/${raidInfo.total}</label>
          <input type="number" min="0" max="${raidInfo.total}" value="${raidInfo.kills}" id="${inputId}" class="kill-input" placeholder="0" />
        </div>
        <button class="update-btn" onclick="updateRaidProgressByIndex(${raidIndex})">✅ Frissítés</button>
        <div class="success-message" id="${msgId}"></div>
      `;
      raidsGrid.appendChild(card);
      raidIndex++;
    });
  });
}

function renderRosterTable() {
  const tbody = document.getElementById("rosterTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";
  if (rosterData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #888;">Jelenleg nincs játékos a rosztérben</td></tr>`;
    return;
  }
  rosterData.forEach((player) => {
    const roleClass = roleMap[player.role] || "dps";
    const roleIcon = roleIcons[player.role] || "css/icons/dps.png";
    const classColorClass = classColorMap[player.class] || "";
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><span class="player-name ${classColorClass}">${player.name}</span></td>
      <td>${player.class}</td>
      <td><span class="role-badge ${roleClass}"><img src="${roleIcon}" alt="${player.role}" class="role-icon">${player.role}</span></td>
      <td><a href="${player.raiderIO}" target="_blank" class="raiderio-link">📊 View</a></td>
      <td><button class="delete-btn" onclick="deletePlayer(${player.id})">🗑️ Törlés</button></td>
    `;
    tbody.appendChild(row);
  });
}

// 🔥 FIXED: REAL-TIME UPDATE FUNCTION
function updateRaidProgressByIndex(index) {
  console.log(`🔄 Updating raid at index ${index}`);
  const input = document.getElementById(`input-${index}`);
  const msgElement = document.getElementById(`msg-${index}`);
  if (!input) return;

  const kills = parseInt(input.value);
  let currentIndex = 0;
  
  Object.entries(raidData).forEach(([expansion, raids]) => {
    Object.entries(raids).forEach(([raidName, raidInfo]) => {
      if (currentIndex === index) {
        if (isNaN(kills) || kills < 0) return alert("❌ Érvénytelen érték!");
        if (kills > raidInfo.total) return alert(`❌ Maximum ${raidInfo.total} kill!`);
        
        raidData[expansion][raidName].kills = kills;
        
        // 🔥 FIXED: REAL-TIME BROADCAST
        saveRaidDataWithBroadcast();
        
        if (msgElement) {
          msgElement.textContent = `✅ ${raidName} frissítve: ${kills}/${raidInfo.total}`;
          msgElement.classList.add("show");
          setTimeout(() => msgElement.classList.remove("show"), 3000);
        }
        renderStatsGrid();
        return;
      }
      currentIndex++;
    });
  });
}

// 🔥 NEW: Broadcast to ALL tabs/windows
function saveRaidDataWithBroadcast() {
  // 1. Save to localStorage
  localStorage.setItem("raidData", JSON.stringify(raidData));
  
  // 2. Broadcast to ALL roster pages
  const channel = new BroadcastChannel('raidDataChannel');
  channel.postMessage({
    type: 'raidDataUpdated',
    data: raidData
  });
  
  // 3. Local event (backup)
  window.dispatchEvent(new Event("raidDataUpdated"));
  
  console.log("🚀 Raid data SAVED + BROADCAST to ALL tabs!");
}

// ROSTER FUNCTIONS
function addPlayer() {
  const name = document.getElementById("playerName").value.trim();
  const playerClass = document.getElementById("playerClass").value;
  const role = document.getElementById("playerRole").value;
  const raiderIO = document.getElementById("playerRaiderIO").value.trim();
  
  if (!name || !playerClass || !role) return alert("❌ Töltsd ki az összes mezőt!");
  if (rosterData.some((p) => p.name.toLowerCase() === name.toLowerCase())) return alert("❌ Ez a játékos már létezik!");
  
  const player = {
    id: Date.now(),
    name, class: playerClass, role,
    raiderIO: raiderIO || `https://raider.io/characters/eu/ragnaros/${name.toLowerCase()}`
  };
  
  rosterData.push(player);
  saveRosterData();
  renderRosterTable();
  document.querySelectorAll('#playerName, #playerClass, #playerRole, #playerRaiderIO').forEach(el => el.value = "");
  alert(`✅ ${name} hozzáadva a rosztérhez!`);
}

function deletePlayer(playerId) {
  const playerIndex = rosterData.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) return alert("❌ Játékos nem található!");
  
  const playerName = rosterData[playerIndex].name;
  if (confirm(`❓ Biztosan törölni szeretnéd: ${playerName}?`)) {
    rosterData.splice(playerIndex, 1);
    saveRosterData();
    renderRosterTable();
    alert(`✅ ${playerName} törölve a rosztérből!`);
    window.dispatchEvent(new CustomEvent("rosterDataUpdated"));
  }
}

function switchTab(event, tabName) {
  document.querySelectorAll(".tab-content").forEach((tab) => tab.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"));
  const tabElement = document.getElementById(`${tabName}-tab`);
  if (tabElement) tabElement.classList.add("active");
  event.target.classList.add("active");
}

// STORAGE
function saveRaidData() { saveRaidDataWithBroadcast(); }

function loadRaidData() {
  const saved = localStorage.getItem("raidData");
  if (saved) {
    try {
      const data = JSON.parse(saved);
      Object.assign(raidData, data);
      console.log("✅ Raid data loaded");
    } catch (error) {
      console.error("❌ Failed to load raid data:", error);
    }
  }
}

function saveRosterData() {
  localStorage.setItem("rosterData", JSON.stringify(rosterData));
  window.dispatchEvent(new CustomEvent("rosterDataUpdated", { detail: { rosterData } }));
}

function loadRosterData() {
  const saved = localStorage.getItem("rosterData");
  if (saved) {
    try {
      rosterData = JSON.parse(saved);
    } catch (error) {
      rosterData = [];
    }
  } else {
    rosterData = [];
  }
}

console.log("✅ Admin panel with REAL-TIME sync loaded!");
