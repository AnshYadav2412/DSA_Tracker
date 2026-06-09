import { create } from 'zustand';
import { statsApi } from '../api/index.js';

const useStatsStore = create((set) => ({
  allStats:     null,
  activity:     null,
  sheets:       [],
  currentSheet: null,
  isLoading:    false,
  error:        null,

  fetchAllStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await statsApi.getAll();
      set({ allStats: data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchActivity: async () => {
    try {
      const data = await statsApi.getActivity();
      set({ activity: data });
    } catch (err) {
      set({ error: err.message });
    }
  },

  fetchSheets: async () => {
    try {
      const data = await statsApi.getSheets();
      set({ sheets: data.sheets ?? [] });
    } catch (err) {
      set({ error: err.message });
    }
  },

  fetchSheet: async (sheetName) => {
    set({ isLoading: true, error: null, currentSheet: null });
    try {
      const data = await statsApi.getSheet(sheetName);
      set({ currentSheet: data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  toggleSheetProblem: async (sheetName, slug) => {
    const updated = await statsApi.toggleSheetProblem(sheetName, slug);
    set((state) => {
      if (!state.currentSheet || state.currentSheet.sheetName !== sheetName) return state;
      const problems = state.currentSheet.problems.map((p) =>
        p.titleSlug?.toLowerCase() === slug.toLowerCase()
          ? { ...p, completed: updated.completed, completedAt: updated.completedAt, completionSource: updated.completionSource }
          : p
      );
      const completedCount = problems.filter((p) => p.completed).length;
      return {
        currentSheet: { ...state.currentSheet, problems, completed: completedCount, percentage: Math.round((completedCount / problems.length) * 100) },
        sheets: state.sheets.map((s) =>
          s.sheetName === sheetName
            ? { ...s, completed: completedCount, percentage: Math.round((completedCount / s.total) * 100) }
            : s
        ),
      };
    });
    return updated;
  },
}));

export default useStatsStore;
