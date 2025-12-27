const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    console.log("Fetching available models...\n");

    // Try different model names
    const modelNames = [
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-pro",
      "models/gemini-1.5-flash",
      "models/gemini-pro",
    ];

    for (const modelName of modelNames) {
      try {
        console.log(`Testing: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        const response = await result.response;
        console.log(`✅ ${modelName} works!`);
        console.log("Response:", response.text());
        return;
      } catch (err) {
        console.log(`❌ ${modelName} failed: ${err.message.substring(0, 100)}`);
      }
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

listModels();
