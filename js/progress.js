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
const raidRef = db.ref("raidData");

// 🔹 RAID CONFIG (minden boss minden raidből)
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

// Default selection: Midnight first
let selectedExpansion = "Midnight";
let selectedRaid = "The Voidspire"; // first raid in Midnight
let currentData = {};

// 🔹 LOCAL DATA

// 🔹 FETCH DATA
raidRef.on("value", (snap) => {
  raidData = snap.val() || {};
  updateAll();
});

// 🔹 UPDATE TABLE & PROGRESS
function updateAll() {
  const data = raidData?.[currentExpansion]?.[currentRaid];
  if (!data) return;

  const bosses = ALL_RAIDS[currentExpansion][currentRaid];
  let killed = 0;

  const tbody = document.getElementById("bossTableBody");
  tbody.innerHTML = "";

  bosses.forEach((boss, i) => {
    const dead = data.deadBosses?.[i];
    if (dead) killed++;

    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${boss}</td>
                    <td>${dead ? "✅ Killed" : "❌ Alive"}</td>`;
    tbody.appendChild(tr);
  });

  updateProgressBar(killed, bosses.length);
  document.getElementById("killCount").innerText = killed;
  document.getElementById("totalCount").innerText = bosses.length;
}

// 🔹 PROGRESS BAR
function updateProgressBar(killed, total) {
  const percent = Math.floor((killed / total) * 100);
  const bar = document.getElementById("progressFill");
  if (bar) bar.style.width = percent + "%";
}
