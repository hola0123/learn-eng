import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { BookOpenText, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Layout: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <BookOpenText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">English Learning App</h1>
            </div>
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-4">
                <Link 
                  to="/" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/' 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  Generate Paragraphs
                </Link>
                <Link 
                  to="/tense" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/tense' 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  Practice Tenses
                </Link>
              </nav>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5 text-gray-600" />
                ) : (
                  <Sun className="h-5 w-5 text-gray-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>
      
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} English Learning App. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;