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
      const { data, error: fnError } = await supabase.functions.invoke('get-ga4-metrics', {
        body: { articleId },
      });
      if (fnError) throw fnError;
      setAnalytics(data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err.message);
      // Return fallback data so UI still renders
      setAnalytics({ views: 0, users: 0, avgSessionDuration: 0, deviceBreakdown: { mobile: 0, desktop: 0, tablet: 0 }, configured: false });
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
