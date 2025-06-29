import { GoogleGenerativeAI } from '@google/generative-ai';
import { PROMPTS } from './prompts.js';

// API timeout configuration
const API_TIMEOUT = 30000; // 30 seconds

// Helper function to add timeout to API calls
function withTimeout(promise, timeoutMs = API_TIMEOUT) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('API request timed out')), timeoutMs)
    )
  ]);
}

let genAI = null;
let model = null;

function initializeGemini() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
  
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: 8192,
      }
    });
  }
  
  return model;
}

export async function generateInitialRules(agentType) {
  const modelInstance = initializeGemini();
  const prompt = PROMPTS.initial.replace('{agentType}', agentType);
  
  try {
    const result = await withTimeout(modelInstance.generateContent(prompt));
    const response = await result.response;
    return response.text();
  } catch (error) {
    throw new Error(`Failed to generate initial rules: ${error.message}`);
  }
}

export async function evaluateRules(rules) {
  const modelInstance = initializeGemini();
  const prompt = PROMPTS.evaluate.replace('{rules}', rules);
  
  try {
    const result = await withTimeout(modelInstance.generateContent(prompt));
    const response = await result.response;
    return response.text();
  } catch (error) {
    throw new Error(`Failed to evaluate rules: ${error.message}`);
  }
}

export async function enhanceRules(rules, evaluation) {
  const modelInstance = initializeGemini();
  const prompt = PROMPTS.enhance
    .replace('{rules}', rules)
    .replace('{evaluation}', evaluation);
  
  try {
    const result = await withTimeout(modelInstance.generateContent(prompt));
    const response = await result.response;
    return response.text();
  } catch (error) {
    throw new Error(`Failed to enhance rules: ${error.message}`);
  }
}

export async function finalizeRules(rules) {
  const modelInstance = initializeGemini();
  const prompt = PROMPTS.finalize.replace('{rules}', rules);
  
  try {
    const result = await withTimeout(modelInstance.generateContent(prompt));
    const response = await result.response;
    return response.text();
  } catch (error) {
    throw new Error(`Failed to finalize rules: ${error.message}`);
  }
}