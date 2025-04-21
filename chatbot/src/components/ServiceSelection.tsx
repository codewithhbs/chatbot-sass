import React from 'react';
import { Category, Service } from '../types';

interface ServiceSelectionProps {
  categories: Category[];
  services: Service[];
  showServiceSelection: boolean;
  onCategorySelect: (category: string) => void;
  onServiceSelect: (service: string) => void;
}

const ServiceSelection: React.FC<ServiceSelectionProps> = ({
  categories,
  services,
  showServiceSelection,
  onCategorySelect,
  onServiceSelect
}) => {
  if (categories.length === 0 && (services.length === 0 || !showServiceSelection)) {
    return null;
  }

  return (
    <div className="space-y-3 animate-fadeIn">
      {categories.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">Please select a service category:</p>
          <div className="grid grid-cols-1 gap-2">
            {categories.map((cat, index) => (
              <button
                key={index}
                onClick={() => onCategorySelect(cat.category)}
                className="p-4 cursor-pointer bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-left border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
              >
                <h3 className="font-semibold text-blue-600 dark:text-blue-400">{cat.category}</h3>
                {cat.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{cat.description}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {services.length > 0 && showServiceSelection && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">Please select a specific service:</p>
          <div className="grid grid-cols-1 gap-2">
            {services.map((service, index) => (
              <button
                key={index}
                onClick={() => onServiceSelect(service.name)}
                className="p-3 bg-white dark:bg-gray-800 rounded-lg text-left hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
              >
                <span className="text-blue-600 dark:text-blue-400">{service.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceSelection;