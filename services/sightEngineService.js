const axios = require("axios");

async function analyzeImage(imageUrl) {
  const response = await axios.get(process.env.SIGHT_ENGINE_BASE_URL, {
    params: {
      url: imageUrl,
      models:
        "nudity-2.1,violence,offensive-2.0,text-content,quality,weapon,gore-2.0",
      api_user: process.env.SIGHT_ENGINE_USER,
      api_secret: process.env.SIGHT_ENGINE_API_SECRET,
    },
  });

  const data = response.data;
  const reasons = [];

  // --- Nudity ---
  const nudity = data.nudity || {};
  if (
    nudity.sexual_activity > 0.5 ||
    nudity.sexual_display > 0.5 ||
    nudity.erotica > 0.5
  ) {
    reasons.push(
      `⚠️ Nudity: erotic or explicit content (erotica: ${nudity.erotica})`
    );
  } else if (nudity.very_suggestive > 0.7) {
    reasons.push(
      `⚠️ Very suggestive content (score: ${nudity.very_suggestive})`
    );
  }

  // --- Violence ---
  const violence = data.violence || {};
  if (violence.prob > 0.5) {
    const detectedViolence = Object.entries(violence.classes || {})
      .filter(([_, score]) => score > 0.2)
      .map(([key, val]) => `${key.replace("_", " ")} (${val})`);
    reasons.push(`🔪 Violence: ${detectedViolence.join(", ")}`);
  }

  // --- Offensive Symbols ---
  const offensive = data.offensive || {};
  const offensiveSymbols = Object.entries(offensive)
    .filter(([_, val]) => val > 0.5)
    .map(([key, val]) => `${key.replace("_", " ")} (${val})`);
  if (offensiveSymbols.length > 0) {
    reasons.push(`🚫 Offensive symbols: ${offensiveSymbols.join(", ")}`);
  }

  // --- Text Violations ---
  const text = data.text || {};
  const textIssues = [];
  for (const [category, value] of Object.entries(text)) {
    if (Array.isArray(value) && value.length > 0) {
      const formatted = value.map((v) => v.match || v).join(", ");
      textIssues.push(`${category.replace(/-/g, " ")}: ${formatted}`);
    }
  }
  if (textIssues.length > 0) {
    reasons.push(`📝 Text violations: ${textIssues.join(" | ")}`);
  }

  // --- Quality ---
  const quality = data.quality || {};
  if (quality.score !== undefined) {
    if (quality.score < 0.3) {
      reasons.push(`🧼 Very low image quality (score: ${quality.score})`);
    } else if (quality.score < 0.6) {
      reasons.push(`📉 Low image quality (score: ${quality.score})`);
    } else {
      reasons.push(`📷 High image quality (score: ${quality.score})`);
    }
  }

  // --- Weapon Detection ---
  const weapon = data.weapon || {};
  const weaponFlags = [];

  if (weapon.classes?.firearm > 0.7)
    weaponFlags.push(`firearm (${weapon.classes.firearm})`);
  if (weapon.classes?.knife > 0.5)
    weaponFlags.push(`knife (${weapon.classes.knife})`);
  if (weapon.firearm_action?.aiming_threat > 0.5)
    weaponFlags.push(
      `threatening gesture with firearm (${weapon.firearm_action.aiming_threat})`
    );

  if (weaponFlags.length > 0) {
    reasons.push(`🔫 Weapon detected: ${weaponFlags.join(", ")}`);
  }

  // --- Gore Detection ---
  const gore = data.gore || {};
  const goreFlags = Object.entries(gore.classes || {})
    .filter(([_, score]) => score > 0.5)
    .map(([key, val]) => `${key.replace("_", " ")} (${val})`);
  if (goreFlags.length > 0) {
    reasons.push(`🩸 Gore/graphic content: ${goreFlags.join(", ")}`);
  }

  return {
    safe: reasons.every(
      (reason) =>
        !reason.startsWith("⚠️") &&
        !reason.startsWith("🔪") &&
        !reason.startsWith("🚫") &&
        !reason.startsWith("📝") &&
        !reason.startsWith("🔫") &&
        !reason.startsWith("🩸")
    ),
    reasons,
    raw: {
      nudity,
      violence,
      offensive,
      text,
      quality,
      weapon,
      gore,
    },
  };
}

module.exports = { analyzeImage };
