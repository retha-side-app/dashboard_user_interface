import React, { useState } from 'react';
import { X, Plus, Filter } from 'lucide-react';
import { FilterOption, Filter as FilterType } from '../../types/filters';

interface FilterBarProps {
  filterOptions: FilterOption[];
  activeFilters: FilterType[];
  onAddFilter: (filter: FilterType) => void;
  onRemoveFilter: (field: FilterType['field']) => void;
  onClearFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filterOptions,
  activeFilters,
  onAddFilter,
  onRemoveFilter,
  onClearFilters
}) => {
  const [selectedField, setSelectedField] = useState<FilterOption['field'] | ''>('');
  const [filterValue, setFilterValue] = useState<string>('');

  const handleAddFilter = () => {
    if (selectedField && filterValue) {
      onAddFilter({
        field: selectedField,
        value: filterValue
      });
      setSelectedField('');
      setFilterValue('');
    }
  };

  const selectedOption = filterOptions.find(option => option.field === selectedField);

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center space-x-4">
        <select
          value={selectedField}
          onChange={(e) => setSelectedField(e.target.value as FilterOption['field'])}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Select filter...</option>
          {filterOptions.map(option => (
            <option key={option.field} value={option.field}>
              {option.label}
            </option>
          ))}
        </select>

        {selectedOption && (
          selectedOption.type === 'select' ? (
            <select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select {selectedOption.label.toLowerCase()}...</option>
              {selectedOption.options?.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : selectedOption.type === 'range' ? (
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="100"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="w-32"
              />
              <span className="text-sm text-gray-600">{filterValue}%</span>
            </div>
          ) : (
            <input
              type="text"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              placeholder={`Enter ${selectedOption.label.toLowerCase()}...`}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          )
        )}

        <button
          onClick={handleAddFilter}
          disabled={!selectedField || !filterValue}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Filter</span>
        </button>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex items-center space-x-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-500" />
          {activeFilters.map(filter => (
            <div
              key={filter.field}
              className="flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
            >
              <span>{filterOptions.find(opt => opt.field === filter.field)?.label}: {filter.value}</span>
              <button
                onClick={() => onRemoveFilter(filter.field)}
                className="hover:text-primary/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={onClearFilters}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}; 