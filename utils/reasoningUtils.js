function describeImageFromScores(scores = {}) {
  const output = [];

  // 🔞 Nudity
  const nudity = scores.nudity;
  if (nudity?.sexual_activity >= 0.5) {
    output.push("The image may contain sexual activity or explicit nudity.");
  }
  if (nudity?.suggestive >= 0.5) {
    output.push("It may depict suggestive poses or revealing clothing.");
  }
  if (nudity?.underwear >= 0.5) {
    output.push("People in underwear or lingerie may be shown.");
  }

  // 🔪 Violence / Gore
  const gore = scores.gore?.classes || {};
  if (gore.very_bloody >= 0.5 || gore.slightly_bloody >= 0.5) {
    output.push("Graphic blood or injuries appear to be present.");
  }
  if (gore.corpse >= 0.5) {
    output.push("A corpse or dead body may be visible.");
  }
  if (gore.serious_injury >= 0.5 || gore.superficial_injury >= 0.5) {
    output.push("Visible signs of injury or trauma are present.");
  }

  // 🔫 Weapons
  const weapon = scores.weapon?.classes || {};
  if (weapon.firearm >= 0.5 || weapon.knife >= 0.5) {
    output.push("A weapon like a firearm or knife is visible.");
  }

  // 🧠 Offensive Gestures
  const offensive = scores.offensive?.classes || {};
  if (offensive.middle_finger >= 0.5) {
    output.push("Offensive gesture (e.g., middle finger) detected.");
  }

  // 🍺 Drugs / Alcohol / Tobacco
  if (scores.alcohol?.prob >= 0.5) {
    output.push("Alcohol consumption or containers may be visible.");
  }
  if (scores.recreational_drug?.prob >= 0.5) {
    output.push("Use or presence of recreational drugs detected.");
  }
  if (scores.tobacco?.prob >= 0.5) {
    output.push("Smoking or tobacco products are likely present.");
  }

  // 💬 Text Content (on Image)
  if (scores["text-content"]?.profanity >= 0.5) {
    output.push(
      "Text on the image may contain profanity or offensive language."
    );
  }
  if (scores["text-content"]?.hate_speech >= 0.5) {
    output.push(
      "Hate speech or abusive language is present in the image text."
    );
  }

  // 🧩 Self-harm
  if (scores["self-harm"]?.prob >= 0.5) {
    output.push("The image may depict self-harm or related context.");
  }

  // 📉 Image Quality
  const quality = scores.quality || {};
  if (quality.blur >= 0.7 || quality.noise >= 0.7) {
    output.push("Image is too blurry or noisy to confidently analyze.");
  }

  return output.length > 0 ? output.join(" ") : "";
}

function filterScores(scores = {}) {
  const THRESHOLD = 0.5;
  return Object.entries(scores)
    .filter(([_, score]) => score >= THRESHOLD)
    .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {});
}

module.exports = {
  describeImageFromScores,
  filterScores,
};
