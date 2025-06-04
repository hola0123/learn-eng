import React from 'react';
import { PulseLoader } from 'react-spinners';
import { useTheme } from '../context/ThemeContext';

interface LoadingSpinnerProps {
  size?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 10 }) => {
  const { theme } = useTheme();
  
  return (
    <div className="flex justify-center items-center p-4">
      <PulseLoader
        color={theme === 'dark' ? '#60A5FA' : '#2563EB'}
        size={size}
        speedMultiplier={0.8}
      />
    </div>
  );
};

export default LoadingSpinner;