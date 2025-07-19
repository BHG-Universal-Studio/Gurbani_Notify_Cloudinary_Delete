const express = require("express");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 🌩️ Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ✅ Ping Endpoint
app.get("/ping", (req, res) => {
  res.status(200).json({ success: true, message: "pong", timestamp: Date.now() });
});

// ✅ Delete from Cloudinary
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

// 🧠 Random Hukamnama Messages
const hukamTitles = [
  "Amrit Vele da Hukamnama Sahib Ji",
  "Waheguru Ji da aadesh – Aaj da Hukamnama",
  "Aaj da pavittar Hukamnama hazir hai",
  "Guru Sahib di kirpa naal hukam prapat hoya hai",
  "Amrit Vela – Guru da bachan mil gaya ji",
  "Navi subah, navey ashirwad – Hukamnama suno",
  "Sehaj vich vaso – Aaj da hukam aagaya ji",
  "Satguru da hukum – Amrit Vele di mehar",
  "Shuru karo din Guru de bachan naal",
  "Waheguru di reham – Aaj da hukam suno",
  "Hukamnama Sahib Ji – Guru Sahiban Ji di roshni",
  "Aaj vi Guru Sahib Ji ne kirpa kiti – Hukam tyar hai",
  "Rooh di roti – Amrit Vele da hukam prapt karo",
  "Satnam Waheguru Ji – Aaj da Hukam mila hai",
  "Aaj Da Hukamnama 📜 Waheguru Ji 🙏"
];

const hukamBodies = [
  "Amrit Vele di mehar naal aaj da pavittar Hukamnama hazir hai.",
  "Apni rooh nu Guru Sahib Ji de bachan naal jagaayiye. 🌅",
  "Amrit Vele di roshni vich Guru Sahib da pavittar hukam aagaya hai. Apne din di shuruaat Guru de ashirwad naal karo. 🌸🙏",
  "Aaj da hukam, rooh di roti ban ke aaya hai. Naam Simran naal judo te Guru di kirpa mehsoos karo. 🌅🕊️",
  "Shri Guru Granth Sahib Ji ne aaj vi apna bachan bakshia hai. Vekho, ki Guru ne kehna hai Sade layi aaj. 🙏✨",
  "Amrit Vele da samah vakhri barkat leke aaya hai. Aaj da hukam padho, te apne din nu Guru de naal jodo. 🌞📜",
  "Aaj vi Guru di rehmat vich hukam prapt hoya hai. Guru da bachan jeevan vich sukh, sehaj te shanti le aunda hai. 💛",
  "Guru Sahib da aadesh – ik vadiya raah hai jeevan layi. Is hukam vich hai shanti, gyaan te pyar. 🙏📖",
  "Har subah di sab ton vaddi daat – Guru da hukamnama. Ajj di kirpa nu miss na karo. 🌼✨",
  "Waheguru Ji ne aaj vi apne sevak layi sandesh bhejiya hai. Aao, us pavittar bachan nu padhiye. 📜🌞",
  "Ik vaar Guru da bachan sun lo – man diyaan uljhanaan hal ho jaan. Aaj da hukam jivan nu roshan kare. 🕯️"
];

// 🔥 Send Hukamnama Notification
app.post("/send-hukamnama", async (req, res) => {
  const channelId = "hukamnama"; // channelId from app

  const title = hukamTitles[Math.floor(Math.random() * hukamTitles.length)];
  const body = hukamBodies[Math.floor(Math.random() * hukamBodies.length)];

  const message = {
    notification: {
      title,
      body
    },
    android: {
      notification: {
        channel_id: channelId,
        sound: "default"
      }
    },
    apns: {
      payload: {
        aps: {
          sound: "default"
        }
      }
    },
    data: {
      destination: "hukamnama"
    },
    to: "/topics/" + channelId
  };

  try {
    const response = await axios.post("https://fcm.googleapis.com/fcm/send", message, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "key=" + process.env.FIREBASE_SERVER_KEY
      }
    });

    return res.status(200).json({ success: true, message: "Hukamnama sent", fcm: response.data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 🔥 Send Path Notification
app.post("/send-path", async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    return res.status(400).json({ success: false, message: "Missing title or body" });
  }

  const message = {
    notification: {
      title,
      body
    },
    android: {
      notification: {
        channel_id: "path",
        sound: "default"
      }
    },
    apns: {
      payload: {
        aps: {
          sound: "default"
        }
      }
    },
    data: {
      destination: "path"
    },
    to: "/topics/path"
  };

  try {
    const response = await axios.post("https://fcm.googleapis.com/fcm/send", message, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "key=" + process.env.FIREBASE_SERVER_KEY
      }
    });

    return res.status(200).json({ success: true, message: "Path notification sent", fcm: response.data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Start Server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Server running on port ${port}`));
