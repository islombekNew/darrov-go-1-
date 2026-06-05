const fetch = require('node-fetch');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT = process.env.TELEGRAM_ADMIN_CHAT_ID;

// OTP kodni Telegram orqali yuborish
// Admin chatiga ham xabar boradi (monitoring uchun)
async function sendOTP(phone, code) {
  if (!BOT_TOKEN) {
    console.log(`[OTP] +${phone}: ${code}`);
    return true;
  }
  try {
    // Admin chatiga xabar
    if (ADMIN_CHAT) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT,
          text: `🔐 OTP\nTelefon: +${phone}\nKod: <b>${code}</b>\nVaqt: ${new Date().toLocaleString('uz-UZ')}`,
          parse_mode: 'HTML',
        }),
      });
    }
    return true;
  } catch (err) {
    console.error('Telegram xatosi:', err.message);
    return false;
  }
}

// Buyurtma haqida restoran egasiga xabar
async function notifyRestaurant(chatId, order) {
  if (!BOT_TOKEN || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `🍽 Yangi buyurtma #${order.orderNumber}\n\n${order.items}\n\nJami: ${order.total} so'm\nManzil: ${order.address}`,
      }),
    });
  } catch {}
}

module.exports = { sendOTP, notifyRestaurant };
