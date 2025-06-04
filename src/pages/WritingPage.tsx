import React, { useState } from 'react';
import { getModels, generateText, ModelOption } from '../services/openrouter';
import { PenTool, CheckCircle, RotateCcw, FileText, Star } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const DIFFICULTY_LEVELS = [
  { id: 'beginner', name: 'Beginner', description: 'Simple writing tasks with basic vocabulary' },
  { id: 'intermediate', name: 'Intermediate', description: 'Moderate complexity with varied vocabulary' },
  { id: 'advanced', name: 'Advanced', description: 'Complex writing tasks with advanced vocabulary' }
];

const WRITING_TYPES = [
  'Essay',
  'Story',
  'Letter',
  'Report',
  'Review',
  'Description'
];

const TOPICS = [
  'Technology and Innovation',
  'Education and Learning',
  'Environment and Climate',
  'Travel and Culture',
  'Food and Health',
  'Social Media and Communication',
  'Work and Career',
  'Hobbies and Entertainment'
];

interface WritingPrompt {
  title: string;
  prompt: string;
  requirements: string[];
  wordCount: string;
  timeLimit: string;
  tips: string[];
}

interface Feedback {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  grammar: {
    score: number;
    issues: string[];
  };
  vocabulary: {
    score: number;
    feedback: string;
  };
  structure: {
    score: number;
    feedback: string;
  };
  content: {
    score: number;
    feedback: string;
  };
}

