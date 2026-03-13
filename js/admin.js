// 🔹 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDxXh_68XFG_n8zUTAg1IPUe0lI4qQalsM",
  authDomain: "eternis-progress.firebaseapp.com",
  databaseURL:
    "https://eternis-progress-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "eternis-progress",
  storageBucket: "eternis-progress.appspot.com",
  messagingSenderId: "820448513456",
  appId: "1:820448513456:web:521976f61a9f6cdc34da75",
};

// 🔹 FIREBASE INIT
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();

// 🔹 FIREBASE REFS
const raidRef = db.ref("raidData");
const rosterRef = db.ref("rosterData");

// 🔹 ADMIN CONFIG
const ADMIN_PASSWORD = "EternisAdminsRoom123!";

// 🔹 RAID CONFIG
const ALL_RAIDS = {
  Midnight: {
    "The Voidspire": [
      "Imperator Averzian",
      "Vorasius",
      "Fallen-King Salhadaar",
      "Vaelgor & Ezzorak",
      "Lightblinded Vanguard",
      "Crown of the Cosmos",
    ],
    "The Dreamrift": ["Chimaerus the Undreamt God"],
    "March on Quel'Danas": ["Belo'ren, Child of Al'ar", "Midnight Falls"],
  },
  "The War Within": {
    "Manaforge Omega": [
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
};

// 🔹 STATE
let raidData = {};
let rosterData = { players: [] };

// 🔹 FETCH RAID DATA
raidRef.on("value", (snap) => {
  raidData = snap.val() || {};
  if (document.getElementById("adminDashboard").classList.contains("show")) {
    loadRaids();
  }
});

// 🔹 FETCH ROSTER DATA
rosterRef.on("value", (snap) => {
  rosterData = snap.val() || { players: [] };
  if (document.getElementById("adminDashboard").classList.contains("show")) {
    loadRoster();
  }
});

// 🔹 LOGIN
function handleLogin(e) {
  e.preventDefault();
  const pass = document.getElementById("passwordInput").value;
  if (pass === ADMIN_PASSWORD) {
    document.getElementById("loginSection").classList.add("hidden");
    document.getElementById("adminDashboard").classList.add("show");
    loadRaids();
    loadRoster();
  } else {
    const err = document.getElementById("errorMessage");
    err.textContent = "❌ Hibás jelszó!";
    err.classList.add("show");
    setTimeout(() => err.classList.remove("show"), 2000);
  }
}

// 🔹 LOGOUT
function handleLogout() {
  document.getElementById("loginSection").classList.remove("hidden");
  document.getElementById("adminDashboard").classList.remove("show");
}

// 🔹 LOAD RAIDS
function loadRaids() {
  const container = document.getElementById("raidsGrid");
  if (!container) return;
  container.innerHTML = "";

  for (let expansion in ALL_RAIDS) {
    const raids = ALL_RAIDS[expansion];
    for (let instance in raids) {
      const card = document.createElement("div");
      card.className = "raid-card";

      let html = `<h3>${expansion} - ${instance}</h3><div class="boss-list">`;

      raids[instance].forEach((boss) => {
        const checked = raidData[expansion]?.[instance]?.[boss]
          ? "checked"
          : "";
        html += `<label class="boss-checkbox">
                    <input type="checkbox"
                           data-expansion="${expansion}"
                           data-instance="${instance}"
                           data-boss="${boss}"
                           ${checked}>
                    ${boss}
                 </label>`;
      });

      html += `</div>`;
      html += `<div class="kill-count" id="count-${expansion.replace(/ /g, "_")}-${instance.replace(/ /g, "_")}">0 / ${raids[instance].length}</div>`;
      html += `<button class="update-btn" data-expansion="${expansion}" data-instance="${instance}">💾 Mentés</button>`;

      card.innerHTML = html;
      container.appendChild(card);

      // Checkbox listener
      card.querySelectorAll("input[type=checkbox]").forEach((chk) => {
        chk.addEventListener("change", () => updateBoss(chk));
      });

      // Save button listener
      card.querySelector(".update-btn").addEventListener("click", (e) => {
        const exp = e.currentTarget.dataset.expansion;
        const inst = e.currentTarget.dataset.instance;
        saveRaid(exp, inst);
      });

      updateLiveCount(expansion, instance);
    }
  }
}

// 🔹 UPDATE RAID BOSS
function updateBoss(el) {
  const expansion = el.dataset.expansion;
  const instance = el.dataset.instance;
  const boss = el.dataset.boss;

  if (!raidData[expansion]) raidData[expansion] = {};
  if (!raidData[expansion][instance]) raidData[expansion][instance] = {};

  raidData[expansion][instance][boss] = el.checked;
  updateLiveCount(expansion, instance);
}

// 🔹 UPDATE LIVE COUNT
function updateLiveCount(expansion, instance) {
  const total = ALL_RAIDS[expansion][instance].length;
  const kills = Object.values(raidData[expansion]?.[instance] || {}).filter(
    (v) => v,
  ).length;
  const el = document.getElementById(
    `count-${expansion.replace(/ /g, "_")}-${instance.replace(/ /g, "_")}`,
  );
  if (el) {
    el.textContent = `${kills} / ${total}`;
    el.classList.toggle("complete", kills === total);
  }
}

// 🔹 SAVE RAID TO FIREBASE
function saveRaid(expansion, instance) {
  raidRef
    .child(`${expansion}/${instance}`)
    .set(raidData[expansion][instance])
    .then(() => alert("✅ Mentés sikeres!"))
    .catch((err) => alert("❌ Mentés sikertelen: " + err));
}

// 🔹 LOAD ROSTER IN ADMIN
function loadRoster() {
  const container = document.getElementById("rosterAdminContainer");
  if (!container) return;

  container.innerHTML = "";

  rosterData.players.forEach((player, index) => {
    const row = document.createElement("div");
    row.className = "roster-card";
    row.innerHTML = `
  <div class="player-info">
    <h3>${player.name}</h3>
    <p><strong>Class:</strong> ${player.class}</p>
    <p><strong>Role:</strong> ${player.role}</p>
    <p><a href="${player.raiderIO}" target="_blank">Raider.IO</a></p>
  </div>
  <div class="player-actions">
    <button onclick="deletePlayer(${idx})">❌ Delete</button>
    <button onclick="movePlayer(${idx},${idx - 1})">⬆️ Up</button>
    <button onclick="movePlayer(${idx},${idx + 1})">⬇️ Down</button>
  </div>
`;
    container.appendChild(row);
  });
}

// 🔹 ADD PLAYER
function addPlayer(player) {
  if (!rosterData.players) rosterData.players = [];
  rosterData.players.push(player);
  saveRoster();
}

// 🔹 DELETE PLAYER
function deletePlayer(index) {
  if (!rosterData.players || !rosterData.players[index]) return;
  rosterData.players.splice(index, 1);
  saveRoster();
}

// 🔹 MOVE PLAYER
function movePlayer(oldIndex, newIndex) {
  if (
    !rosterData.players ||
    newIndex < 0 ||
    newIndex >= rosterData.players.length
  )
    return;
  const [player] = rosterData.players.splice(oldIndex, 1);
  rosterData.players.splice(newIndex, 0, player);
  saveRoster();
}

// 🔹 SAVE ROSTER TO FIREBASE
function saveRoster() {
  rosterRef
    .set(rosterData)
    .then(() => {
      loadRoster();
      alert("✅ Roster updated successfully!");
      window.dispatchEvent(new Event("rosterDataUpdated"));
    })
    .catch((err) => alert("❌ Failed to save roster: " + err));
}
