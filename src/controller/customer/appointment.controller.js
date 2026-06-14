const appointmentService = require("../../service/customer/appointment.service");
const { createAppointmentSchema } = require("../../validation/customer/appointment.validation");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
module.exports.getAppointment = async (req, res) => {
    try {
        const requestUser = res.locals.user;
        if (!requestUser) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const result = await appointmentService.getAppointments(requestUser.id);
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách lịch hẹn thành công",
            data: result
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

module.exports.createAppointment = async (req, res) => {
    try {
        const requestUser = res.locals.user;
        if (!requestUser) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const validation = createAppointmentSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: validation.error.issues[0].message
            });
        }

        const result = await appointmentService.createAppointment(requestUser.id, validation.data);
        return res.status(201).json({
            success: true,
            message: "Đặt lịch hẹn thành công",
            data: result
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

module.exports.deleteAppointment = async (req, res) => {
    try {
        const requestUser = res.locals.user;
        if (!requestUser) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const id = req.query.id || req.body.id;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp ID lịch hẹn cần xóa"
            });
        }

        const appointmentId = parseInt(id);
        if (isNaN(appointmentId)) {
            return res.status(400).json({
                success: false,
                message: "ID lịch hẹn phải là một số nguyên"
            });
        }

        const result = await appointmentService.deleteAppointment(requestUser.id, appointmentId);
        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};


module.exports.analyzeCarColor = async (req, res) => {
    try {
        const requestUser = res.locals.user;
        if (!requestUser) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng tải lên một hình ảnh"
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(400).json({
                success: false,
                message: "GEMINI_API_KEY chưa được cấu hình ở backend."
            });
        }

        // Khởi tạo Google Gen AI client
        const genAI = new GoogleGenerativeAI(apiKey);
        const modelAI = genAI.getGenerativeModel({
            model: "gemini-3.5-flash",
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        const base64Image = req.file.buffer.toString("base64");
        const mimeType = req.file.mimetype;

        const promptText = `Hãy đóng vai một chuyên gia phân tích hình ảnh và nhận diện ô tô tại garage. Phân tích kỹ bức ảnh chiếc xe được cung cấp và trả về một JSON object duy nhất, tuyệt đối không kèm theo markdown (như \`\`\`json ...) hay bất kỳ chữ giải thích nào khác ngoài cấu trúc JSON. 
Cấu trúc JSON bắt buộc phải chính xác như sau:
{
  "color": "Màu sắc thực tế của xe (Ví dụ: Trắng, Đen, Đỏ, Xám...). CHÚ Ý NGHIÊM NGẶT: Hãy nhìn kỹ vùng sơn ở thân xe và nắp capo, tuyệt đối không được nhầm với màu sắc của cảnh vật xung quanh. Nếu xe màu trắng thì phải ghi là Trắng.",
  "visual_description": "Một đoạn văn ngắn (2-3 câu) mô tả tự nhiên ngoại hình chiếc xe thay cho người nhập liệu. Tập trung vào kiểu dáng (ví dụ: xe gầm cao MPV/SUV hay sedan), hình dáng lưới tản nhiệt, cụm đèn trước và kiểu mâm xe để nhân viên dễ dàng nhận diện khi nhìn vào hệ thống."
}

Lưu ý quan trọng:
1. Độ chính xác về màu sắc là ưu tiên số một. Không đoán mò, nhìn thấy màu gì ghi màu đó.
2. Nếu trên xe có biển tên (ví dụ: tên dòng xe ở chỗ gắn biển số), hãy đọc và đưa đặc điểm đó vào đoạn 'visual_description' để tăng độ nhận diện.`;

        // Gọi hàm generateContent qua SDK
        const response = await modelAI.generateContent([
            promptText,
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Image
                }
            }
        ]);

        const rawText = response.response.text() ? response.response.text().trim() : "";

        if (!rawText) {
            return res.status(500).json({
                success: false,
                message: "Không nhận được kết quả phân tích từ AI."
            });
        }

        let parsedData = {};
        try {
            parsedData = JSON.parse(rawText);
        } catch (e) {
            console.error("Lỗi parse JSON từ Gemini response:", e);
            // Giữ lại đoạn fallback regex cũ của bạn để an toàn
            const colorMatch = rawText.match(/"color":\s*"([^"]+)"/i);
            const descMatch = rawText.match(/"visual_description":\s*"([^"]+)"/i);
            const brandMatch = rawText.match(/"brand":\s*"([^"]+)"/i);
            const modelMatch = rawText.match(/"model":\s*"([^"]+)"/i);
            const plateMatch = rawText.match(/"license_plate":\s*"([^"]+)"/i);

            parsedData = {
                color: colorMatch ? colorMatch[1] : "",
                visual_description: descMatch ? descMatch[1] : rawText,
                brand: brandMatch && brandMatch[1] !== "null" ? brandMatch[1] : "",
                model: modelMatch && modelMatch[1] !== "null" ? modelMatch[1] : "",
                license_plate: plateMatch && plateMatch[1] !== "null" ? plateMatch[1] : ""
            };
        }

        const color = parsedData.color || "";
        const brand = parsedData.brand && parsedData.brand !== "null" ? parsedData.brand : "";
        const model = parsedData.model && parsedData.model !== "null" ? parsedData.model : "";
        const licensePlate = parsedData.license_plate && parsedData.license_plate !== "null" ? parsedData.license_plate : "";
        const description = parsedData.visual_description || "";

        let formattedText = `* Màu sắc ngoại thất: ${color || "Chưa rõ"}`;
        if (brand) formattedText += `\n* Hãng xe: ${brand}`;
        if (model) formattedText += `\n* Dòng xe: ${model}`;
        if (licensePlate) formattedText += `\n* Biển số xe: ${licensePlate}`;
        if (description) formattedText += `\n* Đặc điểm nhận diện: ${description}`;

        return res.status(200).json({
            success: true,
            message: "Phân tích hình ảnh xe thành công",
            data: {
                rawText: formattedText,
                color: color,
                brand: brand,
                model: model,
                licensePlate: licensePlate
            }
        });
    } catch (error) {
        console.error("Gemini Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Có lỗi xảy ra khi phân tích hình ảnh: " + error.message
        });
    }
};

module.exports.cancelAppointment = async (req, res) => {
    try {
        const requestUser = res.locals.user;
        if (!requestUser) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const id = req.query.id || req.body.id;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp ID lịch hẹn cần hủy"
            });
        }

        const appointmentId = parseInt(id);
        if (isNaN(appointmentId)) {
            return res.status(400).json({
                success: false,
                message: "ID lịch hẹn phải là một số nguyên"
            });
        }

        const result = await appointmentService.cancelAppointment(requestUser.id, appointmentId);
        return res.status(200).json({
            success: true,
            message: result.message,
            data: result.data
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};