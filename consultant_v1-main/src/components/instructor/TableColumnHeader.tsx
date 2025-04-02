import React, { useState, useRef, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { FilterField } from '../../types/filters';

interface TableColumnHeaderProps {
  label: string;
  field: FilterField;
  filterValue?: string;
  onFilterChange: (field: FilterField, value: string) => void;
  onFilterClear: (field: FilterField) => void;
  options?: string[];
}

export const TableColumnHeader: React.FC<TableColumnHeaderProps> = ({
  label,
  field,
  filterValue,
  onFilterChange,
  onFilterClear,
  options
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState(filterValue || '');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterApply = () => {
    onFilterChange(field, inputValue);
    setIsOpen(false);
  };

  const handleClear = () => {
    setInputValue('');
    onFilterClear(field);
    setIsOpen(false);
  };

  return (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative">
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`ml-2 p-1 rounded hover:bg-gray-200 ${filterValue ? 'text-primary' : 'text-gray-400'}`}
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute z-10 right-4 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200"
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-700">Filter {label}</h3>
              <button
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {options ? (
              <select
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All</option>
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : field === 'progress' ? (
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={inputValue || '0'}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full"
                />
                <div className="text-sm text-gray-600 text-center">
                  {inputValue || '0'}% or higher
                </div>
              </div>
            ) : (
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Filter by ${label.toLowerCase()}...`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleFilterApply}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </th>
  );
}; 