const WritingPage: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>(
    "meta-llama/llama-4-maverick:free"
  );
  const [selectedLevel, setSelectedLevel] = useState<string>(
    DIFFICULTY_LEVELS[0].id
  );
  const [selectedType, setSelectedType] = useState<string>(WRITING_TYPES[0]);
  const [selectedTopic, setSelectedTopic] = useState<string>(TOPICS[0]);
  const [writingPrompt, setWritingPrompt] = useState<WritingPrompt | null>(null);
  const [userText, setUserText] = useState<string>("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [models, setModels] = useState<ModelOption[]>([]);
  const [wordCount, setWordCount] = useState<number>(0);

  React.useEffect(() => {
    setModels(getModels());
  }, []);

  React.useEffect(() => {
    const words = userText.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [userText]);

  // Helper function to extract JSON from response
  const extractJSON = (text: string) => {
    const startIndex = text.indexOf("{");
    if (startIndex === -1) throw new Error("No JSON found in response");

    const endIndex = text.lastIndexOf("}");
    if (endIndex === -1) throw new Error("Invalid JSON structure");

    const jsonStr = text.substring(startIndex, endIndex + 1);
    return JSON.parse(jsonStr);
  };

  const generatePrompt = async () => {
    try {
      setLoading(true);
      setError("");
      setWritingPrompt(null);
      setUserText("");
      setFeedback(null);

      const wordCountRange = selectedLevel === "beginner" 
        ? "100-150 words" 
        : selectedLevel === "intermediate" 
        ? "150-250 words" 
        : "250-400 words";

      const promptRequest = `You are a writing instructor. Create a ${selectedLevel}-level ${selectedType.toLowerCase()} writing prompt about "${selectedTopic}" for English language learners.

IMPORTANT: Your response must be ONLY a valid JSON object with no additional text, comments, or explanations before or after the JSON.

Requirements:
- Create an engaging and clear writing prompt
- Include specific requirements based on the writing type and level
- Provide helpful tips for completing the task
- Set appropriate word count: ${wordCountRange}
- Time limit: ${selectedLevel === "beginner" ? "20-30 minutes" : selectedLevel === "intermediate" ? "30-45 minutes" : "45-60 minutes"}

JSON Format (respond with ONLY this JSON, no other text):
{
  "title": "Engaging title for the writing task",
  "prompt": "Clear and detailed writing prompt that explains what the student should write about...",
  "requirements": [
    "Specific requirement 1",
    "Specific requirement 2",
    "Specific requirement 3"
  ],
  "wordCount": "${wordCountRange}",
  "timeLimit": "Time limit in minutes",
  "tips": [
    "Helpful tip 1",
    "Helpful tip 2",
    "Helpful tip 3"
  ]
}

Writing Type: ${selectedType}
Topic: ${selectedTopic}
Level: ${selectedLevel}

Respond with ONLY the JSON object, no additional text.`;

      const response = await generateText({
        model: selectedModel,
        prompt: promptRequest,
        max_tokens: 1500,
        temperature: 0.7,
      });

      try {
        const parsedResponse = extractJSON(response.trim());

        // Validate the response structure
        if (!parsedResponse.title || !parsedResponse.prompt || !parsedResponse.requirements) {
          throw new Error("Invalid response structure: missing required fields");
        }

        if (!Array.isArray(parsedResponse.requirements) || !Array.isArray(parsedResponse.tips)) {
          throw new Error("Requirements and tips must be arrays");
        }

        setWritingPrompt(parsedResponse);
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        console.error("Raw response:", response);

        if (response.includes("```")) {
          setError("The AI returned formatted text instead of pure JSON. Please try again.");
        } else if (!response.includes("{") || !response.includes("}")) {
          setError("The AI did not return a valid JSON response. Please try again with a different model.");
        } else {
          setError("Failed to parse the AI response. The response may be incomplete or malformed. Please try again.");
        }
      }
    } catch (err) {
      setError("Failed to generate writing prompt. Please check your internet connection and try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const evaluateWriting = async () => {
    if (!userText.trim()) {
      setError("Please write something before requesting evaluation.");
      return;
    }

    try {
      setEvaluating(true);
      setError("");
      setFeedback(null);

      const evaluationPrompt = `You are an experienced English writing instructor. Evaluate this ${selectedLevel}-level ${selectedType.toLowerCase()} writing sample and provide detailed feedback.

Original Prompt: "${writingPrompt?.prompt}"
Requirements: ${writingPrompt?.requirements?.join(", ")}

Student's Writing:
"""
${userText}
"""

IMPORTANT: Your response must be ONLY a valid JSON object with no additional text, comments, or explanations before or after the JSON.

Provide comprehensive feedback with scores (1-10) and specific comments:

JSON Format (respond with ONLY this JSON, no other text):
{
  "overallScore": 8,
  "strengths": [
    "Specific strength 1",
    "Specific strength 2",
    "Specific strength 3"
  ],
  "improvements": [
    "Specific improvement suggestion 1",
    "Specific improvement suggestion 2",
    "Specific improvement suggestion 3"
  ],
  "grammar": {
    "score": 8,
    "issues": [
      "Specific grammar issue 1",
      "Specific grammar issue 2"
    ]
  },
  "vocabulary": {
    "score": 7,
    "feedback": "Detailed feedback about vocabulary usage..."
  },
  "structure": {
    "score": 8,
    "feedback": "Detailed feedback about text structure and organization..."
  },
  "content": {
    "score": 8,
    "feedback": "Detailed feedback about content quality and relevance..."
  }
}

Level: ${selectedLevel}
Writing Type: ${selectedType}

Respond with ONLY the JSON object, no additional text.`;

      const response = await generateText({
        model: selectedModel,
        prompt: evaluationPrompt,
        max_tokens: 2000,
        temperature: 0.3,
      });

      try {
        const parsedResponse = extractJSON(response.trim());

        // Validate the response structure
        if (!parsedResponse.overallScore || !parsedResponse.strengths || !parsedResponse.improvements) {
          throw new Error("Invalid response structure: missing required fields");
        }

        setFeedback(parsedResponse);
      } catch (parseError) {
        console.error("Error parsing evaluation response:", parseError);
        console.error("Raw response:", response);
        setError("Failed to parse the evaluation response. Please try again.");
      }
    } catch (err) {
      setError("Failed to evaluate writing. Please check your internet connection and try again.");
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const resetAll = () => {
    setWritingPrompt(null);
    setUserText("");
    setFeedback(null);
    setError("");
    setWordCount(0);
    setSelectedLevel(DIFFICULTY_LEVELS[0].id);
    setSelectedType(WRITING_TYPES[0]);
    setSelectedTopic(TOPICS[0]);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600 dark:text-green-400";
    if (score >= 6) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreStars = (score: number) => {
    const stars = [];
    const fullStars = Math.floor(score / 2);
    const hasHalfStar = score % 2 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-current text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-current text-yellow-400 opacity-50" />);
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300 dark:text-gray-600" />);
    }

    return stars;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <PenTool className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
          Writing Practice
        </h2>
        <button
          onClick={resetAll}
          className="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 flex items-center"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Controls Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select AI Model
            </label>
            <select
              id="model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={loading || writingPrompt !== null}
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Difficulty Level
            </label>
            <select
              id="level"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={loading || writingPrompt !== null}
            >
              {DIFFICULTY_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Writing Type
            </label>
            <select
              id="type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={loading || writingPrompt !== null}
            >
              {WRITING_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Topic
            </label>
            <select
              id="topic"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={loading || writingPrompt !== null}
            >
              {TOPICS.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-between">
          {!writingPrompt ? (
            <button
              onClick={generatePrompt}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {loading ? (
                <div className="flex items-center">
                  <LoadingSpinner size={8} />
                  <span className="ml-2">Generating...</span>
                </div>
              ) : (
                "Generate Writing Prompt"
              )}
            </button>
          ) : (
            <button
              onClick={evaluateWriting}
              disabled={evaluating || !userText.trim()}
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors duration-200 flex items-center dark:bg-green-500 dark:hover:bg-green-600"
            >
              {evaluating ? (
                <div className="flex items-center">
                  <LoadingSpinner size={8} />
                  <span className="ml-2">Evaluating...</span>
                </div>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" /> Get Feedback
                </>
              )}
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 rounded-md">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {writingPrompt && (
          <div className="mt-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                {writingPrompt.title}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">Writing Prompt:</h4>
                  <p className="text-blue-700 dark:text-blue-300">{writingPrompt.prompt}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">Requirements:</h4>
                    <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 space-y-1">
                      {writingPrompt.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">Tips:</h4>
                    <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 space-y-1">
                      {writingPrompt.tips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-blue-200 dark:border-blue-600">
                  <span className="text-blue-700 dark:text-blue-300">
                    <strong>Word Count:</strong> {writingPrompt.wordCount}
                  </span>
                  <span className="text-blue-700 dark:text-blue-300">
                    <strong>Time Limit:</strong> {writingPrompt.timeLimit}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Writing</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Word count: {wordCount}
                </span>
              </div>
              <textarea
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                placeholder="Start writing here..."
                className="w-full h-64 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                disabled={evaluating}
              />
            </div>
          </div>
        )}

        {feedback && (
          <div className="mt-6 space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-500 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                Overall Score: <span className={`ml-2 ${getScoreColor(feedback.overallScore)}`}>{feedback.overallScore}/10</span>
              </h3>
              
              <div className="flex items-center mb-4">
                {getScoreStars(feedback.overallScore)}
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  ({Math.round((feedback.overallScore / 10) * 100)}%)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-500 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 dark:text-green-300 mb-3">Strengths</h4>
                <ul className="space-y-2">
                  {feedback.strengths.map((strength, index) => (
                    <li key={index} className="text-green-700 dark:text-green-400 flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-500 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-3">Areas for Improvement</h4>
                <ul className="space-y-2">
                  {feedback.improvements.map((improvement, index) => (
                    <li key={index} className="text-yellow-700 dark:text-yellow-400 flex items-start">
                      <PenTool className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Grammar</h4>
                    <span className={`font-bold ${getScoreColor(feedback.grammar.score)}`}>
                      {feedback.grammar.score}/10
                    </span>
                  </div>
                  {feedback.grammar.issues.length > 0 && (
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {feedback.grammar.issues.map((issue, index) => (
                        <li key={index}>• {issue}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Vocabulary</h4>
                    <span className={`font-bold ${getScoreColor(feedback.vocabulary.score)}`}>
                      {feedback.vocabulary.score}/10
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feedback.vocabulary.feedback}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Structure</h4>
                    <span className={`font-bold ${getScoreColor(feedback.structure.score)}`}>
                      {feedback.structure.score}/10
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feedback.structure.feedback}</p>
                </div>

                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Content</h4>
                    <span className={`font-bold ${getScoreColor(feedback.content.score)}`}>
                      {feedback.content.score}/10
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feedback.content.feedback}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WritingPage;