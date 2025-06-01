const { generateReasoning } = require("../services/generateReasoning");
const { moderateText } = require("../services/openAIModerationService");

module.exports = (router) => {
  router.post("/text", async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    try {
      const result = await moderateText(text);
      let gpt_reasoning = "Content is safe";
      if (result.flagged) {
        gpt_reasoning = await generateReasoning({
          textScores: result.scores,
          extractedText: text,
        });
      }

      res.json({ ...result, reasoning: gpt_reasoning });
    } catch (err) {
      console.error("Text moderation error:", err);
      res.status(500).json({ error: "Failed to analyze text" });
    }
  });
};
