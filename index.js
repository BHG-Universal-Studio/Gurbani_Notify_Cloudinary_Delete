const express = require("express");
const admin = require("firebase-admin");
const cloudinary = require("cloudinary").v2;
const bodyParser = require("body-parser");
const cors = require("cors");

// Setup Express
const app = express();
app.use(cors());
app.use(bodyParser.json());

// ===================== Firebase Admin Init =====================
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// ===================== Cloudinary Config =====================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ===================== Routes =====================

// Home route
app.get("/", (req, res) => {
  res.send("✅ Gurbani Backend API is live!");
});

// Trigger test push notification
app.post("/send-notification", async (req, res) => {
  // Hardcoded test values
  const token = "YOUR_DEVICE_FCM_TOKEN_HERE"; // ⬅️ Replace with your actual FCM device token
  const title = "New Post!";
  const body = "Waheguru Ji Ka Khalsa 🙏";
  const data = {
    destination: "FeedFragment",
    postId: "abc123",
  };

  const message = {
    token,
    notification: { title, body },
    data,
    android: {
      priority: "high",
    },
    apns: {
      headers: { "apns-priority": "10" },
      payload: {
        aps: { sound: "default" },
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    res.status(200).json({
      success: true,
      message: "Notification sent successfully",
      messageId: response,
    });
  } catch (error) {
    console.error("FCM Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send notification",
      details: error.message,
    });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
