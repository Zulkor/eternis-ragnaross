// apply.js - Discord Webhook Form Handler (ROLE PINGS FIXED)

const DISCORD_WEBHOOK_URL = 
  "https://discord.com/api/webhooks/1462211333763366952/oIXXMuPuas3IcZc26UY02nZEvHadLvqyqGUfpL-7asOQkK2aeeRw_NfR_CoWZnGp5j5c";

// 🚨 REPLACE THESE WITH YOUR ACTUAL ROLE IDs (18 digits)
const OFFICER_ROLE_ID = "PUT_OFFICER_ROLE_ID_HERE";  // Right-click Officer role → Copy ID
const RAID_LEADER_ROLE_ID = "PUT_RAID_LEADER_ROLE_ID_HERE";  // Right-click Raid Leader → Copy ID

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
  const message = {
    content: `<@&${OFFICER_ROLE_ID}> <@&${RAID_LEADER_ROLE_ID}> **🎯 ÚJ ETERNIS TRIAL JELENTKEZÉS!**

**👤 Karakter:** ${data.charName}
**🔗 BTag:** ${data.btag}
**💬 Discord:** ${data.discord}
**📋 Miért Eternis?:** ${data.wowExp}
**❓ Tapasztalat:** ${data.prevGuilds}
**⚔️ Spec:** ${data.mainSpec}
**📊 Raider.IO:** ${data.raiderIo || "Nincs"}
**📅 Aktivitás:** ${data.attendance}
**⏰ ${new Date().toLocaleString("hu-HU")}`,
    
    // ✅ THIS MAKES ROLE PINGS WORK
    allowed_mentions: {
      parse: ["roles"],
      roles: [OFFICER_ROLE_ID, RAID_LEADER_ROLE_ID]
    }
  };

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Webhook error:", error);
    alert("❌ Hiba: " + error.message);
    return false;
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

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

  const success = await sendToDiscord(data);

  if (success) {
    form.style.display = "none";
    successMessage.style.display = "block";
  } else {
    submitBtn.disabled = false;
    submitBtn.textContent = "Küldd el a Jelentkezést";
  }
});

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

console.log("✅ Apply form ready with role pings!");
