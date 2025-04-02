export type FilterField = 'name' | 'course' | 'progress' | 'group' | 'email';

export interface FilterOption {
  field: FilterField;
  label: string;
  type: 'text' | 'select' | 'range';
  options?: string[];
}

export interface Filter {
  field: FilterField;
  value: string | number;
}

export interface FilterState {
  activeFilters: Filter[];
  availableOptions: {
    courses: string[];
    groups: string[];
  };
} 