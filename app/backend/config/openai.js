const dotenv = require('dotenv');
dotenv.config();

const openaiConfig = {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4-1106-preview',
    temperature: 0.7,
    maxTokens: 2000
};

module.exports = openaiConfig; 