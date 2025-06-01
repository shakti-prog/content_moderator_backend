const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../services/firebase");

const USERS_COLLECTION = "users";

module.exports = (router) => {
  // Register
  router.post("/register", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res
          .status(400)
          .json({ error: "Email and password are required" });

      const userRef = db.collection(USERS_COLLECTION).doc(email);
      const user = await userRef.get();

      if (user.exists)
        return res.status(400).json({ error: "User already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);
      await userRef.set({ email, password: hashedPassword });

      res.json({ message: "User registered successfully" });
    } catch (err) {
      console.error("Register error:", err);
      res.status(500).json({ error: "Something went wrong" });
    }
  });

  // Login
  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res
          .status(400)
          .json({ error: "Email and password are required" });

      const userRef = db.collection(USERS_COLLECTION).doc(email);
      const userDoc = await userRef.get();

      if (!userDoc.exists)
        return res.status(401).json({ error: "User not found" });

      const isMatch = await bcrypt.compare(password, userDoc.data().password);
      if (!isMatch)
        return res.status(403).json({ error: "Invalid credentials" });

      const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.json({ token });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Something went wrong" });
    }
  });
};
