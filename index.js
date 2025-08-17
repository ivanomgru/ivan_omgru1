require('dotenv').config();
const express = require('express');
const path = require('path');
const fetch = require('node-fetch'); // حتما node-fetch نصب باشه
const app = express();
const PORT = process.env.PORT || 3000;

// مسیر فولدر public
app.use(express.static(path.join(__dirname, 'public')));

// نمایش index.html روی /
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// مسیر تست سرور
app.get('/api/test', (req, res) => {
    res.json({ message: "سرور Express شما آماده است!" });
});

// کش ساده در حافظه (Memory cache)
let cache = {};

// مسیر جدید: دریافت همزمان اینستاگرام و یوتیوب
app.get('/api/media', async (req, res) => {
    try {
        // چک کش
        const now = Date.now();
        if (cache.data && now < cache.expires) {
            return res.json(cache.data);
        }

        const [instaRes, ytRes] = await Promise.all([
            fetch(`https://graph.instagram.com/${process.env.INSTAGRAM_USER_ID}/media?fields=id,caption,media_url,permalink&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}&limit=6`),
            fetch(`https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API_KEY}&channelId=${process.env.YOUTUBE_CHANNEL_ID}&part=snippet&order=date&maxResults=6`)
        ]);

        const instaData = await instaRes.json().catch(() => []);
        const ytData = await ytRes.json().catch(() => []);

        const responseData = {
            instagram: instaData.data || [],
            youtube: ytData.items || []
        };

        // ذخیره در کش 10 دقیقه
        cache = {
            data: responseData,
            expires: Date.now() + 10 * 60 * 1000
        };

        res.json(responseData);

    } catch (err) {
        res.status(500).json({ error: "خطا در دریافت داده‌ها", details: err.message });
    }
});

// اجرا روی پورت مشخص
app.listen(PORT, () => {
    console.log(`سرور روی http://localhost:${PORT} اجرا شد`);
});
