const express = require('express');
const admin = require('firebase-admin');
const app = express();
app.use(express.json());

// ✅ Load service account from env
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// ✅ Ping check
app.get('/ping', (req, res) => {
  res.json({ message: 'pong', time: Date.now() });
});

// ✅ Send test FCM notification
app.post('/send-test-notification', async (req, res) => {
  const token = 'e14qjEkFSeewRknw56X0oQ:APA91bHVmGLzcWHfvxAqrgjncr03IWeaRBZAwyg1RBS5Ex5qZLEeRyxvHCI34AxWVndiZuXMTUvFWeRPoyYqz0bpiDMyvuelfWkJN0mecjvkwzgteUizr9c';

  const message = {
    notification: {
      title: 'Test Notification',
      body: '🚀 FCM from Render is working!',
    },
    token: token,
  };

  try {
    const response = await admin.messaging().send(message);
    res.json({ success: true, response });
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Render port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));
