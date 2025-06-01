const { OpenAI } = require("openai");
const { describeImageFromScores } = require("../utils/reasoningUtils");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateReasoning({
  imageScores = {},
  textScores = {},
  extractedText = "",
}) {
  const imageDescription = describeImageFromScores(imageScores);
  const prompt = `
You are a content moderation analyst. You will be given:
- Extracted TEXT (if available)
- Moderation SCORES from an AI model for both image and text

Your job is to write a concise but **specific explanation** of why the content might be unsafe.

🎯 Guidelines:
- If the **text contains explicit or unsafe words**, quote them (e.g., "f***", "k*** them") using asterisks for censorship.
- For **image scores**, you must analyze the keys and deduce their real-world meaning.
  For example:
    - "gore.classes.very_bloody" → may imply graphic violence or disturbing blood
    - "weapon.classes.firearm" → may imply a gun is visible
    - "nudity.sexual_activity" → may imply sexual content
    - "offensive.middle_finger" → may imply an offensive gesture
- Do **not** mention JSON or scores directly.
- If no unsafe content is found, say the content appears safe.

Now, review the following data and explain why this content may or may not be unsafe:

Extracted Text:
"${extractedText}"

Image Descripton Text:
"${imageDescription}"

Write 1–3 short, clear sentences explaining what made this content unsafe (if anything).
`;

  const chatRes = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content:
          "You generate short, specific safety explanations for AI moderation.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return (
    chatRes.choices[0]?.message?.content?.trim() || "No reasoning generated."
  );
}

module.exports = { generateReasoning };
