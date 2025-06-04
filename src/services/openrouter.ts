import axios from 'axios';

interface OpenRouterParams {
  model: string;
  prompt: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
}

export interface ModelOption {
  id: string;
  name: string;
}

export const getModels = (): ModelOption[] => {
  try {
    const modelsString = import.meta.env.VITE_MODELS;
    const modelsObject = JSON.parse(modelsString);
    
    return Object.entries(modelsObject).map(([id, name]) => ({
      id,
      name: name as string
    }));
  } catch (error) {
    console.error('Error parsing models from environment variables:', error);
    // Return default models if parsing fails
    return [{ id: "no-model", name: "No Model" }];
  }
};

export const generateText = async ({
  model,
  prompt,
  max_tokens = 1000,
  temperature = 0.7,
  top_p = 1,
  paragraphCount = 1,
}: OpenRouterParams & { paragraphCount?: number }): Promise<string> => {
  try {
    const adjustedPrompt = paragraphCount > 1 
      ? `Generate ${paragraphCount} paragraphs about: ${prompt}`
      : prompt;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model,
        messages: [{ role: 'user', content: adjustedPrompt }],
        max_tokens,
        temperature,
        top_p,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'English Learning App',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating text:', error);
    throw new Error('Failed to generate text. Please check your API key and try again.');
  }
};

export const translateText = async (model: string, text: string): Promise<string> => {
  return generateText({
    model,
    prompt: `Translate this English text to Indonesian:\n\n${text}`,
  });
};

export const correctText = async (model: string, englishText: string, indonesianText: string): Promise<string> => {
  return generateText({
    model,
    prompt: `Below is an English paragraph and an Indonesian translation written by a student. Please correct any errors in the Indonesian translation and provide feedback.\n\nEnglish paragraph:\n${englishText}\n\nStudent's Indonesian translation:\n${indonesianText}\n\nCorrections and feedback:`,
  });
};

export const generateTenseQuestions = async (
  model: string, 
  tenseTypes: string, 
  questionCount: number
): Promise<string> => {
  return generateText({
    model,
    prompt: `Generate ${questionCount} multiple-choice questions to practice the following English tenses: ${tenseTypes}. Distribute the questions evenly among the selected tenses. For each question, provide 4 options (A, B, C, D), indicate the correct answer, and provide a detailed explanation of why the answer is correct. Format the output as a JSON array with the following structure: 
    [
      {
        "question": "_____ you _____ to the party yesterday?",
        "options": ["A. Did, go", "B. Have, gone", "C. Were, going", "D. Are, going"],
        "correctAnswer": "A",
        "explanation": "The correct answer is A (Did, go) because this is a past simple question. We use 'did' as an auxiliary verb to form questions in the past simple tense, followed by the base form of the main verb 'go'. The event happened at a specific time in the past (yesterday)."
      }
    ]`,
    max_tokens: 2000,
  });
};