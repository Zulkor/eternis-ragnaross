// js/admin.js - Admin Panel Logic (GLOBAL FIREBASE REAL-TIME SYNC)
// ✅ ETERNIS GUILD - FULLY FUNCTIONAL WORLDWIDE VERSION

const firebaseConfig = {
  apiKey: "AIzaSyDxXh_68XFG_n8zUTAg1IPUe0lI4qQalsM",
  authDomain: "eternis-progress.firebaseapp.com",
  projectId: "eternis-progress",
  storageBucket: "eternis-progress.firebasestorage.app",
  messagingSenderId: "820448513456",
  appId: "1:820448513456:web:521976f61a9f6cdc34da75",
  measurementId: "G-X2C5X70TR5",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const raidRef = db.ref("raidData");
const rosterRef = db.ref("roster");
const statsRef = db.ref("stats");

const ADMIN_PASSWORD = "EternisAdminsRoom123!";

let raidData = {
  "The War Within": {
    "Manaforge Omega": {
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
      deadBosses: [true, true, false, false, false, false, false, false], // individual tracking
    },
  },
  // Add other raids same format...
};

let rosterData = [];
let statsData = { mPlusScore: 0, raidKills: 0, activeMembers: 0 };

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Admin panel with GLOBAL FIREBASE sync initializing...");
  setupFirebaseListeners();
  setupEventListeners();
  console.log("✅ Admin panel ready!");
});

function setupFirebaseListeners() {
  raidRef.on("value", (snapshot) => {
    const data = snapshot.val();
    if (data) {
      Object.assign(raidData, data);
      console.log("📡 FIREBASE RAID UPDATE - Admin refreshed!");
      if (
        document.getElementById("adminDashboard")?.classList.contains("show")
      ) {
        generateRaidCards();
        updateStats();
      }
    }
  });

  rosterRef.on("value", (snapshot) => {
    rosterData = snapshot.val() || [];
    if (document.getElementById("adminDashboard")?.classList.contains("show")) {
      updateRosterTable();
    }
  });

  statsRef.on("value", (snapshot) => {
    statsData = snapshot.val() || {
      mPlusScore: 0,
      raidKills: 0,
      activeMembers: 0,
    };
    if (document.getElementById("adminDashboard")?.classList.contains("show")) {
      updateStats();
    }
  });
}

function setupEventListeners() {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) loginForm.addEventListener("submit", handleLogin);

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((c) => c.classList.remove("active"));
      this.classList.add("active");
      document
        .getElementById(this.dataset.tab + "-tab")
        .classList.add("active");
    });
  });
}

function handleLogin(event) {
  event.preventDefault();
  const password = document.getElementById("passwordInput").value;

  if (password === ADMIN_PASSWORD) {
    document.getElementById("loginSection").classList.add("hidden");
    document.getElementById("adminDashboard").classList.add("show");
    updateStats();
    updateRosterTable();
    generateRaidCards();
    console.log("✅ Login successful - FULL SYNC!");
  } else {
    const errorMsg = document.getElementById("errorMessage");
    if (errorMsg) {
      errorMsg.textContent = "❌ Helytelen jelszó!";
      errorMsg.classList.add("show");
      setTimeout(() => errorMsg.classList.remove("show"), 3000);
    }
  }
}

function handleLogout() {
  document.getElementById("loginSection").classList.remove("hidden");
  document.getElementById("adminDashboard").classList.remove("show");
  document.getElementById("passwordInput").value = "";
}

// 🔥 INDIVIDUAL BOSS TRACKING - NEW FEATURE
function generateRaidCards() {
  const raidsGrid = document.getElementById("raidsGrid");
  if (!raidsGrid) return;

  raidsGrid.innerHTML = "";

  Object.keys(raidData).forEach((expansion) => {
    Object.keys(raidData[expansion]).forEach((raidName) => {
      const raid = raidData[expansion][raidName];
      const safeRaidName = raidName.replace(/[^a-zA-Z0-9]/g, "");

      const card = document.createElement("div");
      card.className = "raid-card";
      card.innerHTML = `
        <h3>${raidName}</h3>
        <div class="boss-list">
          ${raid.bosses
            .map(
              (boss, index) => `
            <label class="boss-checkbox">
              <input type="checkbox" 
                     value="${index}" 
                     id="boss-${expansion}-${safeRaidName}-${index}"
                     ${raid.deadBosses[index] ? "checked" : ""}>
              ${boss}
            </label>
          `,
            )
            .join("")}
        </div>
        <div style="margin-top: 15px;">
          <span>Kills: <span id="kills-count-${expansion}-${safeRaidName}">${raid.deadBosses.filter(Boolean).length}/${raid.total}</span></span>
        </div>
        <button class="update-btn" onclick="updateBossProgress('${expansion}', '${safeRaidName}')">
          💾 Frissítés
        </button>
        <div class="success-message" id="success-${expansion}-${safeRaidName}"></div>
      `;
      raidsGrid.appendChild(card);

      // Live kill count update
      updateLiveKillCount(expansion, safeRaidName);
    });
  });
}

