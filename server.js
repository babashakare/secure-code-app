const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// *** تنظیمات پیش‌فرض ***
let SYSTEM_CONFIG = {
    displayNumber: "12.12.12.32", 
    friendPassword: "12345"       
};

// 1. سرویس فایل‌های HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// 2. ارتباط با Socket.io
io.on('connection', (socket) => {
  console.log('کاربر متصل شد:', socket.id);

  socket.on('admin_update', (data) => {
    if (data.type === 'update_number') {
      SYSTEM_CONFIG.displayNumber = data.value;
      io.emit('config_changed', { type: 'number', value: SYSTEM_CONFIG.displayNumber });
    }
    if (data.type === 'update_password') {
      SYSTEM_CONFIG.friendPassword = data.value;
      io.emit('config_changed', { type: 'password', value: '***' });
    }
  });

  socket.on('friend_login', (data) => {
    if (data.password === SYSTEM_CONFIG.friendPassword) {
      socket.emit('login_success', { code: SYSTEM_CONFIG.displayNumber });
    } else {
      socket.emit('login_fail', { message: "رمز اشتباه است!" });
    }
  });

  socket.on('disconnect', () => {
    console.log('کاربر قطع شد');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`سرور روی پورت ${PORT} اجرا شد`);
});
