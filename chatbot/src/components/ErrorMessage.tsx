import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400 text-center">
      <p>{message}</p>
      <p className="text-sm mt-1">Please refresh the page and try again.</p>
    </div>
  );
};

export default ErrorMessage;