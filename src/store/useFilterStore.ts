import { create } from 'zustand';
import { TrainingStatusType } from '../types';

interface FilterState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  filterDepartment: string;
  setFilterDepartment: (dept: string) => void;

  filterLevels: string[];
  setFilterLevels: (levels: string[]) => void;

  filterStatuses: TrainingStatusType[];
  setFilterStatuses: (statuses: TrainingStatusType[]) => void;

  filterQualification: 'All' | 'Qualified' | 'Gap';
  setFilterQualification: (qual: 'All' | 'Qualified' | 'Gap') => void;

  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  filterDepartment: 'All',
  setFilterDepartment: (dept) => set({ filterDepartment: dept }),

  filterLevels: ['Director', 'Manager', 'Supervisor', 'Senior Staff', 'Staff', 'Operator'],
  setFilterLevels: (levels) => set({ filterLevels: levels }),

  filterStatuses: ['done', 'progress', 'not_done'],
  setFilterStatuses: (statuses) => set({ filterStatuses: statuses }),

  filterQualification: 'All',
  setFilterQualification: (qual) => set({ filterQualification: qual }),

  resetFilters: () =>
    set({
      searchQuery: '',
      filterDepartment: 'All',
      filterLevels: ['Director', 'Manager', 'Supervisor', 'Senior Staff', 'Staff', 'Operator'],
      filterStatuses: ['done', 'progress', 'not_done'],
      filterQualification: 'All'
    })
}));
