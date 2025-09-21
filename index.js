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


const hukamTitles = [
  "📜 Hukamnama Sahib Ji – Amrit Vele di shuruaat",
  "🌅 Hukamnama Sahib Ji – Aaj da bachan Sri Guru Granth Sahib Ji ton",
  "🙏 Hukamnama Sahib Ji – Waheguru Ji di kirpa naal",
  "🌟 Aaj da Hukamnama Sahib Ji – Satguru di roshni vich",
  "🌞 Hukamnama Sahib Ji – Din di shuruaat Guru de bachan naal",
  "📿 Aaj da pavittar Hukamnama Sahib Ji prapt hoya hai",
  "🙌 Hukamnama Sahib Ji – Aaj vi Guru Ji ne kirpa kiti",
  "🌸 Aaj da Hukamnama Sahib Ji – Rooh di shanti layi",
  "💫 Amrit Vele da Hukamnama Sahib Ji – Satnam Waheguru",
  "🕊️ Hukamnama Sahib Ji – Waheguru Ji da aadesh aaya hai",
  "🌅 Hukamnama Sahib Ji – Nayi subah, naye ashirwaad",
  "📖 Aaj da Hukamnama Sahib Ji – Sri Guru Granth Sahib Ji di bani",
  "✨ Hukamnama Sahib Ji – Aaj da sandesh Satguru ton",
  "🌅 Amrit Vele da Hukamnama Sahib Ji",
  "💫 Aaj da Hukamnama - Waheguru Ji da aadesh",
  "🌸 Aaj da pavittar Hukamnama hazir hai",
  "🙌 Guru Sahib di kirpa naal hukumnama prapt hoya hai",
  "🌞 Hukamnama Amrit Vela – Guru da bachan mil gaya ji",
  "🌅 Hukamnama Sahib – Nayi subah, naye ashirwaad",
  "💖 Sehaj mein vaso – Aaj da hukamnama aa gaya ji",
  "🌸 Satguru da hukumnama – Amrit Vele di mehar",
  "🌞 Hukamnama Sahib – Din di shuruaat Guru de bachan de naal",
  "🙏 Waheguru Ji di reham – Aaj da hukumnama suniye",
  "🌸 Satnam Waheguru Ji – Aaj da hukumnama mila hai",
  "🌟 Hukamnama Sahib Ji – Guru Sahiban Ji di roshni",
  "🙏 Hukamnama Sahib Ji - Aaj bhi Guru Sahib Ji ne kirpa kiti",
  "🌅 Nayi subah, naye hukam – Hukamnama suniye",
  "🌞 Hukamnama Sahib Ji - Guru de bachan naal din di shuruaat kro",
  "🙏 Waheguru Ji di rehmat – Aaj da hukamnama suniye",
  "🌸 Rooh di roti – Hukamnama Amrit Vele da",
  "📜 Waheguru Ji 🙏 Aaj da Hukamnama Sahib",
  "🙏 Aaj da Hukamnama Sahib Ji – Waheguru di mehar naal",
  "🌸 Satguru da aadesh – Hukamnama Sahib Ji tayar hai",
  "🌞 Hukamnama Sahib Ji – Shuruaat karo Guru de naal",
  "🌟 Hukamnama Sahib Ji – Aaj da ashirwad suno",
  "📜 Aaj da Hukamnama Sahib Ji – Roohani marg di roshni",
  "🧡 Hukamnama Sahib Ji – Satnam Waheguru Ji da updesh"
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
  "Sri Guru Granth Sahib Ji ne aaj vi apna bachan bakshia hai. Vekho, ki Guru ne keha hai Sade layi aaj. 🙏✨",
  "Amrit Vele da samah vakhri barkat leke aaya hai. Aaj da hukam padho, te apne din nu Guru de naal jodo. 🌞📜",
  "Har subah di sab ton vaddi daat – Guru da hukamnama. Ajj di kirpa nu miss na karo. 🌼✨",
  "Waheguru Ji ne aaj vi apne sevak layi sandesh bhejiya hai. Aao, us pavittar bachan nu padhiye. 📜🌞",
  "Ik vaar Guru da bachan sun lo – man diyaan uljhanaan hal ho jaan. Aaj da hukam jivan nu roshan kare. 🕯️"
];


