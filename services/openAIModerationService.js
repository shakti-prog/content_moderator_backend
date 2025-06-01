const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


async function moderateText(text) {
  const response = await openai.moderations.create({
    input: text,
    model: "omni-moderation-latest",
  });
  const result = response.results[0];

  const categories = Object.entries(result.categories)
    .filter(([_, flagged]) => flagged)
    .map(([category]) => category);

  return {
    flagged: result.flagged,
    categories: categories,
    scores: result.category_scores,
    explanation: categories.length
      ? `Flagged for: ${categories.join(", ")}`
      : "No violations detected",
  };
}

module.exports = { moderateText };
