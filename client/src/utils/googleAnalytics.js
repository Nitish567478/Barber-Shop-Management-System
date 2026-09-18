/**
 * Google Analytics 4 (GA4) & Activity Tracking Utility
 * Enables real-time Google Activity tracking for trending, page visits, searches, and bookings.
 */

export const GA_MEASUREMENT_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-BV6Q3B8L5P';

/**
 * Send a custom event to Google Analytics / Google Tag
 * @param {string} eventName - e.g. 'page_view', 'booking_started', 'booking_confirmed', 'search_barber'
 * @param {Object} eventParams - additional metadata
 */
export const trackEvent = (eventName, eventParams = {}) => {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        ...eventParams,
        send_to: GA_MEASUREMENT_ID,
      });
    }
  } catch {
    // Fail silently in development/offline
  }
};

/**
 * Track route / page view in Google Activity
 * @param {string} path - current pathname
 * @param {string} title - document title
 */
export const trackPageView = (path, title) => {
  trackEvent('page_view', {
    page_path: path,
    page_title: title,
    page_location: typeof window !== 'undefined' ? window.location.href : '',
  });
};

/**
 * Track when a user books an appointment
 * @param {Object} details - appointment details
 */
export const trackBookingConfirmed = (details = {}) => {
  trackEvent('purchase', {
    transaction_id: details.id || `apt_${Date.now()}`,
    value: Number(details.price || 0),
    currency: 'INR',
    items: [
      {
        item_name: details.serviceName || 'Grooming Service',
        item_category: 'Barber Services',
        price: Number(details.price || 0),
        quantity: 1,
      },
    ],
  });
};

/**
 * Track when a user initiates a direct phone call to a salon
 * @param {string} shopName - name of the shop or barber
 * @param {string} phone - phone number called
 */
export const trackDirectCall = (shopName, phone) => {
  trackEvent('contact_barber_call', {
    shop_name: shopName,
    phone_number: phone,
  });
};
