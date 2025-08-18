require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// مسیر صحیح به فولدر public
app.use(express.static(path.join(__dirname, 'public')));

// نمایش index.html روی /
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// مسیر تست سرور
app.get('/api/test', (req, res) => {
    res.json({ message: "سرور Express شما آماده است!" });
});

// اینستاگرام API
app.get('/api/instagram', async (req, res) => {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN;
    const userId = process.env.INSTAGRAM_USER_ID;
    try {
        const response = await fetch(`https://graph.instagram.com/${userId}/media?fields=id,caption,media_url,permalink&access_token=${token}&limit=6`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "خطا در دریافت داده‌های اینستاگرام", details: err.message });
    }
});

// یوتیوب API
app.get('/api/youtube', async (req, res) => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const channelId = process.env.YOUTUBE_CHANNEL_ID;
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet&order=date&maxResults=6`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "خطا در دریافت داده‌های یوتیوب", details: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`سرور روی http://localhost:${PORT} اجرا شد`);
});
