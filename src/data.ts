import { api } from './api';
import { useResource } from './store';

export const useHome = () => useResource('home', api.home);
export const useBooks = () => useResource('books', api.books);
export const useBook = (id: number) => useResource(`book/${id}`, () => api.book(id));
export const usePaths = () => useResource('paths', api.paths);
export const useSections = () => useResource('sections', api.sections);
export const usePins = () => useResource('pins', api.pins);
export const useReading = () => useResource('reading', api.reading);
export const useStats = (year?: number) => useResource(`stats/${year ?? ''}`, () => api.stats(year));
export const useSends = () => useResource('sends', api.sends);
export const useBookHighlights = (id: number) => useResource(`highlights/${id}`, () => api.bookHighlights(id));
export const useHighlights = () => useResource('highlights', () => api.highlights());
export const useIssues = () => useResource('issues', api.issues);
