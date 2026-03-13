// apply.js - Discord Webhook Form Handler (3 ROLES + FULLY FIXED)

const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1462211333763366952/oIXXMuPuas3IcZc26UY02nZEvHadLvqyqGUfpL-7asOQkK2aeeRw_NfR_CoWZnGp5j5c";

// 🚨 REPLACE THESE 3 WITH YOUR REAL 18-DIGIT ROLE IDs
const OFFICER_ROLE_ID = "981106416712556544"; // Right-click Officer → Copy ID
const RAID_LEADER_ROLE_ID = "1409943959320662096"; // Right-click Raid Leader → Copy ID
const GUILD_MASTER_ROLE_ID = "981107738983677972"; // Right-click Guild Master → Copy ID

const form = document.getElementById("applyForm");
const submitBtn = document.getElementById("submitBtn");
const successMessage = document.getElementById("successMessage");

const formData = {
  charName: document.getElementById("charName"),
  btag: document.getElementById("btag"),
  discord: document.getElementById("discord"),
  wowExp: document.getElementById("wowExp"),
  prevGuilds: document.getElementById("prevGuilds"),
  mainSpec: document.getElementById("mainSpec"),
  raiderIo: document.getElementById("raiderIo"),
  attendance: document.getElementById("attendance"),
};

function validateForm() {
  let isValid = true;
  clearErrors();

  // BattleTag validation
  const btagValue = formData.btag.value.trim();
  if (!btagValue.match(/^[^\s#]+#[0-9]{4,}$/)) {
    showError("btag", "❌ Helytelen BattleTag! (Pl: Player#1234)");
    isValid = false;
  }

  // Discord validation
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
  const message = {
    content: `<@&${OFFICER_ROLE_ID}> <@&${RAID_LEADER_ROLE_ID}> <@&${GUILD_MASTER_ROLE_ID}> **🎯 ÚJ ETERNIS TRIAL JELENTKEZÉS!**

**👤 Karakter:** ${data.charName}
**🔗 BattleTag:** ${data.btag}
**💬 Discord:** ${data.discord}
**📋 Miért Eternis?:** ${data.wowExp}
**❓ Korábbi tapasztalat:** ${data.prevGuilds}
**⚔️ Main spec / Ilvl:** ${data.mainSpec}
**📊 Raider.IO:** ${data.raiderIo || "Nincs megadva"}
**📅 Raid aktivitás:** ${data.attendance}
**⏰ Elküldve:** ${new Date().toLocaleString("hu-HU")}`,

    allowed_mentions: {
      roles: [OFFICER_ROLE_ID, RAID_LEADER_ROLE_ID, GUILD_MASTER_ROLE_ID],
    },
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
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    console.log("✅ Message sent successfully!");
    return true;
  } catch (error) {
    console.error("Webhook error:", error);
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
    wowExp: formData.wowExp.value.trim(), // <-- FIXED HERE
    prevGuilds: formData.prevGuilds.value.trim(),
    mainSpec: formData.mainSpec.value.trim(),
    raiderIo: formData.raiderIo?.value?.trim() || "",
    attendance: formData.attendance.value.trim(),
  };

  console.log("📤 Sending data:", data);

  const success = await sendToDiscord(data);

  if (success) {
    form.style.display = "none";
    successMessage.style.display = "block";
    console.log("✅ SUCCESS - Application sent!");
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

console.log("✅ Eternis Apply Form ready - 3 roles will be pinged!");
