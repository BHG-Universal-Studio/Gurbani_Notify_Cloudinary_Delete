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


// ✅ Ping Endpoint (secured)
app.get("/ping-server", authorizeWorker, (req, res) => {
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
  "Satnam Waheguru Ji – Aaj da Hukam mila hai",
  "Hukamnama Sahib Ji – Guru Sahiban Ji di roshni",
  "ਅੰਮ੍ਰਿਤ ਵੇਲੇ ਦਾ ਹੁਕਮਨਾਮਾ ਸਾਹਿਬ ਜੀ",
  "ਵਾਹਿਗੁਰੂ ਜੀ ਦਾ ਆਦੇਸ਼ – ਅੱਜ ਦਾ ਹੁਕਮਨਾਮਾ",
  "ਅੱਜ ਦਾ ਪਵਿੱਤਰ ਹੁਕਮਨਾਮਾ ਹਾਜ਼ਰ ਹੈ",
  "ਗੁਰੂ ਸਾਹਿਬ ਦੀ ਕਿਰਪਾ ਨਾਲ ਹੁਕਮ ਪ੍ਰਾਪਤ ਹੋਇਆ ਹੈ",
  "ਅੰਮ੍ਰਿਤ ਵੇਲਾ – ਗੁਰੂ ਦਾ ਬਚਨ ਮਿਲ ਗਿਆ ਜੀ",
  "Aaj vi Guru Sahib Ji ne kirpa kiti – Hukam tyar hai",
  "ਨਵੀਂ ਸਵੇਰ, ਨਵੇਂ ਅਸੀਸ – ਹੁਕਮਨਾਮਾ ਸੁਣੋ",
  "ਸਹਿਜ ਵਿਚ ਵਸੋ – ਅੱਜ ਦਾ ਹੁਕਮ ਆ ਗਿਆ ਜੀ",
  "ਸਤਿਗੁਰੂ ਦਾ ਹੁਕਮ – ਅੰਮ੍ਰਿਤ ਵੇਲੇ ਦੀ ਮਿਹਰ",
  "ਗੁਰੂ ਦੇ ਬਚਨ ਨਾਲ ਦਿਨ ਦੀ ਸ਼ੁਰੂਆਤ ਕਰੋ",
  "ਵਾਹਿਗੁਰੂ ਦੀ ਰਹਿਮ – ਅੱਜ ਦਾ ਹੁਕਮ ਸੁਣੋ",
  "Rooh di roti – Amrit Vele da hukam prapt karo",
  "ਹੁਕਮਨਾਮਾ ਸਾਹਿਬ ਜੀ – ਗੁਰੂ ਸਾਹਿਬਾਨ ਜੀ ਦੀ ਰੋਸ਼ਨੀ",
  "ਅੱਜ ਵੀ ਗੁਰੂ ਸਾਹਿਬ ਜੀ ਨੇ ਕਿਰਪਾ ਕੀਤੀ – ਹੁਕਮ ਤਿਆਰ ਹੈ",
  "ਰੂਹ ਦੀ ਰੋਟੀ – ਅੰਮ੍ਰਿਤ ਵੇਲੇ ਦਾ ਹੁਕਮ ਪ੍ਰਾਪਤ ਕਰੋ",
  "ਸਤਿਨਾਮ ਵਾਹਿਗੁਰੂ ਜੀ – ਅੱਜ ਦਾ ਹੁਕਮ ਮਿਲਿਆ ਹੈ",
  "ਅੱਜ ਦਾ ਹੁਕਮਨਾਮਾ 📜 ਵਾਹਿਗੁਰੂ ਜੀ 🙏",
  "Aaj Da Hukamnama 📜 Waheguru Ji 🙏"
  
  
  
  
];

const hukamBodies = [
  "Amrit Vele di mehar naal aaj da pavittar Hukamnama hazir hai.",
  "Apni rooh nu Guru Sahib Ji de bachan naal jagaayiye. 🌅",
  "ਅੰਮ੍ਰਿਤ ਵੇਲੇ ਦੀ ਮਿਹਰ ਨਾਲ ਅੱਜ ਦਾ ਪਵਿੱਤਰ ਹੁਕਮਨਾਮਾ ਹਾਜ਼ਰ ਹੈ।",
  "ਆਪਣੀ ਰੂਹ ਨੂੰ ਗੁਰੂ ਸਾਹਿਬ ਜੀ ਦੇ ਬਚਨ ਨਾਲ ਜਗਾਈਏ। 🌅",
  "ਅੰਮ੍ਰਿਤ ਵੇਲੇ ਦੀ ਰੋਸ਼ਨੀ ਵਿਚ ਗੁਰੂ ਸਾਹਿਬ ਦਾ ਪਵਿੱਤਰ ਹੁਕਮ ਆ ਗਿਆ ਹੈ। ਆਪਣੇ ਦਿਨ ਦੀ ਸ਼ੁਰੂਆਤ ਗੁਰੂ ਦੇ ਅਸ਼ੀਰਵਾਦ ਨਾਲ ਕਰੋ। 🌸🙏",
  "ਅੱਜ ਦਾ ਹੁਕਮ, ਰੂਹ ਦੀ ਰੋਟੀ ਬਣ ਕੇ ਆਇਆ ਹੈ। ਨਾਮ ਸਿਮਰਨ ਨਾਲ ਜੁੜੋ ਤੇ ਗੁਰੂ ਦੀ ਕਿਰਪਾ ਮਹਿਸੂਸ ਕਰੋ। 🌅🕊️",
  "ਸ਼੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ ਨੇ ਅੱਜ ਵੀ ਆਪਣਾ ਬਚਨ ਬਖ਼ਸ਼ਿਆ ਹੈ। ਵੇਖੋ, ਕਿ ਗੁਰੂ ਨੇ ਸਾਡੇ ਲਈ ਅੱਜ ਕੀ ਕਿਹਾ ਹੈ। 🙏✨",
  "ਅੰਮ੍ਰਿਤ ਵੇਲੇ ਦਾ ਸਮਾਂ ਵੱਖਰੀ ਬਰਕਤ ਲੈ ਕੇ ਆਇਆ ਹੈ। ਅੱਜ ਦਾ ਹੁਕਮ ਪੜ੍ਹੋ, ਤੇ ਆਪਣੇ ਦਿਨ ਨੂੰ ਗੁਰੂ ਨਾਲ ਜੋੜੋ। 🌞📜",
  "Aaj da hukam, rooh di roti ban ke aaya hai. Naam Simran naal judo te Guru di kirpa mehsoos karo. 🌅🕊️",
  "ਅੱਜ ਵੀ ਗੁਰੂ ਦੀ ਰਹਿਮਤ ਵਿਚ ਹੁਕਮ ਪ੍ਰਾਪਤ ਹੋਇਆ ਹੈ। ਗੁਰੂ ਦਾ ਬਚਨ ਜੀਵਨ ਵਿਚ ਸੁਖ, ਸਹਿਜ ਤੇ ਸ਼ਾਂਤੀ ਲੈ ਆਉਂਦਾ ਹੈ। 💛",
  "ਗੁਰੂ ਸਾਹਿਬ ਦਾ ਆਦੇਸ਼ – ਇਕ ਵਧੀਆ ਰਾਹ ਹੈ ਜੀਵਨ ਲਈ। ਇਸ ਹੁਕਮ ਵਿਚ ਹੈ ਸ਼ਾਂਤੀ, ਗਿਆਨ ਤੇ ਪਿਆਰ। 🙏📖",
  "ਹਰ ਸਵੇਰ ਦੀ ਸਭ ਤੋਂ ਵੱਡੀ ਦਾਤ – ਗੁਰੂ ਦਾ ਹੁਕਮਨਾਮਾ। ਅੱਜ ਦੀ ਕਿਰਪਾ ਨੂੰ ਨਾ ਗਵਾਓ। 🌼✨",
  "Aaj vi Guru di rehmat vich hukam prapt hoya hai. Guru da bachan jeevan vich sukh, sehaj te shanti le aunda hai. 💛",
  "ਵਾਹਿਗੁਰੂ ਜੀ ਨੇ ਅੱਜ ਵੀ ਆਪਣੇ ਸੇਵਕ ਲਈ ਸੰਦੇਸ਼ ਭੇਜਿਆ ਹੈ। ਆਓ, ਉਸ ਪਵਿੱਤਰ ਬਚਨ ਨੂੰ ਪੜ੍ਹੀਏ। 📜🌞",
  "ਇੱਕ ਵਾਰ ਗੁਰੂ ਦਾ ਬਚਨ ਸੁਣ ਲਓ – ਮਨ ਦੀਆਂ ਉਲਝਣਾਂ ਹੱਲ ਹੋ ਜਾਣ। ਅੱਜ ਦਾ ਹੁਕਮ ਜੀਵਨ ਨੂੰ ਰੋਸ਼ਨ ਕਰੇ। 🕯️",
  "Guru Sahib da aadesh – ik vadiya raah hai jeevan layi. Is hukam vich hai shanti, gyaan te pyar. 🙏📖",
  "Amrit Vele di roshni vich Guru Sahib da pavittar hukam aagaya hai. Apne din di shuruaat Guru de ashirwad naal karo. 🌸🙏",
  "Shri Guru Granth Sahib Ji ne aaj vi apna bachan bakshia hai. Vekho, ki Guru ne kehna hai Sade layi aaj. 🙏✨",
  "Amrit Vele da samah vakhri barkat leke aaya hai. Aaj da hukam padho, te apne din nu Guru de naal jodo. 🌞📜",
  "Har subah di sab ton vaddi daat – Guru da hukamnama. Ajj di kirpa nu miss na karo. 🌼✨",
  "Waheguru Ji ne aaj vi apne sevak layi sandesh bhejiya hai. Aao, us pavittar bachan nu padhiye. 📜🌞",
  "Ik vaar Guru da bachan sun lo – man diyaan uljhanaan hal ho jaan. Aaj da hukam jivan nu roshan kare. 🕯️"
];


// 🔔 Send Hukamnama Notification (secured)
app.post("/send-hukamnamaNew", authorizeWorker, async (req, res) => {
  const channelId = "bhg_hukamnama_channel"; // ✅ corrected channelId
  const title = hukamTitles[Math.floor(Math.random() * hukamTitles.length)];
  const body = hukamBodies[Math.floor(Math.random() * hukamBodies.length)];

  const message = {
    notification: { title, body },
    android: {
      notification: { channelId, sound: "default" } // ✅ fixed channelId
    },
    apns: {
      payload: {
        aps: { sound: "default" }
      }
    },
    data: {
      destination: "hukamnama" // ✅ fixed destination
    },
    topic: "hukamnama" // ✅ corrected topic
  };

  try {
    const response = await admin.messaging().send(message);
    res.status(200).json({ success: true, message: "Hukamnama sent", response });
  } catch (err) {
    console.error("FCM Error (hukamnama):", err);
    res.status(500).json({ success: false, error: err.message });
  }
});







// 🧠 path rehras sahib Messages
const pathTitles = [
  "🕯️ Blessed Evening – Rehras Sahib Awaits",
  "🌇 Rehras Sahib Ji – Evening Simran Time",
  "🕯️ ਸਿਮਰਨ ਦੀ ਸ਼ਾਮ – ਰਹਿਰਾਸ ਸਾਹਿਬ ਵਿੱਚ ਜੁੜੋ",
  "🪔 Time for Rehras Sahib Ji – Peaceful Vela",
  "🌆 Rehras Sahib Ji – Light Up Your Evening with Naam",
  "🛐 ਸ਼ਾਮ ਦੀ ਅਰਦਾਸ – ਰਹਿਰਾਸ ਸਾਹਿਬ ਜੀ ਦੀ ਬਾਣੀ",
  "🛐 Evening Ardas – Rehras Sahib Ji Di Bani",
  "🙏 ਰਹਿਰਾਸ ਸਾਹਿਬ ਜੀ – ਇੱਕ ਸ਼ਾਂਤੀ ਭਰੀ ਸ਼ਾਮ ਲਈ",
  "🙏 Rehras Sahib Ji – Ik Shanti Bhari Shaam Layi",
  "🕯️ Simran Di Shaam – Rehras Sahib Vich Judo",
  "🌙 Guru Di Roshni – Rehras Sahib Ji Da Samah",
    "🕯️ ਬਰਕਤ ਭਰੀ ਸ਼ਾਮ – ਰਹਿਰਾਸ ਸਾਹਿਬ ਜੀ ਉਡੀਕ ਰਹੇ ਨੇ",
  "🌇 ਰਹਿਰਾਸ ਸਾਹਿਬ ਜੀ – ਸ਼ਾਮ ਦਾ ਸਿਮਰਨ ਸਮਾਂ",
  "🪔 ਰਹਿਰਾਸ ਸਾਹਿਬ ਜੀ ਦਾ ਵੇਲਾ – ਸ਼ਾਂਤਮਈ ਸ਼ਾਮ",
  "🌆 ਰਹਿਰਾਸ ਸਾਹਿਬ ਜੀ – ਨਾਮ ਨਾਲ ਆਪਣੀ ਸ਼ਾਮ ਰੋਸ਼ਨ ਕਰੋ",
  "🌙 ਗੁਰੂ ਦੀ ਰੋਸ਼ਨੀ – ਰਹਿਰਾਸ ਸਾਹਿਬ ਜੀ ਦਾ ਸਮਾਂ"
];


const pathBodies = [
  "It’s time to connect with the Divine. Let Rehras Sahib Ji calm your soul. 🌆",
  "ਨਾਮ ਸਿਮਰਨ ਵਿਚ ਇੱਕ ਸ਼ਾਂਤ ਸ਼ਾਮ ਬਿਤਾਓ – ਰਹਿਰਾਸ ਸਾਹਿਬ ਜੀ ਦਾ ਸਮਾਂ ਆ ਗਿਆ। 🪔",
  "ਸ਼ਾਮ ਨੂੰ ਗੁਰੂ ਦੀ ਯਾਦ ਵਿਚ ਸਮਾਪਤ ਕਰੋ – ਰਹਿਰਾਸ ਸਾਹਿਬ ਜੀ ਤੋਂ ਵੱਡੀ ਦਾਤ ਕੋਈ ਨਹੀਂ। ✨",
  "Rehras Sahib Ji di bani naal shaam nu Guru de naal bitaiye. Shanti mehsoos karo. 🙏🪔",
  "Shaam da samah, Naam Simran da samah. Rehras Sahib Ji sun ke man nu chain milu. 🌇",
  "Guru Sahib Ji di roshni naal apni shaam roshan karo. Rehras Sahib Ji da paath kar lao. 🕯️",
  "Aaj di shaam nu pavittar banao. Rehras Sahib Ji vich Guru naal judo. 🌅",
  "ਗੁਰੂ ਸਾਹਿਬ ਜੀ ਦੀ ਰੋਸ਼ਨੀ ਨਾਲ ਆਪਣੀ ਸ਼ਾਮ ਰੋਸ਼ਨ ਕਰੋ। ਰਹਿਰਾਸ ਸਾਹਿਬ ਜੀ ਦਾ ਪਾਠ ਕਰ ਲਵੋ। 🕯️",
  "ਅੱਜ ਦੀ ਸ਼ਾਮ ਨੂੰ ਪਵਿੱਤਰ ਬਣਾ ਲਵੋ। ਰਹਿਰਾਸ ਸਾਹਿਬ ਜੀ ਵਿਚ ਗੁਰੂ ਨਾਲ ਜੁੜੋ। 🌅",
  "Shaam di mehar – Rehras Sahib Ji sun ke man di thakan door karo. 🌙",
  "Sukhmani da raah shaam vich Rehras Sahib Ji de shabad naal. 🛐",
  "Naam Simran vich ik shaant shaam bitao – Rehras Sahib Ji da samah aa gaya. 🪔",
  "ਸ਼ਾਮ ਦੀ ਮਿਹਰ – ਰਹਿਰਾਸ ਸਾਹਿਬ ਜੀ ਸੁਣ ਕੇ ਮਨ ਦੀ ਥਕਾਵਟ ਦੂਰ ਕਰੋ। 🌙",
  "ਸੁਖਮਨੀ ਦਾ ਰਾਹ ਸ਼ਾਮ ਵਿਚ ਰਹਿਰਾਸ ਸਾਹਿਬ ਜੀ ਦੇ ਸ਼ਬਦ ਨਾਲ। 🛐",
  "Shaam nu Guru di yaad vich samaapti karo – Rehras Sahib Ji ton vaddi daat koi nahi. ✨"
];



// 🔔 Send Path Notification (secured)
app.post("/send-pathNew", authorizeWorker, async (req, res) => {
  const channelId = "bhg_path_channel"; // ✅ corrected channelId
  const title = pathTitles[Math.floor(Math.random() * pathTitles.length)];
  const body = pathBodies[Math.floor(Math.random() * pathBodies.length)];

  const message = {
    notification: { title, body },
    android: {
      notification: { channelId, sound: "default" } // ✅ fixed channelId
    },
    apns: {
      payload: {
        aps: { sound: "default" }
      }
    },
    data: {
      destination: "path" // ✅ fixed destination
    },
    topic: "path" // ✅ corrected topic
  };

  try {
    const response = await admin.messaging().send(message);
    res.status(200).json({ success: true, message: "Path sent", response });
  } catch (err) {
    console.error("FCM Error (path):", err);
    res.status(500).json({ success: false, error: err.message });
  }
});







// 🧠 Night Path Messages (Kirtan Sohila Sahib)
const pathNightTitles = [
  "🌙 Sohila Sahib – Peaceful Night Prayer",
  "🌙 Kirtan Sohila – End Your Day with Simran",
   "🌙 ਸੋਹਿਲਾ ਸਾਹਿਬ – ਰਾਤ ਦੀ ਸ਼ਾਂਤੀਮਈ ਅਰਦਾਸ",
  "🌙 ਕੀਰਤਨ ਸੋਹਿਲਾ – ਦਿਨ ਦੀ ਸਮਾਪਤੀ ਸਿਮਰਨ ਨਾਲ",
  "🌌 ਰਾਤ ਦੀ ਰਹਿਮਤ – ਸੋਹਿਲਾ ਸਾਹਿਬ ਹਾਜ਼ਿਰ ਹੈ",
  "🕯️ Kirtan Sohila Sahib Ji – Soothing Shabad for Sleep",
  "🕯️ ਕੀਰਤਨ ਸੋਹਿਲਾ ਸਾਹਿਬ ਜੀ – ਨੀਂਦ ਲਈ ਸੁਹਾਵਣੇ ਸ਼ਬਦ",
  "🌌 Nighttime Blessing – Sohila Sahib awaits"
];

const pathNightBodies = [
  "Sohila Sahib di bani naal raat nu. Guru Sahib de shabad sun ke sukoon pao. 🌙🙏",
  "ਸੋਹਿਲਾ ਸਾਹਿਬ ਦੀ ਬਾਣੀ ਨਾਲ ਰਾਤ ਨੂੰ ਚੈਨ ਮਿਲਦਾ ਹੈ। ਗੁਰੂ ਸਾਹਿਬ ਦੇ ਸ਼ਬਦ ਸੁਣੋ ਤੇ ਸੁਕੂਨ ਪਾਓ। 🌙🙏",
  "ਸੋਹਿਲਾ ਸਾਹਿਬ – ਗੁਰੂ ਦੇ ਨਾਲ ਦਿਨ ਦੀ ਸ਼ਾਂਤ ਸਮਾਪਤੀ। ਸ਼ਾਂਤੀ ਤੁਹਾਨੂੰ ਘੇਰ ਲਵੇ। 🛏️",
  "ਕੀਰਤਨ ਸੋਹਿਲਾ ਸਾਹਿਬ – ਅੱਜ ਦੀ ਰਾਤ ਗੁਰੂ ਦੇ ਚਰਣਾ ਵਿਚ ਸਮਰਪਿਤ ਕਰੋ। 🛐",
  "Sohila Sahib – Guru de naal din di samapti. Let peace surround you. 🛏️",
  "Before you sleep, connect with the Divine. Sohila Sahib will bring calm to your mind. 🌌🕯️",
  "ਸੌਣ ਤੋਂ ਪਹਿਲਾਂ ਗੁਰੂ ਨਾਲ ਜੁੜੋ। ਸੋਹਿਲਾ ਸਾਹਿਬ ਮਨ ਨੂੰ ਠੰਡਕ ਦੇਵੇਗਾ। 🌌🕯️",
  "Kirtan Sohila Sahib – Aaj di raat Guru de charna vich samaapti karo. 🛐"
];




// 🔔 Send Night Path Notification (secured)
app.post("/send-night-pathNew", authorizeWorker, async (req, res) => {
  const channelId = "bhg_path_night_channel"; // ✅ corrected channelId
 const title = pathNightTitles[Math.floor(Math.random() * pathNightTitles.length)];
  const body = pathNightBodies[Math.floor(Math.random() * pathNightBodies.length)];

  const message = {
    notification: { title, body },
    android: {
      notification: { channelId, sound: "default" } // ✅ fixed channelId
    },
    apns: {
      payload: {
        aps: { sound: "default" }
      }
    },
    data: {
      destination: "pathnight" // ✅ fixed destination
    },
    topic: "path-night" // ✅ corrected topic
  };

  try {
    const response = await admin.messaging().send(message);
    res.status(200).json({ success: true, message: "Night Path sent", response });
  } catch (err) {
    console.error("FCM Error (night-path):", err);
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




// 🔔 Send Hukamnama Notification To Specific Device Token (secured)
app.post("/send-hukamnama-token", authorizeWorker, async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, error: "Missing token" });
  }

  const title = hukamTitles[Math.floor(Math.random() * hukamTitles.length)];
  const body = hukamBodies[Math.floor(Math.random() * hukamBodies.length)];

  const message = {
    token,
    notification: { title, body },
    android: {
      notification: {
        sound: "default",
        channelId: "bhg_hukamnama_channel", 
      }
    },
    apns: {
      payload: {
        aps: { sound: "default" }
      }
    },
    data: {
      destination: "hukamnama"
    }
  };

  try {
    const response = await admin.messaging().send(message);
    res.status(200).json({ success: true, message: "Hukamnama sent to token", response });
  } catch (err) {
    console.error("FCM Error (hukamnama token):", err);
    res.status(500).json({ success: false, error: err.message });
  }
});





// ✅ Start Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
