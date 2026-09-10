import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';

export function useArticleAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async (articleId) => {
    if (!articleId) return;
    setLoading(true);
    setError(null);
    try {
      // Read active session credentials to authenticate seamlessly with edge function
      let userIndex = null;
      let userId = null;
      try {
        const raw = sessionStorage.getItem('icmu_session') || localStorage.getItem('icmu_session');
        if (raw) {
          const s = JSON.parse(raw);
          userIndex = s.indexNumber || s.index_number || null;
          userId = s.id || null;
        }
      } catch (_) {}

      const headers = {};
      if (userIndex) {
        headers['x-user-index'] = userIndex.toString();
      }

      const { data, error: fnError } = await supabase.functions.invoke('get-ga4-metrics', {
        headers,
        body: {
          articleId,
          userIndex,
          userId,
        },
      });
      if (fnError) {
        console.warn('[GA4 Analytics] Invoke returned error:', fnError);
        throw fnError;
      }
      if (data?.error) {
        console.warn('[GA4 Analytics] Edge function returned error:', data.error, data.details);
        throw new Error(data.error);
      }
      setAnalytics(data);
      return data;
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err.message || 'Analytics unavailable');
      // Return fallback data so UI still renders
      const fallback = { views: 0, users: 0, avgSessionDuration: 0, deviceBreakdown: { mobile: 0, desktop: 0, tablet: 0 }, configured: false };
      setAnalytics(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAnalytics = useCallback(() => {
    setAnalytics(null);
    setError(null);
  }, []);

  return { analytics, loading, error, fetchAnalytics, clearAnalytics };
}
