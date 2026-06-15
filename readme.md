📌 Bước 1: Cài đặt thư viện (Dependencies)
Chạy lệnh sau để cài đặt Sequelize, Driver PostgreSQL và CLI:

Bash

# Cài đặt lõi Sequelize và Driver Postgres

npm install --save sequelize pg pg-hstore

# Cài đặt CLI (Công cụ dòng lệnh) để quản lý Migration/Seed

npm install --save-dev sequelize-cli

🏗 Bước 2: Khởi tạo Project

npx sequelize-cli init

Lưu ý: Sau khi khởi tạo, hãy vào file config/config.json để cấu hình thông tin Database. Hãy đảm bảo bạn đã tạo tên Database trống trong PostgreSQL trước.

Bước 3: Các câu lệnh quản lý Database (CLI)

-- npx sequelize-cli db:migrate : Chạy các file migration để lưu/cập nhật bảng vào Database.
--npx sequelize-cli db:migrate:undo : Hoàn tác (xóa) thao tác migration gần nhất.

2. Seeder (Quản lý dữ liệu mẫu) : Chạy tất cả file seeder để đổ dữ liệu vào Database.
   npx sequelize-cli db:seed:all
   npx sequelize-cli seed:generate --name [tên_seeder] : Tạo mới một file seeder để định nghĩa dữ liệu mẫu.

Bước 4: Truy vấn dữ liệu (Query):
Cách 1: Sử dụng SQL Thuần (Raw Query)npx sequelize-cli db:migrate:undo --name 20260603090000-add-is-active.js
const { QueryTypes } = require('sequelize');

const users = await sequelize.query(
"SELECT \* FROM Users WHERE status = 'ACTIVE'",
{ type: QueryTypes.SELECT }
);

Cách 2: đã làm mẫu ở service login
const users = await User.findAll({
where: { status: 'ACTIVE' }
});
