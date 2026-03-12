// apply.js - Discord Webhook Form Handler

const DISCORD_WEBHOOK_URL = 
  "https://discord.com/api/webhooks/1462211333763366952/oIXXMuPuas3IcZc26UY02nZEvHadLvqyqGUfpL-7asOQkK2aeeRw_NfR_CoWZnGp5j5c";

// REPLACE THESE WITH YOUR ACTUAL ROLE IDs
const OFFICER_ROLE_ID = "123456789012345678";  // ← Get from Discord: Right-click Officer role → Copy ID
const RAID_LEADER_ROLE_ID = "987654321098765432";  // ← Get from Discord: Right-click Raid Leader role → Copy ID

const form = document.getElementById("applyForm");
const submitBtn = document.getElementById("submitBtn");
const successMessage = document.getElementById("successMessage");

// Form data object - FIXED FIELD NAMES
const formData = {
  charName: document.getElementById("charName"),
  btag: document.getElementById("btag"),
  discord: document.getElementById("discord"),
  wowExp: document.getElementById("wowExp"),
  prevGuilds: document.getElementById("prevGuilds"),
  mainSpec: document.getElementById("mainSpec"),
  raiderIo: document.getElementById("raiderIo"),      // ← FIXED: was "logs"
  warcraftLogs: document.getElementById("warcraftLogs"), // ← NEW
  attendance: document.getElementById("attendance"),
};

// Validation function
function validateForm() {
  let isValid = true;
  clearErrors();

  // BattleTag validation (name#1234)
  const btagValue = formData.btag.value.trim();
  if (!btagValue.match(/^[^\s#]+#[0-9]{4,}$/)) {
    showError("btag", "❌ Helytelen BattleTag! (Pl: Player#1234)");
    isValid = false;
  }

  // Discord name validation (not empty, no @)
  const discordValue = formData.discord.value.trim();
  if (!discordValue) {
    showError("discord", "❌ Discord név kötelező!");
    isValid = false;
  } else if (discordValue.includes("@")) {
    showError(
      "discord",
      "❌ Discord név ne tartalmazzon @ jelet! (Pl: Player#1234)",
    );
    isValid = false;
  }

  // Raider.IO URL validation (if provided)
  const raiderIoValue = formData.raiderIo.value.trim();
  if (raiderIoValue && !raiderIoValue.includes("raider.io")) {
    showError("raiderIo", "❌ Érvénytelen Raider.IO link!");
    isValid = false;
  }

  // Warcraft Logs URL validation (if provided)
  const logsValue = formData.warcraftLogs.value.trim();
  if (logsValue && !logsValue.includes("warcraftlogs.com")) {
    showError("warcraftLogs", "❌ Érvénytelen WarcraftLogs link!");
    isValid = false;
  }

  return isValid;
}

// Show error message
function showError(fieldName, message) {
  const errorElement = document.getElementById(`${fieldName}-error`);
  const inputElement = formData[fieldName];

  if (errorElement) {
    errorElement.textContent = message;
  }
  if (inputElement) {
    inputElement.classList.add("error");
  }
}

// Clear all errors
function clearErrors() {
  Object.keys(formData).forEach((key) => {
    const errorElement = document.getElementById(`${key}-error`);
    if (errorElement) {
      errorElement.textContent = "";
    }
    if (formData[key]) {
      formData[key].classList.remove("error");
    }
  });
}

// Send to Discord webhook WITH ROLE PINGS
async function sendToDiscord(data) {
  const message = {
    content: `<@&${OFFICER_ROLE_ID}> <@&${RAID_LEADER_ROLE_ID}> **🎯 ÚJ ETERNIS TRIAL JELENTKEZÉS!**


**👤 Karakter neve:** ${data.charName}
**🔗 BattleTag:** ${data.btag}
**💬 Discord név:** ${data.discord}
**📋 Miért Eternis?:** ${data.wowExp}
**❓ Korábbi tapasztalat:** ${data.prevGuilds}
**⚔️ Main spec / Ilvl:** ${data.mainSpec}
**📊 Raider.IO:** ${data.raiderIo || "Nincs megadva"}
**📋 Warcraft Logs:** ${data.warcraftLogs || "Nincs megadva"}
**📅 Raid aktivitás:** ${data.attendance}
**⏰ Elküldve:** ${new Date().toLocaleString("hu-HU")}`,
    
    // PING ONLY SPECIFIC ROLES
    allowed_mentions: {
      roles: [OFFICER_ROLE_ID, RAID_LEADER_ROLE_ID]
    }
  };

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Discord API hiba: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Webhook küldési hiba:", error);
    alert("❌ Hiba történt a küldésnél! Próbáld újra.");
    return false;
  }
}

// Form submit handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Validate form
  if (!validateForm()) {
    console.log("❌ Form validáció sikertelen");
    return;
  }

  // Disable button & show loading state
  submitBtn.disabled = true;
  submitBtn.textContent = "Küldés...";

  // Prepare data - FIXED FIELD NAMES
  const data = {
    charName: formData.charName.value.trim(),
    btag: formData.btag.value.trim(),
    discord: formData.discord.value.trim(),
    wowExp: formData.wowExp.value.trim(),
    prevGuilds: formData.prevGuilds.value.trim(),
    mainSpec: formData.mainSpec.value.trim(),
    raiderIo: formData.raiderIo.value.trim(),        // ← FIXED
    warcraftLogs: formData.warcraftLogs.value.trim(), // ← NEW
    attendance: formData.attendance.value.trim(),
  };

  // Send to Discord
  const success = await sendToDiscord(data);

  if (success) {
    // Hide form & show success message
    form.style.display = "none";
    successMessage.style.display = "block";
  } else {
    // Re-enable button on error
    submitBtn.disabled = false;
    submitBtn.textContent = "Küldd el a Jelentkezést";
  }
});

// Real-time error clearing
Object.keys(formData).forEach((key) => {
  if (formData[key]) {
    formData[key].addEventListener("input", () => {
      const errorElement = document.getElementById(`${key}-error`);
      if (errorElement && errorElement.textContent) {
        errorElement.textContent = "";
        formData[key].classList.remove("error");
      }
    });
  }
});

console.log("✅ Apply form initialized successfully!");
