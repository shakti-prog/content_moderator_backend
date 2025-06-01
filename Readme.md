# 🛡️ Content Moderator Backend

This is the backend of the **Content Moderator AI Agent**, a system that analyzes both images and text for safety and policy compliance. It detects NSFW imagery, offensive language, hate speech, violence, PII, and more.

---

## 📦 Tech Stack

- **Node.js + Express** – Web framework for the backend API.
- **OpenAI Moderation API** – For analyzing textual content and detecting harmful/unsafe content.
- **Sightengine API** – For image analysis (nudity, violence, hate symbols, text detection, quality check, etc.).
- **Tesseract.js** – OCR (Optical Character Recognition) for extracting text from images.
- **Cloudinary** – For uploading and hosting user-uploaded images.
- **Firebase (Firestore)** – User authentication and storing registered users.
- **JWT** – For secure user authentication.
- **Multer** – To handle file uploads (images).
- **dotenv** – For environment variable configuration.

---

## 📁 Project Structure

```
content-moderator-backend/
├── routes/                 # Express route handlers
│   ├── auth.js             # Register/Login endpoints
│   ├── moderateText.js     # Text moderation endpoint
│   ├── moderateImage.js    # Image + OCR + joint moderation
├── services/              # External service integrations
│   ├── openAIModerationService.js
│   ├── sightEngineService.js
│   ├── cloudinaryImageUploadService.js
│   ├── gptReasoningService.js
├── middleware/            # Auth and file middleware
│   ├── middleware.js       # JWT verification
│   ├── fileMiddleware.js   # File type/size validation
├── firebase.js            # Firebase Firestore setup
├── index.js               # Express app entry point
├── .env                   # Environment variables (not committed)
```

---

## 🧠 Features

### 🔍 Text Moderation

- Uses OpenAI Moderation API
- Detects:

  - Hate speech
  - Harassment
  - Sexual content
  - Violence
  - Self-harm
  - Illicit content

- Generates category scores
- GPT-based reasoning engine gives human-readable explanations for flagged content

### 🖼️ Image Moderation

- Image uploaded via Multer → Cloudinary
- Analyzed using Sightengine models:

  - Nudity (v2.1)
  - Violence
  - Gore
  - Offensive symbols
  - Weapon
  - Quality
  - OCR text from image → re-analyzed via OpenAI

- Provides safe/unsafe decision + reasoning

### 🧾 Combined Multimodal Moderation

- Extracts text from image
- Analyzes both image and extracted text
- Returns joint result with:

  - Safe/Unsafe label
  - Explanation (via GPT)
  - Raw scores for transparency

### 🔐 Auth

- Firebase Firestore to store users
- Register & Login endpoints
- JWT issued on login
- Protected `/moderate/*` routes with middleware

---

## 🔐 Environment Variables

```env
PORT=9001
OPENAI_API_KEY=sk-xxxx
SIGHTENGINE_USER=your_user
SIGHTENGINE_SECRET=your_secret
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
JWT_SECRET=your_jwt_secret
```

> ✅ The `FIREBASE_SERVICE_ACCOUNT` is stored as a stringified JSON in the `.env` (not committed to GitHub).

---

## 📦 Setup Instructions

1. **Install dependencies**

```bash
npm install
```

2. **Add \*\***\`\`\***\* file** with all keys listed above

3. **Run locally**

```bash
node index.js
```

4. **Hit APIs using Postman or connect frontend**

---

## 🚀 Deployment Notes

- Deployed to **Render.com**
- Backend runs on: `https://content-moderator-backend.onrender.com`
- Render spins down inactive free instances (expect 50s delay on cold start)

---

## 📬 API Endpoints

### 🔐 Auth

| Method | Endpoint         | Description       |
| ------ | ---------------- | ----------------- |
| POST   | `/auth/register` | Register user     |
| POST   | `/auth/login`    | Login & get token |

### ⚙️ Moderation (Protected)

| Method | Endpoint          | Description                |
| ------ | ----------------- | -------------------------- |
| POST   | `/moderate/text`  | Analyze standalone text    |
| POST   | `/moderate/image` | Analyze image + OCR + text |

> 🔐 Protected by `Authorization: Bearer <token>` header

---

## 💡 Future Enhancements

- Rate limiting + abuse protection
- Admin dashboard for flagged content
- Export moderation logs as CSV
- Multilingual moderation support

---

## 👨‍💻 Author

- Shakti Tripathi ([@shakti-prog](https://github.com/shakti-prog))

---

Feel free to raise issues or contribute!
