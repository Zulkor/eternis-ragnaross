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

// 🔹 FETCH DATA
raidRef.on("value", (snap) => {
  raidData = snap.val() || {};
  if (document.getElementById("adminDashboard").classList.contains("show")) {
    loadRaids();
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

      // ✅ Add checkbox listener
      card.querySelectorAll("input[type=checkbox]").forEach((chk) => {
        chk.addEventListener("change", () => updateBoss(chk));
      });

      // ✅ Add save button listener
      card.querySelector(".update-btn").addEventListener("click", (e) => {
        const exp = e.currentTarget.dataset.expansion;
        const inst = e.currentTarget.dataset.instance;
        saveRaid(exp, inst);
      });

      updateLiveCount(expansion, instance);
    }
  }
}

// 🔹 UPDATE BOSS CHECKBOX
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

// 🔹 SAVE TO FIREBASE
function saveRaid(expansion, instance) {
  raidRef
    .child(`${expansion}/${instance}`)
    .set(raidData[expansion][instance])
    .then(() => alert("✅ Mentés sikeres!"))
    .catch((err) => alert("❌ Mentés sikertelen: " + err));
}
