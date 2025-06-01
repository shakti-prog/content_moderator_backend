const multer = require("multer");
const path = require("path");

// Set file size limit to 5MB
const MAX_SIZE = 5 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error("Unsupported file type");
    error.code = "UNSUPPORTED_FILE";
    return cb(error, false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});

module.exports = upload;