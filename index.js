const express = require('express');
const fetch = require('node-fetch'); // نسخه 2
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

// تست سرور
app.get('/', (req, res) => {
    res.send('Server is running on Render Free!');
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

// تست fetch
app.get('/api/fetch', async (req, res) => {
    try {
        const response = await fetch('https://api.github.com/');
        const data = await response.json();
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
