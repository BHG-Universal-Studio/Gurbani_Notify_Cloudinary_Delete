const express = require("express");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const admin = require("firebase-admin");
require("dotenv").config();

const app = express();

// 🧩 Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 🌩️ Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 🔐 Firebase Admin Init
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// ✅ Ping
app.get("/ping", (req, res) => {
  res.status(200).json({ success: true, message: "pong", timestamp: Date.now() });
});

// ✅ Delete Cloudinary Image
app.post("/delete", async (req, res) => {
  const publicId = req.body.public_id;
  if (!publicId) return res.status(400).json({ success: false, message: "Missing public_id" });

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return res.json({ success: true, result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 🧠 Random Hukamnama Titles and Bodies
const hukamTitles = [
  "Daily Hukamnama",
  "Today’s Divine Order",
  "Hukamnama from Sri Darbar Sahib"
];

const hukamBodies = [
  "Listen to today’s divine message",
  "New Hukamnama available now",
  "Guru’s words for today are here"
];

// 🔔 Send Hukamnama Notification (to topic)
app.post("/send-hukamnama", async (req, res) => {
  const channelId = "hukamnama";
  const title = hukamTitles[Math.floor(Math.random() * hukamTitles.length)];
  const body = hukamBodies[Math.floor(Math.random() * hukamBodies.length)];

  const message = {
    notification: { title, body },
    android: {
      notification: { channelId, sound: "default" }
    },
    apns: {
      payload: {
        aps: { sound: "default" }
      }
    },
    data: {
      destination: "hukamnama"
    },
    topic: channelId
  };

  try {
    const response = await admin.messaging().send(message);
    res.status(200).json({ success: true, message: "Hukamnama sent", response });
  } catch (err) {
    console.error("FCM Error (hukamnama):", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🔔 Send Path Notification (to topic)
app.post("/send-path", async (req, res) => {
  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ success: false, message: "Missing token, title, or body" });
  }

  const message = {
    token,
    notification: { title, body },
    android: {
      notification: { channelId: "path", sound: "default" }
    },
    apns: {
      payload: {
        aps: { sound: "default" }
      }
    },
    data: {
      navigateTo: "path"
    }
  };

  try {
    const response = await admin.messaging().send(message);
    res.status(200).json({ success: true, message: "Path notification sent to token", response });
  } catch (err) {
    console.error("FCM Error (path):", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// 🔔 Send Notification To Specific Device Token
app.post("/send-notification", async (req, res) => {
  const { token, title, body, data } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  const message = {
    token,
    notification: { title, body },
    android: {
      notification: { sound: "default" }
    },
    apns: {
      payload: {
        aps: { sound: "default" }
      }
    },
    data: data || {} // Optional data payload
  };

  try {
    const response = await admin.messaging().send(message);
    res.status(200).json({ success: true, message: "Notification sent", response });
  } catch (err) {
    console.error("FCM Error (token):", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Start Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
