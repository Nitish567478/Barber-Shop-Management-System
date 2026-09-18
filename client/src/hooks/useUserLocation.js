import { useState, useEffect, useCallback } from 'react';

const KNOWN_COORDINATES = {
  argora: { name: 'Argora', lat: 23.3512, lng: 85.3021 },
  ranchi: { name: 'Ranchi', lat: 23.3441, lng: 85.3096 },
  giridih: { name: 'Giridih', lat: 24.1856, lng: 86.3056 },
  patna: { name: 'Patna', lat: 25.5941, lng: 85.1376 },
  dhanbad: { name: 'Dhanbad', lat: 23.7957, lng: 86.4304 },
  jamshedpur: { name: 'Jamshedpur', lat: 22.8046, lng: 86.2029 },
  bokaro: { name: 'Bokaro', lat: 23.6693, lng: 86.1511 },
  delhi: { name: 'Delhi', lat: 28.6139, lng: 77.209 },
  mumbai: { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
  bengaluru: { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
};

function findNearestCity(lat, lng) {
  let nearest = null;
  let minDistance = Infinity;

  for (const item of Object.values(KNOWN_COORDINATES)) {
    const dLat = ((item.lat - lat) * Math.PI) / 180;
    const dLon = ((item.lng - lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((item.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const distKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    if (distKm < minDistance) {
      minDistance = distKm;
      nearest = item.name;
    }
  }

  // Within 50km
  return minDistance <= 50 ? nearest : null;
}

export function useUserLocation() {
  const [currentCity, setCurrentCity] = useState(() => {
    return sessionStorage.getItem('userCurrentCity') || localStorage.getItem('userCurrentCity') || '';
  });
  const [userCoords, setUserCoords] = useState(null);
  const [locationStatus, setLocationStatus] = useState(() => {
    const saved = sessionStorage.getItem('userCurrentCity') || localStorage.getItem('userCurrentCity');
    return saved ? 'detected' : 'requesting';
  });

  const setManualCity = useCallback((city) => {
    if (!city) return;
    const formatted = city.trim();
    setCurrentCity(formatted);
    setLocationStatus('detected');
    sessionStorage.setItem('userCurrentCity', formatted);
    localStorage.setItem('userCurrentCity', formatted);
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      if (!currentCity) {
        setLocationStatus('denied');
      }
      return;
    }

    setLocationStatus('requesting');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });

        let city = findNearestCity(latitude, longitude);

        if (!city) {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
              { signal: AbortSignal.timeout(3500) }
            );
            const data = await res.json();
            city =
              data.address?.city ||
              data.address?.town ||
              data.address?.suburb ||
              data.address?.state_district ||
              '';
          } catch {
            // Ignored
          }
        }

        if (city) {
          const trimmed = city.trim();
          setCurrentCity(trimmed);
          setLocationStatus('detected');
          sessionStorage.setItem('userCurrentCity', trimmed);
          localStorage.setItem('userCurrentCity', trimmed);
        } else if (!currentCity) {
          setLocationStatus('denied');
        }
      },
      (err) => {
        console.warn('Geolocation access denied or timed out:', err.message);
        if (!currentCity) {
          setLocationStatus('denied');
        }
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  }, [currentCity]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return {
    currentCity,
    userCoords,
    locationStatus,
    requestLocation,
    setManualCity,
  };
}

export default useUserLocation;