// 🔔 Send Hukamnama Notification (secured)
app.post("/send-hukamnama", authorizeWorker, async (req, res) => {
  const channelId = "bhg_hukamnama_channel"; 
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
    topic: "daily-hukamnama" 
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
  "🪔 Time for Rehras Sahib Ji – Peaceful Time",
  "🌆 Rehras Sahib Ji – Light Up Your Evening with Naam",
  "🛐 Shaam Di Ardaas – Rehras Sahib Ji Di Baani",
  "🛐 Evening Ardas – Rehras Sahib Ji Di Bani",
  "🙏 Rehras Sahib Ji – Ik Shanti Bhari Shaam Layi",
  "🕯️ Simran Di Shaam – Rehras Sahib Ji Naal Judo",
  "🌙 Guru Di Roshni – Rehras Sahib Ji Da Samah",
  "🌇 Rehras Sahib Ji – Shaam Da Simran Samah",
  "🪔 Rehras Sahib Ji Da Vela – Shaantmai Shaam",
  "🌆 Rehras Sahib Ji – Naam Naal Apni Shaam Roshan Karo",
  "🌙 Guru Di Roshni – Rehras Sahib Ji Da Samah"
];


const pathBodies = [
  "It’s time to connect with the Divine. Let Rehras Sahib Ji calm your soul. 🌆",
  "Naam Simran vich ik shaant shaam bitao – Rehras Sahib Ji da samah aa gaya. 🪔",
  "Shaam nu Guru di yaad vich samaapti karo – Rehras Sahib Ji ton vaddi daat koi nahi. ✨",
  "Rehras Sahib Ji di bani naal shaam nu Guru de naal bitaiye. Shanti mehsoos karo. 🙏🪔",
  "Shaam da samah, Naam Simran da samah. Rehras Sahib Ji sun ke maan nu shanti milu. 🌇",
  "Guru Sahib Ji di roshni naal apni shaam roshan karo. Rehras Sahib Ji da paath kar lao. 🕯️",
  "Aaj di shaam nu pavittar banao. Rehras Sahib Ji naal Guru naal judo. 🌅",
  "Guru Sahib Ji di roshni naal apni shaam roshan karo. Rehras Sahib Ji da paath kar lo. 🕯️",
  "Aaj di shaam nu pavittar bana lo. Rehras Sahib Ji vich Guru naal judo. 🌅",
  "Shaam di mehar – Rehras Sahib Ji sun ke maan di thakan door karo. 🌙",
  "Sukhmani da raah shaam vich Rehras Sahib Ji de shabad naal. 🛐",
  "Naam Simran vich ik shaant shaam bitao – Rehras Sahib Ji da samah aa gaya. 🪔",
  "Shaam di mehar – Rehras Sahib Ji sun ke maan di thakavat door karo. 🌙",
  "Sukhmani da raah shaam vich Rehras Sahib Ji de shabad naal. 🛐",
  "Shaam nu Guru di yaad vich samaapti karo – Rehras Sahib Ji ton vaddi daat koi nahi. ✨"
];



// 🔔 Send Path Notification (secured)
app.post("/send-path", authorizeWorker, async (req, res) => {
  const channelId = "bhg_path_channel"; 
  const title = pathTitles[Math.floor(Math.random() * pathTitles.length)];
  const body = pathBodies[Math.floor(Math.random() * pathBodies.length)];

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
  destination: "pathradio",
  playSpecial: "true"
},
    topic: "daily-path" 
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
  "🌙 Sohila Sahib – Raat Di Shaantimayi Ardaas",
  "🌙 Kirtan Sohila – Din Di Samaapti Simran Naal",
  "🌌 Raat Di Rehmat – Sohila Sahib Haazir Hai",
  "🕯️ Kirtan Sohila Sahib Ji – Soothing Shabad for Sleep",
  "🕯️ Kirtan Sohila Sahib Ji – Neend Layi Suhaavne Shabad",
  "🌌 Nighttime Blessing – Sohila Sahib awaits"
];



const pathNightBodies = [
  "Sohila Sahib di bani naal raat nu. Guru Sahib de shabad sun ke sukoon pao. 🌙🙏",
  "Sohila Sahib di bani naal raat nu chain milda hai. Guru Sahib de shabad suno te sukoon pao. 🌙🙏",
  "Sohila Sahib – Guru de naal din di shaant samaapti. Shaanti tuhanu gher leve. 🛏️",
  "Kirtan Sohila Sahib – Aaj di raat Guru de charna vich samarpat karo. 🛐",
  "Sohila Sahib – Guru de naal din di samapti. Let peace surround you. 🛏️",
  "Before you sleep, connect with the Divine. Sohila Sahib will bring calm to your mind. 🌌🕯️",
  "Saun ton pehla Guru naal judo. Sohila Sahib maan nu shaanti milu. 🌌🕯️"
];




// 🔔 Send Night Path Notification (secured)
app.post("/send-night-path", authorizeWorker, async (req, res) => {
  const channelId = "bhg_path_night_channel"; 
 const title = pathNightTitles[Math.floor(Math.random() * pathNightTitles.length)];
  const body = pathNightBodies[Math.floor(Math.random() * pathNightBodies.length)];

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
      destination: "path"
    },
    topic: "daily-path-night" 
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
app.post("/send-test-notification-with-token", authorizeWorker, async (req, res) => {
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
    res.status(200).json({ success: true, message: "Test Notification Sent", response });
  } catch (err) {
    console.error("FCM Error (token):", err);
    res.status(500).json({ success: false, error: err.message });
  }
});




// 🔔 Send Hukamnama Notification To Specific Device Token (secured)
app.post("/send-test-notification-token-with-destination", authorizeWorker, async (req, res) => {
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
        channelId: "bhg_general_channel", 
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
    res.status(200).json({ success: true, message: "sent to token", response });
  } catch (err) {
    console.error("FCM Error (hukamnama token):", err);
    res.status(500).json({ success: false, error: err.message });
  }
});







const adminNotificationTitle = [
  "📝 New Post Received",
  "📝 New Post Submitted"
];

const adminNotificationBody = [
  "A user submitted a new post for review.",
  "A user submitted a new post for review checking."
];




// post admin Notification

app.post("/notify-admin-post", async (req, res) => {
  const channelId = "bhg_admin_channel"; 
  const title = adminNotificationTitle[Math.floor(Math.random() * adminNotificationTitle.length)];
  const body = adminNotificationBody[Math.floor(Math.random() * adminNotificationBody.length)];

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
      destination: "admin"
    },
    topic: "admin-app" 
  };

  try {
    const response = await admin.messaging().send(message);
    res.status(200).json({ success: true, message: "Post Notification sent", response });
  } catch (err) {
    console.error("FCM Error (notification):", err);
    res.status(500).json({ success: false, error: err.message });
  }
});





// ✅ Start Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
