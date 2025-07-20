const express = require("express");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const admin = require("firebase-admin");
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
  credential: admin.credential.cert(serviceAccount)
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
const hukamTitles = [/* your titles... */];
const hukamBodies = [/* your bodies... */];

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
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🔔 Send Path Notification (to topic)
app.post("/send-path", async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) return res.status(400).json({ success: false, message: "Missing title or body" });

  const message = {
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
      destination: "path"
    },
    topic: "path"
  };

  try {
    const response = await admin.messaging().send(message);
    res.status(200).json({ success: true, message: "Path notification sent", response });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🔔 Send Test Notification (to device token)
app.post("/send-test-notification", async (req, res) => {
  const { token, title, body } = req.body;
  if (!token || !title || !body) return res.status(400).json({ success: false, message: "Missing token, title or body" });

  const message = {
    notification: { title, body },
    android: {
      notification: { sound: "default" }
    },
    apns: {
      payload: {
        aps: { sound: "default" }
      }
    },
    token
  };

  try {
    const response = await admin.messaging().send(message);
    res.status(200).json({ success: true, message: "Test notification sent", response });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Start Server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Server running on port ${port}`));
