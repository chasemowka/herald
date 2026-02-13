import { useState, useCallback } from 'react';
import api from '../api/client';

export function useTopics() {
  const [allTopics, setAllTopics] = useState([]);
  const [userTopics, setUserTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/topics');
      setAllTopics(response.topics || response);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserTopics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/user/topics');
      setUserTopics(response.topics || response);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserTopics = useCallback(async (topicIds) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.put('/user/topics', { topic_ids: topicIds });
      setUserTopics(response.topics || topicIds);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    allTopics,
    userTopics,
    loading,
    error,
    fetchTopics,
    fetchUserTopics,
    updateUserTopics,
  };
}

export default useTopics;
