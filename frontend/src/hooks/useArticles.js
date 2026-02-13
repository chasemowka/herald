import { useState, useCallback } from 'react';
import api from '../api/client';

export function useArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 20,
    total: 0,
    hasMore: false,
  });

  const fetchArticles = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (filters.topic) params.append('topic', filters.topic);
      if (filters.saved) params.append('saved', 'true');
      if (filters.page) params.append('page', filters.page);
      if (filters.per_page) params.append('per_page', filters.per_page);

      const queryString = params.toString();
      const endpoint = `/articles${queryString ? `?${queryString}` : ''}`;

      const response = await api.get(endpoint);

      setArticles(response.articles || response);
      setPagination({
        page: response.page || filters.page || 1,
        perPage: response.per_page || filters.per_page || 20,
        total: response.total || 0,
        hasMore: response.has_more || false,
      });

      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async (filters = {}) => {
    if (loading || !pagination.hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      const nextPage = pagination.page + 1;

      if (filters.topic) params.append('topic', filters.topic);
      if (filters.saved) params.append('saved', 'true');
      params.append('page', nextPage);
      params.append('per_page', pagination.perPage);

      const queryString = params.toString();
      const endpoint = `/articles?${queryString}`;

      const response = await api.get(endpoint);

      setArticles((prev) => [...prev, ...(response.articles || response)]);
      setPagination({
        page: nextPage,
        perPage: response.per_page || pagination.perPage,
        total: response.total || 0,
        hasMore: response.has_more || false,
      });

      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loading, pagination]);

  const markRead = useCallback(async (articleId, isRead = true) => {
    try {
      await api.patch(`/articles/${articleId}`, { is_read: isRead });

      setArticles((prev) =>
        prev.map((article) =>
          article.id === articleId ? { ...article, is_read: isRead } : article
        )
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const toggleSave = useCallback(async (articleId) => {
    try {
      const article = articles.find((a) => a.id === articleId);
      const newSavedState = !article?.is_saved;

      await api.patch(`/articles/${articleId}`, { is_saved: newSavedState });

      setArticles((prev) =>
        prev.map((a) =>
          a.id === articleId ? { ...a, is_saved: newSavedState } : a
        )
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [articles]);

  return {
    articles,
    loading,
    error,
    pagination,
    fetchArticles,
    loadMore,
    markRead,
    toggleSave,
  };
}

export default useArticles;
