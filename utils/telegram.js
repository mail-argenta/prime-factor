const axios = require("axios");

async function sendTelegramMessage(htmlText) {
  const token = process.env.TELEGRAM_BOT_TOKEN || "8574247455:AAH1jO-_PWjT8lc5eO_D1IWfoew6CHb16sw";
  const chatId = process.env.TELEGRAM_CHAT_ID || "-4991446206";

  if (!token || !chatId) {
    console.log("⚠️ Telegram not configured — skipping send.");
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const res = await axios({
      method: "POST",
      url,
      headers: { "Content-Type": "application/json" },
      data: {
        chat_id: chatId,
        text: htmlText,
        parse_mode: "HTML",
      },
    });

    if (res.data && res.data.ok) {
      console.log("✅ Telegram message sent successfully");
    } else {
      console.log("⚠️ Telegram response:", res.data);
    }
  } catch (err) {
    console.error("❌ Telegram send error:", err.response?.data || err.message);
  }
}

module.exports = { sendTelegramMessage };
