import React, { useState } from 'react';
import { getModels, generateText, translateText, correctText, ModelOption } from '../services/openrouter';
import { BookOpen, HandPlatter as Translate, CheckCircle, RotateCcw } from 'lucide-react';

const PARAGRAPH_PROMPTS = [
  "Write a short paragraph about climate change",
  "Write a short paragraph about artificial intelligence",
  "Write a short paragraph about sustainable living",
  "Write a short paragraph about cultural diversity",
  "Write a short paragraph about space exploration"
];

const HomePage: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>('gpt-3.5-turbo');
  const [selectedPrompt, setSelectedPrompt] = useState<string>(PARAGRAPH_PROMPTS[0]);
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
    // Load models from environment variables
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
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <BookOpen className="h-6 w-6 mr-2 text-blue-600" />
        Generate English Paragraphs
      </h2>
      
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
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
              Select Prompt
            </label>
            <select
              id="prompt"
              value={selectedPrompt}
              onChange={(e) => setSelectedPrompt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {PARAGRAPH_PROMPTS.map((prompt, index) => (
                <option key={index} value={prompt}>
                  {prompt}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={handleGenerateParagraph}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
          >
            {loading ? 'Generating...' : 'Generate Paragraph'}
          </button>
          
          <button
            onClick={resetAll}
            className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 flex items-center"
          >
            <RotateCcw className="h-4 w-4 mr-1" /> Reset
          </button>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {/* Generated Paragraph Section */}
        {generatedParagraph && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Generated Paragraph:</h3>
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <p className="whitespace-pre-wrap">{generatedParagraph}</p>
            </div>
            
            <div className="mt-4">
              <button
                onClick={handleTranslateParagraph}
                disabled={translating}
                className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors duration-200 flex items-center"
              >
                <Translate className="h-4 w-4 mr-1" />
                {translating ? 'Translating...' : 'Translate to Indonesian'}
              </button>
            </div>
          </div>
        )}
        
        {/* Translated Paragraph Section */}
        {translatedParagraph && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Indonesian Translation:</h3>
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <p className="whitespace-pre-wrap">{translatedParagraph}</p>
            </div>
          </div>
        )}
        
        {/* User Translation Input Section */}
        {generatedParagraph && showTranslationInput && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your Indonesian Translation:</h3>
            <textarea
              value={userTranslation}
              onChange={(e) => setUserTranslation(e.target.value)}
              placeholder="Type your Indonesian translation here..."
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            
            <div className="mt-4">
              <button
                onClick={handleCorrectTranslation}
                disabled={correcting || !userTranslation}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200 flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                {correcting ? 'Correcting...' : 'Correct My Translation'}
              </button>
            </div>
          </div>
        )}
        
        {/* Correction Result Section */}
        {correctionResult && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Correction Result:</h3>
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <p className="whitespace-pre-wrap">{correctionResult}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;