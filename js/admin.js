// js/admin.js - Admin Panel Logic (GLOBAL FIREBASE REAL-TIME SYNC)
// ✅ ETERNIS GUILD - FULLY FUNCTIONAL WORLDWIDE VERSION

// 🔥 YOUR FIREBASE CONFIG (SAME AS PROGRESS)
const firebaseConfig = {
  apiKey: "AIzaSyDxXh_68XFG_n8zUTAg1IPUe0lI4qQalsM",
  authDomain: "eternis-progress.firebaseapp.com",
  projectId: "eternis-progress",
  storageBucket: "eternis-progress.firebasestorage.app",
  messagingSenderId: "820448513456",
  appId: "1:820448513456:web:521976f61a9f6cdc34da75",
  measurementId: "G-X2C5X70TR5",
};

// 🔥 INITIALIZE FIREBASE
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 🔥 ALL DATABASE REFERENCES
const raidRef = db.ref("raidData");
const rosterRef = db.ref("roster");
const statsRef = db.ref("stats");

// ⚠️ Admin password
const ADMIN_PASSWORD = "eternis2026";

// GLOBAL DATA
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

let rosterData = [];
let statsData = { mPlusScore: 0, raidKills: 0, activeMembers: 0 };

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Admin panel with GLOBAL FIREBASE sync initializing...");

  // 🔥 SETUP ALL FIREBASE LISTENERS
  setupFirebaseListeners();

  // Hamburger menu
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("nav-menu");
  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
    });
  }

  // Form listeners
  setupEventListeners();
  console.log("✅ Admin panel ready!");
});

// 🔥 REAL-TIME FIREBASE LISTENERS
function setupFirebaseListeners() {
  // Raid data sync
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

  // Roster sync
  rosterRef.on("value", (snapshot) => {
    rosterData = snapshot.val() || [];
    console.log("📡 FIREBASE ROSTER UPDATE!");
    if (document.getElementById("adminDashboard")?.classList.contains("show")) {
      updateRosterTable();
    }
  });

  // Stats sync
  statsRef.on("value", (snapshot) => {
    statsData = snapshot.val() || {
      mPlusScore: 0,
      raidKills: 0,
      activeMembers: 0,
    };
    console.log("📡 FIREBASE STATS UPDATE!");
    if (document.getElementById("adminDashboard")?.classList.contains("show")) {
      updateStats();
    }
  });
}

// 🔥 EVENT LISTENERS
function setupEventListeners() {
  // Login form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  // Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  // Tab switching
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

  // Add player button
  const addPlayerBtn = document.getElementById("addPlayerBtn");
  if (addPlayerBtn) {
    addPlayerBtn.addEventListener("click", addPlayer);
  }
}

// LOGIN/LOGOUT
function handleLogin(event) {
  event.preventDefault();
  const password = document.getElementById("passwordInput").value;
  const errorMsg = document.getElementById("errorMessage");

  if (password === ADMIN_PASSWORD) {
    document.getElementById("loginSection").classList.add("hidden");
    document.getElementById("adminDashboard").classList.add("show");

    // Load all data
    updateStats();
    updateRosterTable();
    generateRaidCards();
    console.log("✅ Login successful - FULL SYNC!");
  } else {
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

// 🔥 UPDATE FUNCTIONS
function updateStats() {
  const mPlusScoreEl = document.getElementById("mPlusScore");
  const raidKillsEl = document.getElementById("raidKills");
  const activeMembersEl = document.getElementById("activeMembers");

  if (mPlusScoreEl) mPlusScoreEl.textContent = statsData.mPlusScore || 0;
  if (raidKillsEl) raidKillsEl.textContent = statsData.raidKills || 0;
  if (activeMembersEl)
    activeMembersEl.textContent = statsData.activeMembers || 0;
}

function generateRaidCards() {
  const raidsGrid = document.getElementById("raidsGrid");
  if (!raidsGrid) return;

  raidsGrid.innerHTML = "";
  Object.keys(raidData).forEach((expansion) => {
    Object.keys(raidData[expansion]).forEach((raidName) => {
      const raid = raidData[expansion][raidName];
      const card = document.createElement("div");
      card.className = "raid-card";
      card.innerHTML = `
        <h3>${raidName}</h3>
        <div class="form-group">
          <label>Kills / Total</label>
          <select id="raid-${expansion}-${raidName.replace(/[^a-zA-Z0-9]/g, "")}">
            ${Array.from(
              { length: raid.total + 1 },
              (_, i) =>
                `<option value="${i}" ${i === raid.kills ? "selected" : ""}>${i}/${raid.total}</option>`,
            ).join("")}
          </select>
        </div>
        <button class="update-btn" onclick="updateRaidProgress('${expansion}', '${raidName}')">
          💾 Frissítés
        </button>
        <div class="success-message" id="success-${expansion}-${raidName.replace(/[^a-zA-Z0-9]/g, "")}"></div>
      `;
      raidsGrid.appendChild(card);
    });
  });
}

// 🔥 GLOBAL FIREBASE UPDATE (WORLDWIDE SYNC)
window.updateRaidProgress = function (expansion, raidName) {
  const selectId = `raid-${expansion}-${raidName.replace(/[^a-zA-Z0-9]/g, "")}`;
  const select = document.getElementById(selectId);
  const successId = `success-${expansion}-${raidName.replace(/[^a-zA-Z0-9]/g, "")}`;
  const successMsg = document.getElementById(successId);

  if (!select) return;

  const kills = parseInt(select.value);
  raidRef
    .child(`${expansion}/${raidName}/kills`)
    .set(kills)
    .then(() => {
      if (successMsg) {
        successMsg.textContent = `✅ ${raidName} frissítve: ${kills}/${raidData[expansion][raidName].total}`;
        successMsg.classList.add("show");
        setTimeout(() => successMsg.classList.remove("show"), 3000);
      }
      console.log(
        `🚀 Raid updated WORLDWIDE: ${expansion}/${raidName} = ${kills} kills`,
      );
    })
    .catch((error) => {
      console.error("❌ Firebase update failed:", error);
    });
};

// 🔥 ROSTER FUNCTIONS
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

      // Clear form
      document.getElementById("playerName").value = "";
      document.getElementById("playerClass").value = "";
      document.getElementById("playerRole").value = "";
      document.getElementById("playerRaiderIO").value = "";

      setTimeout(() => {
        document.getElementById("addPlayerSuccess").classList.remove("show");
      }, 3000);
    });
}

function updateRosterTable() {
  const tbody = document.getElementById("rosterTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";
  rosterData.forEach((player, index) => {
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

// 🔥 DELETE PLAYER
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

// 🔥 STATS UPDATE (Manual)
window.updateStats = function (type, value) {
  const updates = {};
  updates[type] = parseInt(value) || 0;
  statsRef.update(updates);
};

console.log("✅ ETERNIS ADMIN.JS - FULL WORLDWIDE FIREBASE SYNC! 🚀");
