import React from 'react';
import { RefreshCw, ExternalLink } from 'lucide-react';
import Lottie from 'lottie-react';
import errorAnimation from './error-animation.json';

interface ErrorStateProps {
  message?: string;
  subMessage?: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  message = "MetaCode not found",
  subMessage = "Please ensure the correct MetaCode is provided in the URL.",
  onRetry
}) => {
  return (
    <div className="w-full max-w-lg">
      <div className="bg-white dark:bg-gray-800 backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90 rounded-xl shadow-xl border border-red-100 dark:border-red-900 p-8 transition-all duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="w-48 h-48 mb-4">
            <Lottie 
              animationData={errorAnimation} 
              loop={true} 
              className="w-full h-full"
            />
          </div>
          
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
            {message}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {subMessage}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button
              onClick={onRetry}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
            
            <a 
              href="https://codevite.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Go to CodeVite
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;