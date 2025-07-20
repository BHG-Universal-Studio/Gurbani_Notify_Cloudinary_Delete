// index.js
const express = require("express");
const admin = require("firebase-admin");
require("dotenv").config();

const app = express();
app.use(express.json());

// Initialize Firebase Admin SDK with service account from environment
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// POST /send-notification
app.post("/send-notification", async (req, res) => {
  const { token, title, body, data } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  const message = {
    token,
    notification: {
      title,
      body,
    },
    data: data || {}, // optional: extra custom payload like { destination: "hukamnama" }
  };

  try {
    const response = await admin.messaging().send(message);
    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error("FCM Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ FCM server running on port ${PORT}`);
});
