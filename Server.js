const express = require("express");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const passport = require("passport");
const configureGoogle = require("./src/config/google.config");

configureGoogle(passport);
app.use(passport.initialize());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var cors = require("cors");
// cấu hình socket
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
// biến global
global._io = io; // gọi biến toàn cục

io.on('connection', (socket) => {
  // Lắng nghe sự kiện Khách hàng yêu cầu gọi Video (ZegoCloud)
  socket.on('request-video-call', (data) => {
    // Phát (Broadcast) thông báo cho các Lễ tân đang online
    socket.broadcast.emit('incoming-video-call', data);
  });

  // Khi một Lễ tân bấm "Nghe máy"
  socket.on('accept-video-call', (data) => {
    // Báo cho toàn bộ các Lễ tân khác để họ tự động tắt chuông báo
    socket.broadcast.emit('call-answered', data);
  });

  // Khi một bên kết thúc cuộc gọi
  socket.on('end-video-call', (data) => {
    socket.broadcast.emit('end-video-call', data);
  });
});

const ROUTES = require("./src/router/registry.routes");
const whitelist = ["http://localhost:3000", "http://localhost:5173"];
require("./src/jobs/pricingRule.job");
require("./src/jobs/shift.job");
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || whitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
// cách router để có thể hoạt động được
ROUTES.forEach((route) => {
  if (route.middlewares && route.middlewares.length > 0) {
    app.use(route.prefix, ...route.middlewares, route.router);
  } else {
    app.use(route.prefix, route.router);
  }
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
