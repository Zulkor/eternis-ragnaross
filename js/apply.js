// apply.js - Discord Webhook Form Handler (DEBUG MODE)

const DISCORD_WEBHOOK_URL = 
  "https://discord.com/api/webhooks/1462211333763366952/oIXXMuPuas3IcZc26UY02nZEvHadLvqyqGUfpL-7asOQkK2aeeRw_NfR_CoWZnGp5j5c";

const form = document.getElementById("applyForm");
const submitBtn = document.getElementById("submitBtn");
const successMessage = document.getElementById("successMessage");

// FIXED: Match your ACTUAL HTML field IDs
const formData = {
  charName: document.getElementById("charName"),
  btag: document.getElementById("btag"),
  discord: document.getElementById("discord"),
  wowExp: document.getElementById("wowExp"),
  prevGuilds: document.getElementById("prevGuilds"),
  mainSpec: document.getElementById("mainSpec"),
  raiderIo: document.getElementById("raiderIo"),     // Must exist in HTML!
  attendance: document.getElementById("attendance"),
};

// Test if elements exist
console.log("Form elements found:", Object.keys(formData).map(key => formData[key] ? "✅" : "❌ " + key));

function validateForm() {
  let isValid = true;
  clearErrors();

  const btagValue = formData.btag.value.trim();
  if (!btagValue.match(/^[^\s#]+#[0-9]{4,}$/)) {
    showError("btag", "❌ Helytelen BattleTag! (Pl: Player#1234)");
    isValid = false;
  }

  const discordValue = formData.discord.value.trim();
  if (!discordValue) {
    showError("discord", "❌ Discord név kötelező!");
    isValid = false;
  } else if (discordValue.includes("@")) {
    showError("discord", "❌ Discord név ne tartalmazzon @ jelet!");
    isValid = false;
  }

  return isValid;
}

function showError(fieldName, message) {
  const errorElement = document.getElementById(`${fieldName}-error`);
  const inputElement = formData[fieldName];
  if (errorElement) errorElement.textContent = message;
  if (inputElement) inputElement.classList.add("error");
}

function clearErrors() {
  Object.keys(formData).forEach((key) => {
    const errorElement = document.getElementById(`${key}-error`);
    if (errorElement) errorElement.textContent = "";
    if (formData[key]) formData[key].classList.remove("error");
  });
}

async function sendToDiscord(data) {
  // SIMPLIFIED - NO ROLE PINGS YET (to test if form works)
  const message = {
    content: `**🎯 ÚJ ETERNIS TRIAL JELENTKEZÉS!**

**👤 Karakter:** ${data.charName}
**🔗 BTag:** ${data.btag}
**💬 Discord:** ${data.discord}
**📋 Miért Eternis?:** ${data.wowExp}
**❓ Tapasztalat:** ${data.prevGuilds}
**⚔️ Spec:** ${data.mainSpec}
**📊 Raider.IO:** ${data.raiderIo || "Nincs"}
**📅 Aktivitás:** ${data.attendance}
**⏰ ${new Date().toLocaleString("hu-HU")}`
  };

  try {
    console.log("🕹️ Sending to Discord...");
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    console.log("📡 Response:", response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Discord error:", errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return true;
  } catch (error) {
    console.error("💥 Webhook error:", error);
    alert("❌ Hiba: " + error.message);
    return false;
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("🚀 Form submitted!");

  if (!validateForm()) {
    console.log("❌ Validation failed");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Küldés...";

  const data = {
    charName: formData.charName.value.trim(),
    btag: formData.btag.value.trim(),
    discord: formData.discord.value.trim(),
    wowExp: formData.wowExp.value.trim(),
    prevGuilds: formData.prevGuilds.value.trim(),
    mainSpec: formData.mainSpec.value.trim(),
    raiderIo: formData.raiderIo?.value?.trim() || "",
    attendance: formData.attendance.value.trim(),
  };

  console.log("📤 Data to send:", data);

  const success = await sendToDiscord(data);

  if (success) {
    form.style.display = "none";
    successMessage.style.display = "block";
    console.log("✅ SUCCESS!");
  } else {
    submitBtn.disabled = false;
    submitBtn.textContent = "Küldd el a Jelentkezést";
  }
});

// Clear errors on input
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

console.log("✅ Apply form ready! Open F12 Console to debug.");
