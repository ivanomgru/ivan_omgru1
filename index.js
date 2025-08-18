require('dotenv').config();
const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || "secret123";

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// مسیر اصلی سایت
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// مسیر تست سرور
app.get('/api/test', (req, res) => {
    res.json({ message: "سرور Express شما آماده است!" });
});

// کاربر ادمین
const adminUser = {
    username: process.env.ADMIN_USER || "admin",
    passwordHash: bcrypt.hashSync(process.env.ADMIN_PASS || "password123", 8)
};

// Middleware بررسی توکن
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'توکن موجود نیست' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'توکن نامعتبر است' });
        req.user = decoded;
        next();
    });
}

// مسیر ورود
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username !== adminUser.username || !bcrypt.compareSync(password, adminUser.passwordHash)) {
        return res.status(401).json({ message: 'نام کاربری یا رمز اشتباه است' });
    }
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '2h' });
    res.json({ token });
});

// مسیر پنل مدیریت (admin.html داخل public)
app.get('/api/admin-panel', verifyToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// کش ساده
let cache = {};

// مسیر دریافت اینستاگرام و یوتیوب
app.get('/api/media', async (req, res) => {
    try {
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

        cache = {
            data: responseData,
            expires: Date.now() + 10 * 60 * 1000
        };

        res.json(responseData);

    } catch (err) {
        res.status(500).json({ error: "خطا در دریافت داده‌ها", details: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`سرور روی http://localhost:${PORT} اجرا شد`);
});
