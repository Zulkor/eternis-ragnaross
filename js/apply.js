// apply.js - Discord Webhook Form Handler

const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1462211333763366952/oIXXMuPuas3IcZc26UY02nZEvHadLvqyqGUfpL-7asOQkK2aeeRw_NfR_CoWZnGp5j5c";

const form = document.getElementById("applyForm");
const submitBtn = document.getElementById("submitBtn");
const successMessage = document.getElementById("successMessage");

// Form data object
const formData = {
  charName: document.getElementById("charName"),
  btag: document.getElementById("btag"),
  discord: document.getElementById("discord"),
  wowExp: document.getElementById("wowExp"),
  prevGuilds: document.getElementById("prevGuilds"),
  mainSpec: document.getElementById("mainSpec"),
  logs: document.getElementById("logs"),
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

  // Logs URL validation (if provided)
  const logsValue = formData.logs.value.trim();
  if (logsValue && !logsValue.includes("warcraftlogs.com")) {
    showError("logs", "❌ Érvénytelen WarcraftLogs link!");
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

// Send to Discord webhook
async function sendToDiscord(data) {
  const message = {
    content: `**🎯 ÚJ ETERNIS TRIAL JELENTKEZÉS!**

**👤 Karakter neve:** ${data.charName}
**🔗 BattleTag:** ${data.btag}
**💬 Discord név:** ${data.discord}
**📋 Miért Eternis?:** ${data.wowExp}
**❓ Korábbi tapasztalat:** ${data.prevGuilds}
**⚔️ Main spec / Ilvl:** ${data.mainSpec}
**📊 WarcraftLogs:** ${data.logs || "Nincs megadva"}
**📅 Raid aktivitás:** ${data.attendance}
**⏰ Elküldve:** ${new Date().toLocaleString("hu-HU")}`,
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

  // Prepare data
  const data = {
    charName: formData.charName.value.trim(),
    btag: formData.btag.value.trim(),
    discord: formData.discord.value.trim(),
    wowExp: formData.wowExp.value.trim(),
    prevGuilds: formData.prevGuilds.value.trim(),
    mainSpec: formData.mainSpec.value.trim(),
    logs: formData.logs.value.trim(),
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
