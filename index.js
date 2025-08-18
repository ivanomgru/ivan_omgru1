const express = require('express');
const fetch = require('node-fetch'); // نسخه 2
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// 📦 ماژول‌های بهینه‌سازی برای Render Free
const compression = require('compression'); // فشرده‌سازی پاسخ‌ها
const morgan = require('morgan');           // لاگ سبک
const cors = require('cors');               // حل مشکل CORS

dotenv.config();

const app = express();

// ===== Middleware =====
app.use(express.json());
app.use(cors());
app.use(compression());
app.use(morgan('tiny'));

// ===== کش ساده داخلی =====
let cache = { data: null, time: 0 };
const CACHE_TTL = 60000; // یک دقیقه

// تست سرور
app.get('/', (req, res) => {
    res.send('🚀 Server is running on Render Free!');
});

// تست bcrypt امن
app.post('/api/hash', (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    try {
        const saltRounds = 10;
        const hashed = bcrypt.hashSync(password, saltRounds);
        res.json({ hashed });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// تست fetch با کش داخلی
app.get('/api/fetch', async (req, res) => {
    try {
        // استفاده از کش اگر هنوز معتبر است
        if (cache.data && Date.now() - cache.time < CACHE_TTL) {
            return res.json(cache.data);
        }

        const response = await fetch('https://api.github.com/');
        const data = await response.json();

        // ذخیره در کش
        cache = { data, time: Date.now() };

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// پورت Render Free
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 سرور روی پورت ${PORT} اجرا شد`);
});
