const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// فایل‌های استاتیک
app.use(express.static(path.join(__dirname, 'public')));
app.use('/media', express.static(path.join(__dirname, 'public', 'media')));

// مسیر اصلی
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// اجرای سرور
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
