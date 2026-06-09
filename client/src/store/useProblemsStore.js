import { create } from 'zustand';
import { problemsApi } from '../api/index.js';

const useProblemsStore = create((set, get) => ({
  // ─── State ──────────────────────────────────────────────────────────────────
  problems: [],
  total: 0,
  totalPages: 1,
  currentPage: 1,
  isLoading: false,
  error: null,

  filters: {
    status: '',
    difficulty: '',
    topic: '',
    platform: '',
    tag: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    isFavorite: '',
    isRevision: '',
  },

  limit: 20,

  // ─── Actions ─────────────────────────────────────────────────────────────────
  fetchProblems: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const { filters, limit } = get();
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '')
      );
      const data = await problemsApi.getAll({ ...cleanFilters, page, limit });
      set({
        problems: data.problems,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
        currentPage: page,
        isLoading: false,
      });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      currentPage: 1,
    }));
  },

  resetFilters: () => {
    set({
      filters: {
        status: '',
        difficulty: '',
        topic: '',
        platform: '',
        tag: '',
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        isFavorite: '',
        isRevision: '',
      },
      currentPage: 1,
    });
  },

  createProblem: async (data) => {
    const problem = await problemsApi.create(data);
    await get().fetchProblems(get().currentPage);
    return problem;
  },

  updateProblem: async (id, data) => {
    const updated = await problemsApi.update(id, data);
    set((state) => ({
      problems: state.problems.map((p) => (p._id === id ? updated : p)),
    }));
    return updated;
  },

  deleteProblem: async (id) => {
    await problemsApi.delete(id);
    set((state) => ({
      problems: state.problems.filter((p) => p._id !== id),
      total: state.total - 1,
    }));
  },

  toggleFavorite: async (id) => {
    const updated = await problemsApi.toggleFavorite(id);
    set((state) => ({
      problems: state.problems.map((p) => (p._id === id ? updated : p)),
    }));
  },

  toggleRevision: async (id) => {
    const updated = await problemsApi.toggleRevision(id);
    set((state) => ({
      problems: state.problems.map((p) => (p._id === id ? updated : p)),
    }));
  },
}));

export default useProblemsStore;
