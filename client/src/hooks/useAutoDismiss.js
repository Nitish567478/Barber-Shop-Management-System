import { useEffect } from 'react';

/**
 * Automatically clears an error or success message after a given delay (default 4000ms).
 * @param {*} message - The current message (string, boolean, or object).
 * @param {Function} clearFn - State setter to clear the message (e.g. setError, setSuccess).
 * @param {number} delay - Time in milliseconds before auto-clearing (default 4000).
 * @param {*} clearValue - The value to pass to clearFn (default '').
 */
export const useAutoDismiss = (message, clearFn, delay = 4000, clearValue = '') => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (typeof clearFn === 'function') {
        clearFn(clearValue);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [message, clearFn, delay, clearValue]);
};

export default useAutoDismiss;
