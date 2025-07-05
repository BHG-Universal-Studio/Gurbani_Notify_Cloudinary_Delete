const express = require("express");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Use secrets from environment (configured in Render)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ✅ Ping endpoint to wake up server
app.get("/ping", (req, res) => {
  res.status(200).json({ success: true, message: "pong", timestamp: Date.now() });
});

// ✅ Delete from Cloudinary
app.post("/delete", async (req, res) => {
  const publicId = req.body.public_id;
  if (!publicId) {
    return res.status(400).json({ success: false, message: "Missing public_id" });
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return res.json({ success: true, result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Start server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Cloudinary delete server running on port ${port}`));
