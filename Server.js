const express = require("express");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const passport = require("passport");
const configureGoogle = require("../CAPSTONE_BACKEND/src/config/google.config");

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
const ROUTES = require("./src/router/registry.routes");
const whitelist = ["http://localhost:3000", "http://localhost:5173"];
require("./src/jobs/pricingRule.job");
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
