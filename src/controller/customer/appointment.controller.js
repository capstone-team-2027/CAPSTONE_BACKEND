const appointmentService = require("../../service/customer/appointment.service");
const { createAppointmentSchema } = require("../../validation/customer/appointment.validation");
const axios = require("axios");
const FormData = require("form-data");
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

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng tải lên ít nhất một hình ảnh"
            });
        }

        const apiKey = process.env.PLATE_RECOGNIZER_TOKEN;
        if (!apiKey) {
            return res.status(400).json({
                success: false,
                message: "PLATE_RECOGNIZER_TOKEN chưa được cấu hình ở backend (.env)."
            });
        }
        let licensePlate = "";
        let brand = "";
        let model = "";
        let color = "";
        let description = "";

        const formatStr = (str) => {
            if (!str) return "";
            return str.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        };

        const formatLicensePlate = (plate) => {
            if (!plate) return "";
            let p = plate.replace(/[^A-Z0-9]/ig, "").toUpperCase();

            // Format 5 chữ số: 51A-123.45 (vd: 51A12345)
            const match5 = p.match(/^(\d{2}[A-Z]\d?)(\d{3})(\d{2})$/);
            if (match5) {
                return `${match5[1]}-${match5[2]}.${match5[3]}`;
            }

            // Format 4 chữ số (biển cũ): 51A-1234 (vd: 51A1234)
            const match4 = p.match(/^(\d{2}[A-Z]\d?)(\d{4})$/);
            if (match4) {
                return `${match4[1]}-${match4[2]}`;
            }

            return p;
        };

        // Lặp qua từng file, gửi cho Plate Recognizer đến khi nào tìm thấy biển số thì dừng (tiết kiệm API)
        for (const file of req.files) {
            const formData = new FormData();
            formData.append("upload", file.buffer, {
                filename: file.originalname || "image.jpg",
                contentType: file.mimetype || "image/jpeg"
            });
            formData.append("mmc", "true");

            try {
                const response = await axios.post(
                    "https://api.platerecognizer.com/v1/plate-reader/",
                    formData,
                    {
                        headers: {
                            ...formData.getHeaders(),
                            "Authorization": `Token ${apiKey}`
                        }
                    }
                );

                const data = response.data;
                if (data.results && data.results.length > 0) {
                    const result = data.results[0];
                    if (result.plate) {
                        licensePlate = formatLicensePlate(result.plate);

                        // Lấy luôn các thông tin hãng/dòng/màu nếu có
                        if (result.vehicle) {
                            if (result.vehicle.make && result.vehicle.make.length > 0) {
                                brand = formatStr(result.vehicle.make[0].make);
                            }
                            if (result.vehicle.make_model && result.vehicle.make_model.length > 0) {
                                model = formatStr(result.vehicle.make_model[0].make_model);
                                if (brand && model.toLowerCase().startsWith(brand.toLowerCase())) {
                                    model = model.substring(brand.length).trim();
                                }
                            } else if (result.vehicle.type) {
                                model = formatStr(result.vehicle.type);
                            }

                            if (result.vehicle.color && result.vehicle.color.length > 0) {
                                const colorMap = {
                                    "black": "Đen", "white": "Trắng", "silver": "Bạc", "gray": "Xám",
                                    "red": "Đỏ", "blue": "Xanh dương", "green": "Xanh lá", "yellow": "Vàng",
                                    "brown": "Nâu", "orange": "Cam", "gold": "Vàng óng", "purple": "Tím",
                                    "beige": "Be", "pink": "Hồng"
                                };
                                const rawColor = result.vehicle.color[0].color.toLowerCase();
                                color = colorMap[rawColor] || formatStr(rawColor);
                            }
                            if (result.vehicle.type) {
                                description = `Loại xe: ${formatStr(result.vehicle.type)}`;
                            }
                        }

                        // Đã tìm thấy biển số thì thoát khỏi vòng lặp ngay lập tức
                        break;
                    }
                }
            } catch (err) {
                console.error("Lỗi khi quét Plate Recognizer cho 1 ảnh (bỏ qua):", err.message);
            }
        }

        // --- BƯỚC 2: Bọc lót bằng Gemini nếu Plate Recognizer không nhận diện được Hãng xe (Brand) ---
        // Hoặc nhận diện model chung chung kiểu 'Sedan', 'SUV'
        const isGenericModel = model && ["sedan", "suv", "hatchback", "truck", "van"].includes(model.toLowerCase());
        if (!brand || brand.toLowerCase() === "unknown" || isGenericModel) {
            try {
                const apiKeyGemini = process.env.GEMINI_API_KEY;
                if (apiKeyGemini) {
                    const genAI = new GoogleGenerativeAI(apiKeyGemini);
                    const modelGen = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

                    const prompt = "Bạn là một chuyên gia về xe hơi tại Việt Nam. Phân tích các bức ảnh xe này (có thể có nhiều góc chụp). Hãy nhận diện chính xác Hãng xe, Dòng xe và Màu sắc (kể cả các hãng nội địa như Vinfast). Trả về đúng 1 file JSON có cấu trúc: {\"brand\": \"tên hãng (vd: Vinfast, Toyota)\", \"model\": \"tên dòng xe (vd: Lux A2.0, Vios)\", \"color\": \"màu sắc bằng tiếng Việt\"}. Chỉ trả về JSON, không giải thích gì thêm.";

                    const imageParts = req.files.map(file => ({
                        inlineData: {
                            data: file.buffer.toString("base64"),
                            mimeType: file.mimetype || "image/jpeg"
                        }
                    }));

                    const geminiResult = await modelGen.generateContent([prompt, ...imageParts]);
                    const responseText = geminiResult.response.text();

                    const jsonStrMatch = responseText.match(/\{[\s\S]*\}/);
                    if (jsonStrMatch) {
                        const geminiData = JSON.parse(jsonStrMatch[0]);
                        if (geminiData.brand) brand = formatStr(geminiData.brand);
                        if (geminiData.model) {
                            model = formatStr(geminiData.model);
                            // Xóa phần brand bị lặp trong model nếu Gemini vô tình ghép
                            if (brand && model.toLowerCase().startsWith(brand.toLowerCase())) {
                                model = model.substring(brand.length).trim();
                            }
                        }
                        if (geminiData.color) color = formatStr(geminiData.color);
                    }
                }
            } catch (geminiError) {
                console.error("Lỗi khi bọc lót bằng Gemini:", geminiError.message);
            }
        }

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
        console.error("Plate Recognizer Error:", error.response ? error.response.data : error.message);
        return res.status(500).json({
            success: false,
            message: "Có lỗi xảy ra khi gọi Plate Recognizer API: " + (error.response ? JSON.stringify(error.response.data) : error.message)
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

module.exports.getAppointmentVehicle = async (req, res) => {
    try {
        const requestUser = res.locals.user;
        if (!requestUser) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const result = await appointmentService.getAppointmentVehicles(requestUser.id);
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách xe khả dụng thành công",
            data: result
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};