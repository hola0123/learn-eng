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
  const systemPrompt = `You are an English language teacher creating multiple-choice questions to test students' understanding of English tenses. Follow these guidelines strictly:

1. Create exactly ${questionCount} questions
2. Focus on these tense types: ${tenseTypes}
3. Each question MUST have:
   - A clear question statement
   - Exactly 4 options labeled A, B, C, D
   - One correct answer
   - A detailed explanation
4. Format MUST be valid JSON array with this structure:
[
  {
    "question": "string with the question",
    "options": ["A. option1", "B. option2", "C. option3", "D. option4"],
    "correctAnswer": "A/B/C/D",
    "explanation": "detailed explanation"
  }
]
5. Ensure:
   - All JSON keys are exactly as shown
   - Options array has exactly 4 items
   - correctAnswer is a single letter (A, B, C, or D)
   - No extra fields or formatting`;

  const userPrompt = `Create ${questionCount} multiple-choice questions to practice these English tenses: ${tenseTypes}. 
Make questions that test real understanding, not just memorization.
Include a mix of:
- Fill in the blank questions
- Error identification
- Correct usage selection
- Context-based tense selection`;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
        top_p: 1,
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

    const content = response.data.choices[0].message.content;
    
    // Validate JSON structure before returning
    try {
      const parsed = JSON.parse(content);
      if (!Array.isArray(parsed) || parsed.length !== questionCount) {
        throw new Error('Invalid response format');
      }
      
      // Validate each question object
      parsed.forEach((question, index) => {
        if (!question.question || !Array.isArray(question.options) || 
            question.options.length !== 4 || !question.correctAnswer ||
            !question.explanation) {
          throw new Error(`Invalid question format at index ${index}`);
        }
      });
      
      return content;
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      throw new Error('Failed to parse questions. The AI response was not in the correct format.');
    }
  } catch (error) {
    console.error('Error generating questions:', error);
    throw new Error('Failed to generate questions. Please try again.');
  }
};