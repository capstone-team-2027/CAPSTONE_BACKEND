const { GoogleGenerativeAI } = require("@google/generative-ai");

const geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = geminiClient;
