const multer = require("multer");
const fs = require("fs");
const { createWorker } = require("tesseract.js");
const {
  uploadToCloudinary,
} = require("../services/cloudinaryImageUploadService.js");
const { analyzeImage } = require("../services/sightEngineService");
const { moderateText } = require("../services/openAIModerationService");

const upload = require("../middleware/fileMiddleware.js");
const { generateReasoning } = require("../services/generateReasoning.js");

module.exports = (router) => {
  router.post("/image", upload.single("image"), async (req, res) => {
    try {
      const localPath = req.file.path;
      const imageUrl = await uploadToCloudinary(localPath);
      fs.unlinkSync(localPath);

      const worker = await createWorker("eng");
      const ocrResult = await worker.recognize(imageUrl);
      await worker.terminate();
      const extractedText = ocrResult.data.text?.trim() || "";

      const imageModeration = await analyzeImage(imageUrl);
      let textModeration = {
        flagged: false,
        categories: [],
        explanation: "No text detected",
      };

      if (extractedText.length > 0) {
        textModeration = await moderateText(extractedText);
      }
      let gpt_reasoning = "Content is safe";
      const flagged = !imageModeration.safe || textModeration.flagged;
      const combinedReasons = [
        ...(imageModeration.reasons || []),
        ...(textModeration.explanation !== "No violations detected"
          ? [textModeration.explanation]
          : []),
      ];
      if (flagged) {
        gpt_reasoning = await generateReasoning({
          imageScores: imageModeration.raw,
          textScores: textModeration.scores,
          extractedText,
        });
      }

      res.json({
        safe: !flagged,
        imageUrl,
        extractedText,
        reasons: combinedReasons,
        imageScores: imageModeration.raw,
        textScores: textModeration.scores,
        reasoning: gpt_reasoning,
      });
    } catch (err) {
      console.error("Image moderation error:", err);
      res.status(500).json({ error: "Failed to analyze uploaded image" });
    }
  });
};
