import { useEffect, useRef, useState, useCallback } from "react";

// Watch user's location with start/stop controls
export default function useGeolocation(options = { enableHighAccuracy: true, maximumAge: 5000 }) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef(null);

  const stop = useCallback(() => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  const start = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported");
      return;
    }
    if (watchIdRef.current != null) return;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setError(null);
      },
      (err) => setError(err.message || "Geolocation error"),
      options
    );
    setIsTracking(true);
  }, [options]);

  useEffect(() => () => stop(), [stop]);

  return { position, error, isTracking, start, stop };
}
