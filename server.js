const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// *** تنظیمات پیش‌فرض (این‌ها را می‌توان از پنل ادمین تغییر داد) ***
let SYSTEM_CONFIG = {
    displayNumber: "12.12.12.32", // عددی که رفیق می‌بیند
    friendPassword: "12345"       // رمزی که به رفیق می‌دهی
};

// 1. سرویس فایل‌های HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client.html')); // صفحه پیش‌فرض: صفحه رفیق
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html')); // صفحه ادمین
});

// 2. ارتباط با Socket.io
io.on('connection', (socket) => {
  console.log('یک کاربر متصل شد:', socket.id);

  // وقتی ادمین درخواست تغییر عدد یا رمز داد
  socket.on('admin_update', (data) => {
    if (data.type === 'update_number') {
      SYSTEM_CONFIG.displayNumber = data.value;
      console.log('عدد نمایشی تغییر کرد به:', SYSTEM_CONFIG.displayNumber);
      // به همه اطلاع بده که عدد عوض شده (اختیاری)
      io.emit('config_changed', { type: 'number', value: SYSTEM_CONFIG.displayNumber });
    }
    
    if (data.type === 'update_password') {
      SYSTEM_CONFIG.friendPassword = data.value;
      console.log('رمز رفیق تغییر کرد به:', SYSTEM_CONFIG.friendPassword);
      io.emit('config_changed', { type: 'password', value: '***' });
    }
  });

  // وقتی رفیق رمز را وارد کرد
  socket.on('friend_login', (data) => {
    // چک کردن رمز
    if (data.password === SYSTEM_CONFIG.friendPassword) {
      // رمز درست است -> ارسال عدد نمایشی
      socket.emit('login_success', {
        code: SYSTEM_CONFIG.displayNumber
      });
    } else {
      // رمز غلط است -> ارسال پیام خطا
      socket.emit('login_fail', {
        message: "رمز اشتباه است!"
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('کاربر قطع شد');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`سرور امن روی پورت ${PORT} اجرا شد`);
});
