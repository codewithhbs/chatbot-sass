import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DateSelectionProps {
  onDateSelect: (date: Date) => void;
}

const DateSelection: React.FC<DateSelectionProps> = ({ onDateSelect }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDateConfirm = () => {
    if (selectedDate) {
      onDateSelect(selectedDate);
    }
  };

  return (
    <div className="space-y-3 animate-fadeIn p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-blue-100 dark:border-blue-900">
      <p className="text-sm text-gray-700 dark:text-gray-300">Please select your preferred service date:</p>
      <div className="w-full flex flex-col items-center space-y-3">
        <DatePicker
          selected={selectedDate}
          onChange={(date: Date) => setSelectedDate(date)}
          minDate={new Date()}
          inline
          className="bg-white dark:bg-gray-800"
        />
        <button
          onClick={handleDateConfirm}
          disabled={!selectedDate}
          className={`px-4 py-2 rounded-lg w-full ${
            !selectedDate 
              ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
          } text-white transition-colors`}
        >
          Confirm Date
        </button>
      </div>
    </div>
  );
};

export default DateSelection;