// 🔥 LIVE KILL COUNTER
function updateLiveKillCount(expansion, safeRaidName) {
  const checkboxes = document.querySelectorAll(
    `input[id^="boss-${expansion}-${safeRaidName}"]`,
  );
  const deadCount = Array.from(checkboxes).filter((cb) => cb.checked).length;
  const countEl = document.getElementById(
    `kills-count-${expansion}-${safeRaidName}`,
  );
  if (countEl)
    countEl.textContent = `${deadCount}/${raidData[expansion][safeRaidName]?.total || 0}`;
}

// 🔥 SAVE INDIVIDUAL BOSS STATUS TO FIREBASE
window.updateBossProgress = function (expansion, safeRaidName) {
  const checkboxes = document.querySelectorAll(
    `input[id^="boss-${expansion}-${safeRaidName}"]`,
  );
  const deadBosses = Array.from(checkboxes).map((cb) => cb.checked);

  raidRef
    .child(`${expansion}/${raidName}/deadBosses`)
    .set(deadBosses)
    .then(() => {
      const successMsg = document.getElementById(
        `success-${expansion}-${safeRaidName}`,
      );
      if (successMsg) {
        successMsg.textContent = `✅ ${deadBosses.filter(Boolean).length} boss frissítve!`;
        successMsg.classList.add("show");
        setTimeout(() => successMsg.classList.remove("show"), 3000);
      }
      console.log(
        `🚀 Bosses updated: ${deadBosses.filter(Boolean).length}/${deadBosses.length}`,
      );
    })
    .catch((error) => console.error("❌ Firebase update failed:", error));
};

// Add checkbox event listeners for live updates
document.addEventListener("change", function (e) {
  if (e.target.matches('input[type="checkbox"]')) {
    const idParts = e.target.id.split("-");
    if (idParts[1] === "boss") {
      const [, , expansion, safeRaidName] = idParts;
      updateLiveKillCount(expansion, safeRaidName);
    }
  }
});

function updateStats() {
  const mPlusScoreEl = document.getElementById("mPlusScore");
  const raidKillsEl = document.getElementById("raidKills");
  const activeMembersEl = document.getElementById("activeMembers");

  if (mPlusScoreEl) mPlusScoreEl.textContent = statsData.mPlusScore || 0;
  if (raidKillsEl) raidKillsEl.textContent = statsData.raidKills || 0;
  if (activeMembersEl)
    activeMembersEl.textContent = statsData.activeMembers || 0;
}

// Roster functions remain the same...
function addPlayer() {
  const name = document.getElementById("playerName").value.trim();
  const playerClass = document.getElementById("playerClass").value;
  const role = document.getElementById("playerRole").value;
  const raiderio = document.getElementById("playerRaiderIO").value.trim();

  if (!name || !playerClass || !role) {
    alert("❌ Töltsd ki az összes kötelező mezőt!");
    return;
  }

  const newPlayer = {
    name,
    class: playerClass,
    role,
    raiderio: raiderio || "",
  };
  const newKey = rosterRef.push().key;

  rosterRef
    .child(newKey)
    .set(newPlayer)
    .then(() => {
      document.getElementById("addPlayerSuccess").textContent =
        `✅ ${name} sikeresen hozzáadva!`;
      document.getElementById("addPlayerSuccess").classList.add("show");
      document.getElementById("playerName").value = "";
      document.getElementById("playerClass").value = "";
      document.getElementById("playerRole").value = "";
      document.getElementById("playerRaiderIO").value = "";
      setTimeout(
        () =>
          document.getElementById("addPlayerSuccess").classList.remove("show"),
        3000,
      );
    });
}

function updateRosterTable() {
  const tbody = document.getElementById("rosterTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";
  rosterData.forEach((player) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${player.name}</td>
      <td><span class="class-tag">${player.class}</span></td>
      <td><span class="role-${player.role.toLowerCase()} role-badge">${player.role}</span></td>
      <td><a href="${player.raiderio}" target="_blank">🔗</a></td>
      <td><button class="delete-btn" onclick="deletePlayer('${player.key}')">🗑️ Töröl</button></td>
    `;
    tbody.appendChild(row);
  });
}

window.deletePlayer = function (key) {
  if (confirm("Biztosan törölni szeretnéd ezt a játékost?")) {
    rosterRef
      .child(key)
      .remove()
      .then(() => {
        console.log("✅ Player deleted WORLDWIDE!");
      });
  }
};

console.log("✅ ETERNIS ADMIN.JS - INDIVIDUAL BOSS TRACKING! 🚀");
