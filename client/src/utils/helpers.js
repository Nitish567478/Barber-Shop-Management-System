/**
 * Format currency values for INR
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount = 0) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} format - 'long', 'short', or 'time'
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'long') => {
  if (!date) return 'N/A';
  
  const dateObj = new Date(date);
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: '2-digit'
      });
    case 'time':
      return dateObj.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    case 'long':
    default:
      return dateObj.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
  }
};

/**
 * Calculate growth rate between two values
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {number} Growth rate percentage
 */
export const calculateGrowthRate = (current = 0, previous = 0) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Group data by month
 * @param {array} data - Array of objects with date field
 * @param {string} dateField - Field name containing the date
 * @returns {object} Grouped data by month with sum
 */
export const groupByMonth = (data = [], dateField = 'createdAt') => {
  const grouped = {};

  data.forEach(item => {
    const date = new Date(item[dateField]);
    const monthKey = date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short'
    });

    if (!grouped[monthKey]) {
      grouped[monthKey] = 0;
    }

    grouped[monthKey] += item.amount || 1;
  });

  return grouped;
};

/**
 * Get chart colors palette
 * @param {number} count - Number of colors needed
 * @returns {array} Array of color hex codes
 */
export const getChartColors = (count = 1) => {
  const colors = [
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#f43f5e', // rose
    '#f97316', // orange
    '#eab308', // yellow
    '#84cc16', // lime
    '#22c55e', // green
    '#10b981', // emerald
    '#14b8a6', // teal
    '#06b6d4', // cyan
    '#0ea5e9', // sky
    '#3b82f6', // blue
  ];

  if (count > colors.length) {
    return colors;
  }

  return colors.slice(0, count);
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Max length
 * @returns {string} Truncated text with ellipsis
 */
export const truncateText = (text = '', length = 50) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Calculate percentage
 * @param {number} value - The value
 * @param {number} total - The total
 * @returns {number} Percentage
 */
export const calculatePercentage = (value = 0, total = 0) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Get time ago string
 * @param {string|Date} date - Date to compare
 * @returns {string} Time ago string
 */
export const getTimeAgo = (date) => {
  const now = new Date();
  const dateObj = new Date(date);
  const seconds = Math.floor((now - dateObj) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';

  return Math.floor(seconds) + ' seconds ago';
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email = '') => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validate phone number (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid phone
 */
export const isValidPhone = (phone = '') => {
  const regex = /^[6-9]\d{9}$/;
  return regex.test(phone.replace(/\D/g, ''));
};
