import React, { useState } from 'react';
import { getModels, generateText, translateText, correctText, ModelOption } from '../services/openrouter';
import { BookOpen, HandPlatter as Translate, CheckCircle, RotateCcw } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const PARAGRAPH_PROMPTS = [
  "Write a short paragraph about climate change",
  "Write a short paragraph about artificial intelligence",
  "Write a short paragraph about sustainable living",
  "Write a short paragraph about cultural diversity",
  "Write a short paragraph about space exploration",
  "Write a short paragraph about the importance of mental health",
  "Write a short paragraph about renewable energy sources",
  "Write a short paragraph about the impact of social media",
  "Write a short paragraph about online learning",
  "Write a short paragraph about biodiversity conservation",
  "Write a short paragraph about the future of transportation",
  "Write a short paragraph about healthy eating habits",
  "Write a short paragraph about global warming",
  "Write a short paragraph about the benefits of reading books",
  "Write a short paragraph about digital transformation in education",
];

const HomePage: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>(
    "meta-llama/llama-4-maverick:free"
  );
  const [selectedPrompt, setSelectedPrompt] = useState<string>(PARAGRAPH_PROMPTS[0]);
  const [paragraphCount, setParagraphCount] = useState<number>(1);
  const [generatedParagraph, setGeneratedParagraph] = useState<string>('');
  const [translatedParagraph, setTranslatedParagraph] = useState<string>('');
  const [userTranslation, setUserTranslation] = useState<string>('');
  const [correctionResult, setCorrectionResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [translating, setTranslating] = useState<boolean>(false);
  const [correcting, setCorrecting] = useState<boolean>(false);
  const [showTranslationInput, setShowTranslationInput] = useState<boolean>(true);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [error, setError] = useState<string>('');

  React.useEffect(() => {
    setModels(getModels());
  }, []);

  const handleGenerateParagraph = async () => {
    try {
      setLoading(true);
      setError('');
      setGeneratedParagraph('');
      setTranslatedParagraph('');
      setUserTranslation('');
      setCorrectionResult('');
      setShowTranslationInput(true);
      
      const result = await generateText({
        model: selectedModel,
        prompt: selectedPrompt,
        paragraphCount,
      });
      
      setGeneratedParagraph(result);
    } catch (err) {
      setError('Failed to generate paragraph. Please check your API key and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslateParagraph = async () => {
    if (!generatedParagraph) return;
    
    try {
      setTranslating(true);
      setError('');
      
      const result = await translateText(selectedModel, generatedParagraph);
      
      setTranslatedParagraph(result);
      setShowTranslationInput(false);
    } catch (err) {
      setError('Failed to translate paragraph. Please try again.');
      console.error(err);
    } finally {
      setTranslating(false);
    }
  };

  const handleCorrectTranslation = async () => {
    if (!generatedParagraph || !userTranslation) return;
    
    try {
      setCorrecting(true);
      setError('');
      
      const result = await correctText(selectedModel, generatedParagraph, userTranslation);
      
      setCorrectionResult(result);
    } catch (err) {
      setError('Failed to correct translation. Please try again.');
      console.error(err);
    } finally {
      setCorrecting(false);
    }
  };

  const resetAll = () => {
    setGeneratedParagraph('');
    setTranslatedParagraph('');
    setUserTranslation('');
    setCorrectionResult('');
    setShowTranslationInput(true);
    setError('');
    setParagraphCount(1);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <BookOpen className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
        Generate English Paragraphs
      </h2>

      <div className="space-y-6">
        {/* Controls Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="model"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Select AI Model
            </label>
            <select
              id="model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Select Prompt
            </label>
            <select
              id="prompt"
              value={selectedPrompt}
              onChange={(e) => setSelectedPrompt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {PARAGRAPH_PROMPTS.map((prompt, index) => (
                <option key={index} value={prompt}>
                  {prompt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="paragraphCount"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Number of Paragraphs
            </label>
            <input
              type="number"
              id="paragraphCount"
              min="1"
              max="5"
              value={paragraphCount}
              onChange={(e) =>
                setParagraphCount(
                  Math.max(1, Math.min(5, parseInt(e.target.value) || 1))
                )
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={handleGenerateParagraph}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {loading ? (
              <div className="flex items-center">
                <LoadingSpinner size={8} />
                <span className="ml-2">Generating...</span>
              </div>
            ) : (
              "Generate Paragraph"
            )}
          </button>

          <button
            onClick={resetAll}
            className="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 flex items-center"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 rounded-md">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Generated Paragraph Section */}
        {generatedParagraph && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Generated Paragraph:
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600">
              <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                {generatedParagraph}
              </p>
            </div>

            <div className="mt-4">
              <button
                onClick={handleTranslateParagraph}
                disabled={translating}
                className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors duration-200 flex items-center dark:bg-green-500 dark:hover:bg-green-600"
              >
                {translating ? (
                  <div className="flex items-center">
                    <LoadingSpinner size={8} />
                    <span className="ml-2">Translating...</span>
                  </div>
                ) : (
                  <>
                    <Translate className="h-4 w-4 mr-1" />
                    Translate to Indonesian
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Translated Paragraph Section */}
        {translatedParagraph && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Indonesian Translation:
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600">
              <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                {translatedParagraph}
              </p>
            </div>
          </div>
        )}

        {/* User Translation Input Section */}
        {generatedParagraph && showTranslationInput && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Your Indonesian Translation:
            </h3>
            <textarea
              value={userTranslation}
              onChange={(e) => setUserTranslation(e.target.value)}
              placeholder="Type your Indonesian translation here..."
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />

            <div className="mt-4">
              <button
                onClick={handleCorrectTranslation}
                disabled={correcting || !userTranslation}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200 flex items-center dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                {correcting ? (
                  <div className="flex items-center">
                    <LoadingSpinner size={8} />
                    <span className="ml-2">Correcting...</span>
                  </div>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Correct My Translation
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Correction Result Section */}
        {correctionResult && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Correction Result:
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600">
              <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                {correctionResult}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;