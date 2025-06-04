import React, { useState } from 'react';
import { getModels, generateText, ModelOption } from '../services/openrouter';
import { BookOpen, CheckCircle, RotateCcw } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const DIFFICULTY_LEVELS = [
  { id: 'beginner', name: 'Beginner', description: 'Simple texts with basic vocabulary' },
  { id: 'intermediate', name: 'Intermediate', description: 'Moderate complexity with varied vocabulary' },
  { id: 'advanced', name: 'Advanced', description: 'Complex texts with advanced vocabulary' }
];

const TOPICS = [
  'Science and Technology',
  'History and Culture',
  'Environment and Nature',
  'Business and Economics',
  'Arts and Entertainment',
  'Health and Wellness'
];

const ReadingPage: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>("meta-llama/llama-4-maverick:free");
  const [selectedLevel, setSelectedLevel] = useState<string>(DIFFICULTY_LEVELS[0].id);
  const [selectedTopic, setSelectedTopic] = useState<string>(TOPICS[0]);
  const [passage, setPassage] = useState<string>('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [models, setModels] = useState<ModelOption[]>([]);
  const [score, setScore] = useState<number>(0);

  React.useEffect(() => {
    setModels(getModels());
  }, []);

  const generatePassage = async () => {
    try {
      setLoading(true);
      setError('');
      setPassage('');
      setQuestions([]);
      setUserAnswers({});
      setShowResults(false);

      const passagePrompt = `Generate a ${selectedLevel} level reading passage about ${selectedTopic}. The passage should be engaging and informative, suitable for English language learners at the ${selectedLevel} level. After the passage, provide 5 multiple-choice comprehension questions with 4 options each (A, B, C, D) and explanations for the correct answers. Format the response as a JSON object with 'passage' and 'questions' fields. Each question should have 'question', 'options', 'correctAnswer', and 'explanation' fields.`;

      const response = await generateText({
        model: selectedModel,
        prompt: passagePrompt,
        max_tokens: 2000,
      });

      try {
        const parsedResponse = JSON.parse(response);
        setPassage(parsedResponse.passage);
        setQuestions(parsedResponse.questions);
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        setError('Failed to parse the response. Please try again.');
      }
    } catch (err) {
      setError('Failed to generate reading passage. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const checkAnswers = () => {
    let correctCount = 0;
    questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setShowResults(true);
  };

  const resetAll = () => {
    setPassage('');
    setQuestions([]);
    setUserAnswers({});
    setShowResults(false);
    setError('');
    setScore(0);
    setSelectedLevel(DIFFICULTY_LEVELS[0].id);
    setSelectedTopic(TOPICS[0]);
  };

  const getOptionClassName = (questionIndex: number, option: string) => {
    const optionLetter = option.split('.')[0];
    
    if (!showResults) {
      return userAnswers[questionIndex] === optionLetter
        ? 'bg-blue-100 border-blue-300 dark:bg-blue-900/50 dark:border-blue-500'
        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50';
    }
    
    const isUserAnswer = userAnswers[questionIndex] === optionLetter;
    const isCorrectAnswer = questions[questionIndex].correctAnswer === optionLetter;
    
    if (isCorrectAnswer) {
      return 'bg-green-100 border-green-300 dark:bg-green-900/50 dark:border-green-500';
    }
    
    if (isUserAnswer) {
      return 'bg-red-100 border-red-300 dark:bg-red-900/50 dark:border-red-500';
    }
    
    return '';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <BookOpen className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
          Reading Practice
        </h2>
        <button
          onClick={resetAll}
          className="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 flex items-center"
        >
          <RotateCcw className="h-4 w-4 mr-1" /> Reset All
        </button>
      </div>

      <div className="space-y-6">
        {/* Controls Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select AI Model
            </label>
            <select
              id="model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={loading || passage !== ''}
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
              disabled={loading || passage !== ''}
            >
              {DIFFICULTY_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
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
              disabled={loading || passage !== ''}
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
          {!passage ? (
            <button
              onClick={generatePassage}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {loading ? (
                <div className="flex items-center">
                  <LoadingSpinner size={8} />
                  <span className="ml-2">Generating...</span>
                </div>
              ) : (
                'Generate Reading Passage'
              )}
            </button>
          ) : (
            <button
              onClick={checkAnswers}
              disabled={Object.keys(userAnswers).length !== questions.length || showResults}
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors duration-200 flex items-center dark:bg-green-500 dark:hover:bg-green-600"
            >
              <CheckCircle className="h-4 w-4 mr-1" /> Check Answers
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 rounded-md">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {passage && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Reading Passage</h3>
            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{passage}</p>
            </div>
          </div>
        )}

        {showResults && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500 rounded-md flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300">Your Score</h3>
              <p className="text-blue-700 dark:text-blue-400">
                You got <span className="font-bold">{score}</span> out of{' '}
                <span className="font-bold">{questions.length}</span> correct (
                <span className="font-bold">
                  {Math.round((score / questions.length) * 100)}%
                </span>
                )
              </p>
            </div>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {score}/{questions.length}
            </div>
          </div>
        )}

        {questions.length > 0 && (
          <div className="mt-6 space-y-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Comprehension Questions</h3>
            {questions.map((question, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Question {index + 1}:
                </h4>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{question.question}</p>
                
                <div className="space-y-2">
                  {question.options.map((option: string, optionIndex: number) => (
                    <div
                      key={optionIndex}
                      onClick={() => !showResults && handleAnswerSelect(index, option.split('.')[0])}
                      className={`p-3 border rounded-md cursor-pointer transition-colors duration-200 ${
                        getOptionClassName(index, option)
                      } text-gray-700 dark:text-gray-300`}
                    >
                      {option}
                      
                      {showResults && question.correctAnswer === option.split('.')[0] && (
                        <span className="ml-2 text-green-600 dark:text-green-400 font-medium">(Correct)</span>
                      )}
                    </div>
                  ))}
                </div>

                {showResults && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Explanation:</h4>
                    <p className="text-gray-700 dark:text-gray-300">{question.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingPage;