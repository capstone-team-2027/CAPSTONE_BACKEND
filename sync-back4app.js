// Bước 1: Đảm bảo đã chạy: npm install node-fetch@2
const fetch = require('node-fetch');
const { Op } = require('sequelize');
const { Vehicle_Makes, Vehicle_Models } = require('./models');

const APP_ID = 'hlhoNKjOvEhqzcVAJ1lxjicJLZNVv36GdbboZj3Z';
const MASTER_KEY = 'SNMJJF0CZZhTPhLDIqGhTlUNV9r60M2Z5spyWfXW';

// Hàm helper để dừng một chút thời gian
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Hàm gọi API với cơ chế tự động thử lại (Retry) khi gặp lỗi kết nối hoặc JSON lỗi
async function fetchWithRetry(url, options, maxRetries = 3, delayMs = 3000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`HTTP ${response.status}: ${text}`);
            }
            // Parse JSON, nếu lỗi (như Unexpected end of JSON input) sẽ tự động kích hoạt catch
            const data = await response.json();
            return data;
        } catch (error) {
            console.warn(`⚠️ Lần thử ${attempt}/${maxRetries} thất bại. Lỗi: ${error.message}`);
            if (attempt === maxRetries) {
                throw error;
            }
            await sleep(delayMs);
        }
    }
}

async function syncCarsFromBack4App() {
    let skip = 0;
    let limit = 500;
    let hasMore = true;
    let totalSynced = 0;

    console.log('🚀 Bắt đầu quá trình đồng bộ dữ liệu xe từ Back4App...');

    while (hasMore) {
        console.log(`📥 Đang kéo dữ liệu từ mốc skip: ${skip}...`);

        try {
            const url = `https://parseapi.back4app.com/classes/Car_Model_List_BMW?limit=${limit}&skip=${skip}`;
            const options = {
                headers: {
                    'X-Parse-Application-Id': APP_ID,
                    'X-Parse-Master-Key': MASTER_KEY,
                }
            };

            const data = await fetchWithRetry(url, options);
            const cars = data.results;

            if (!cars || cars.length === 0) {
                console.log('🏁 Không còn dữ liệu để kéo. Hoàn tất!');
                hasMore = false;
                break;
            }

            console.log(`✅ Đã lấy được ${cars.length} dòng xe, đang xử lý...`);

            for (const car of cars) {
                const cleanMake = car.Make.trim();
                const cleanModel = car.Model.trim();

                // 1. Lưu Hãng xe (Make) - Dùng iLike để tránh trùng lặp hoa/thường
                const [makeRecord] = await Vehicle_Makes.findOrCreate({
                    where: {
                        make_name: { [Op.iLike]: cleanMake }
                    },
                    defaults: {
                        make_name: cleanMake
                    }
                });

                // 2. Lưu Dòng xe (Model) - Dùng iLike để tránh trùng lặp hoa/thường
                await Vehicle_Models.findOrCreate({
                    where: {
                        make_id: makeRecord.id,
                        model_name: { [Op.iLike]: cleanModel }
                    },
                    defaults: {
                        make_id: makeRecord.id,
                        model_name: cleanModel,
                        vehicle_type: car.Category || 'Khác'
                    }
                });
                totalSynced++;
            }

            skip += limit; // Tăng skip để lấy trang tiếp theo
            console.log(`📈 Đã đồng bộ thành công ${totalSynced} chiếc xe vào DB.`);

            // Dừng 1 giây giữa các đợt kéo để tránh quá tải API (rate limiting)
            await sleep(1000);

        } catch (error) {
            console.error('❌ Lỗi khi gọi API hoặc lưu DB sau nhiều lần thử lại:', error);
            hasMore = false; // Dừng nếu lỗi mạng liên tục hoặc lỗi hệ thống
        }
    }

    console.log(`🎉 HOÀN TẤT! Tổng số xe đã đồng bộ: ${totalSynced}`);
}

syncCarsFromBack4App();