import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import TensePage from './pages/TensePage';
import ReadingPage from './pages/ReadingPage';
import { ThemeProvider } from './context/ThemeContext';
import WritingPage from "./pages/WritingPage";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="/tense" element={<TensePage />} />
            <Route path="/reading" element={<ReadingPage />} />
            <Route path="/writing" element={<WritingPage />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;