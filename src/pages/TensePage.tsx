import React, { useState, useEffect } from 'react';
import { getModels, generateTenseQuestions, ModelOption } from '../services/openrouter';
import { BookText, CheckCircle, RotateCcw } from 'lucide-react';

interface TenseQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

const TENSE_TYPES = [
  "Present Simple",
  "Present Continuous",
  "Past Simple",
  "Past Continuous",
  "Present Perfect",
  "Future Simple",
  "Conditional",
  "Inversion"
];

const QUESTION_COUNTS = [5, 10, 15, 20];

const TensePage: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>('gpt-3.5-turbo');
  const [selectedTenseTypes, setSelectedTenseTypes] = useState<string[]>([TENSE_TYPES[0]]);
  const [selectedQuestionCount, setSelectedQuestionCount] = useState<number>(QUESTION_COUNTS[0]);
  const [questions, setQuestions] = useState<TenseQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [models, setModels] = useState<ModelOption[]>([]);
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    // Load models from environment variables
    setModels(getModels());
  }, []);

  const handleTenseTypeToggle = (tenseType: string) => {
    setSelectedTenseTypes(prev => {
      if (prev.includes(tenseType)) {
        // Remove if already selected
        return prev.filter(type => type !== tenseType);
      } else {
        // Add if not selected
        return [...prev, tenseType];
      }
    });
  };

  const handleGenerateQuestions = async () => {
    if (selectedTenseTypes.length === 0) {
      setError('Please select at least one tense type');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setQuestions([]);
      setUserAnswers({});
      setShowResults(false);
      
      const result = await generateTenseQuestions(
        selectedModel,
        selectedTenseTypes.join(', '),
        selectedQuestionCount
      );
      
      try {
        // Parse the JSON response
        const parsedQuestions = JSON.parse(result);
        if (Array.isArray(parsedQuestions)) {
          setQuestions(parsedQuestions);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (parseError) {
        console.error('Error parsing questions:', parseError);
        setError('Failed to parse questions. Please try again.');
      }
    } catch (err) {
      setError('Failed to generate questions. Please check your API key and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleCheckAnswers = () => {
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
    setQuestions([]);
    setUserAnswers({});
    setShowResults(false);
    setError('');
    setScore(0);
    setSelectedTenseTypes([TENSE_TYPES[0]]);
    setSelectedQuestionCount(QUESTION_COUNTS[0]);
    setSelectedModel('gpt-3.5-turbo');
  };

  const getOptionClassName = (questionIndex: number, option: string) => {
    const optionLetter = option.split('.')[0];
    
    if (!showResults) {
      return userAnswers[questionIndex] === optionLetter
        ? 'bg-blue-100 border-blue-300'
        : 'hover:bg-gray-50';
    }
    
    const isUserAnswer = userAnswers[questionIndex] === optionLetter;
    const isCorrectAnswer = questions[questionIndex].correctAnswer === optionLetter;
    
    if (isCorrectAnswer) {
      return 'bg-green-100 border-green-300';
    }
    
    if (isUserAnswer) {
      return 'bg-red-100 border-red-300';
    }
    
    return '';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <BookText className="h-6 w-6 mr-2 text-blue-600" />
          Practice English Tenses
        </h2>
        <button
          onClick={resetAll}
          className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 flex items-center"
        >
          <RotateCcw className="h-4 w-4 mr-1" /> Reset All
        </button>
      </div>
      
      <div className="space-y-6">
        {/* Controls Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
              Select AI Model
            </label>
            <select
              id="model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={loading || questions.length > 0}
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="questionCount" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Questions
            </label>
            <select
              id="questionCount"
              value={selectedQuestionCount}
              onChange={(e) => setSelectedQuestionCount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={loading || questions.length > 0}
            >
              {QUESTION_COUNTS.map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tense Types Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Tense Types (Choose one or more)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {TENSE_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => handleTenseTypeToggle(type)}
                disabled={loading || questions.length > 0}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  selectedTenseTypes.includes(type)
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : 'bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between">
          {questions.length === 0 ? (
            <button
              onClick={handleGenerateQuestions}
              disabled={loading || selectedTenseTypes.length === 0}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? 'Generating...' : 'Generate Questions'}
            </button>
          ) : (
            <button
              onClick={handleCheckAnswers}
              disabled={Object.keys(userAnswers).length !== questions.length || showResults}
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors duration-200 flex items-center"
            >
              <CheckCircle className="h-4 w-4 mr-1" /> Check Answers
            </button>
          )}
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {/* Results Section */}
        {showResults && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-blue-800">Your Score</h3>
              <p className="text-blue-700">
                You got <span className="font-bold">{score}</span> out of{' '}
                <span className="font-bold">{questions.length}</span> correct (
                <span className="font-bold">
                  {Math.round((score / questions.length) * 100)}%
                </span>
                )
              </p>
            </div>
            <div className="text-4xl font-bold text-blue-600">
              {score}/{questions.length}
            </div>
          </div>
        )}
        
        {/* Questions Section */}
        {questions.length > 0 && (
          <div className="mt-6 space-y-8">
            {questions.map((question, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 transition-all duration-300">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Question {index + 1}:
                </h3>
                <p className="text-gray-700 mb-4">{question.question}</p>
                
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      onClick={() => !showResults && handleAnswerSelect(index, option.split('.')[0])}
                      className={`p-3 border rounded-md cursor-pointer transition-colors duration-200 ${
                        getOptionClassName(index, option)
                      }`}
                    >
                      {option}
                      
                      {showResults && question.correctAnswer === option.split('.')[0] && (
                        <span className="ml-2 text-green-600 font-medium">(Correct)</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TensePage;