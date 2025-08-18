// index.js
const express = require('express');
const fetch = require('node-fetch'); // نسخه 2
const app = express();

// Middleware سبک
app.use(express.json());

// روت اصلی
app.get('/', (req, res) => {
  res.send('🎉 سرور ivan_omgru1 فعال است!');
});

// روت مانیتورینگ سبک
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// نمونه fetch با تایم‌اوت کوتاه
app.get('/api/test', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5 ثانیه
    const response = await fetch('https://jsonplaceholder.typicode.com/todos/1', { signal: controller.signal });
    clearTimeout(timeout);
    const data = await response.json();
    res.json({ success: true, data });
  } catch (err) {
    console.error('Fetch error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// مدیریت ساده 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// مدیریت خطای داخلی
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// پورت از Render یا fallback 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 سرور روی پورت ${PORT} اجرا شد`));
