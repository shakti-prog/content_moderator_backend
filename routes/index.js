const express = require("express");
const router = express.Router();

require("./moderateText")(router);
require("./moderateImage")(router);
require("./auth")(router);
router.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "File too large (Max 5MB)" });
  }
  if (err.code === "UNSUPPORTED_FILE") {
    return res.status(400).json({ error: "Unsupported file format" });
  }
  next(err);
});

module.exports = router;
