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

// 🔐 Cloudinary Config
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

// 🔐 Authorization Middleware
function authorizeWorker(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  const validKey = process.env.NOTIFY_SECRET_KEY;

  if (!token || token !== validKey) {
    return res.status(401).json({ success: false, error: "Unauthorized request" });
  }

  next();
}


// ✅ Ping Endpoint
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

// 🧠 Hukamnama Messages
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

// 🔔 Send Hukamnama Notification (secured)
app.post("/send-hukamnama", authorizeWorker, async (req, res) => {
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

// 🔔 Send Path Notification (secured)
app.post("/send-path", authorizeWorker, async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    return res.status(400).json({ success: false, message: "Missing title or body" });
  }

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
    console.error("FCM Error (path):", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🔔 Send Notification To Specific Device Token (secured)
app.post("/send-notification", authorizeWorker, async (req, res) => {
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
    data: data || {}
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
