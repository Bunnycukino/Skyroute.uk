/**
 * Central API Export
 * 
 * This file provides a single import point for all API functionality
 * Usage: import { c209Api, authApi, useDashboard } from '@/api';
 */

import { c209Api, c208Api, dashboardApi } from './c209Api';
import authApi from './authApi';
import { useState, useEffect, useCallback } from 'react';

// Export all APIs
export { c209Api, c208Api, dashboardApi, authApi };

/**
 * Custom React Hooks for API calls
 */

/**
 * Hook for fetching C209 entries
 */
export const useC209Entries = (options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await c209Api.getAll(options);
        if (result.success) {
          setData(result.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refresh, JSON.stringify(options)]);

  const refetch = useCallback(() => setRefresh(r => r + 1), []);

  return { data, loading, error, refetch };
};

/**
 * Hook for fetching C208 entries
 */
export const useC208Entries = (options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await c208Api.getAll(options);
        if (result.success) {
          setData(result.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refresh, JSON.stringify(options)]);

  const refetch = useCallback(() => setRefresh(r => r + 1), []);

  return { data, loading, error, refetch };
};

/**
 * Hook for dashboard statistics
 */
export const useDashboard = () => {
  const [stats, setStats] = useState({
    totalC209: 0,
    totalC208: 0,
    pending: 0,
    completed: 0,
    expired: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await dashboardApi.getStats();
        if (result.success) {
          setStats(result.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [refresh]);

  const refetch = useCallback(() => setRefresh(r => r + 1), []);

  return { stats, loading, error, refetch };
};

/**
 * Hook for combined log
 */
export const useCombinedLog = (options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await dashboardApi.getCombinedLog(options);
        if (result.success) {
          setData(result.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refresh, JSON.stringify(options)]);

  const refetch = useCallback(() => setRefresh(r => r + 1), []);

  return { data, loading, error, refetch };
};

/**
 * Hook for authentication status
 */
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const session = authApi.getCurrentSession();
    if (session.success && session.data) {
      setIsAuthenticated(true);
      setUser(session.data);
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const result = await authApi.login(email, password);
      if (result.success) {
        setIsAuthenticated(true);
        setUser(result.data);
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    authApi.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  const register = async (userData) => {
    try {
      const result = await authApi.register(userData);
      if (result.success) {
        // Auto login after registration
        return await login(userData.email, userData.password);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return { 
    isAuthenticated, 
    user, 
    loading, 
    login, 
    logout, 
    register,
    checkAuth 
  };
};

/**
 * Hook for expired entries monitoring
 */
export const useExpiredEntries = () => {
  const [expired, setExpired] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkExpired = async () => {
      setLoading(true);
      try {
        const result = await c209Api.getExpired();
        if (result.success) {
          setExpired(result.data);
          setCount(result.count);
        }
      } catch (error) {
        console.error('Expired check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkExpired();
    // Check every 5 minutes
    const interval = setInterval(checkExpired, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { expired, count, loading };
};

// Default export
export default {
  c209: c209Api,
  c208: c208Api,
  dashboard: dashboardApi,
  auth: authApi,
  hooks: {
    useC209Entries,
    useC208Entries,
    useDashboard,
    useCombinedLog,
    useAuth,
    useExpiredEntries
  }
};