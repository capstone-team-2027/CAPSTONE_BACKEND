const express = require("express");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const passport = require("passport");
const cors = require("cors");
const configureGoogle = require("../CAPSTONE_BACKEND/src/config/google.config");

const whitelist = [
  "http://localhost:3000",
  "http://localhost:5173",
  'http://192.168.1.18:5173',
  "https://agm-garage.id.vn",
  "https://www.agm-garage.id.vn"
];
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

configureGoogle(passport);
app.use(passport.initialize());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
global._io = io;
const ROUTES = require("./src/router/registry.routes");
require("./src/jobs/pricingRule.job");

ROUTES.forEach((route) => {
  if (route.middlewares && route.middlewares.length > 0) {
    app.use(route.prefix, ...route.middlewares, route.router);
  } else {
    app.use(route.prefix, route.router);
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Example app listening on port ${port}`);
});
