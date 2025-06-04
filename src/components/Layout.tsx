import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { BookOpenText } from 'lucide-react';

const Layout: React.FC = () => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <BookOpenText className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">English Learning App</h1>
            </div>
            <nav className="flex space-x-4">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Generate Paragraphs
              </Link>
              <Link 
                to="/tense" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/tense' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Practice Tenses
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} English Learning App. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;