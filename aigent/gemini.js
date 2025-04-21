const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.CallGemini = async (prompt) => {
    try {

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: process.env.GOOGLE_GEMINI_MODEL });

        const result = await model.generateContentStream(prompt);
        let finalText = '';


        for await (const chunk of result.stream) {
            const chunkText = await chunk.text();
            finalText += chunkText;
        }
  
          

        return finalText;
    } catch (error) {
        // Handle errors
        console.error("Error calling Gemini API:", error);
        return "Error: Something went wrong while generating content.";
    }
};
 