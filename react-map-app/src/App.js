import React, { useCallback, useMemo, useState } from "react";
import MapView from "./components/MapView";
import SearchBar from "./components/SearchBar";
import PoiList from "./components/PoiList";
import RouteInfo from "./components/RouteInfo";
import useGeolocation from "./hooks/useGeoLocation";
import { insideCircle } from "./utils/geo";

// OSRM routing (free public server)
async function fetchRoute(from, to) {
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  const data = await res.json();
  const r = data.routes?.[0];
  return r
    ? {
        coords: r.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })),
        distance: r.distance,
        duration: r.duration,
      }
    : { coords: [], distance: 0, duration: 0 };
}

export default function App() {
  // Map center (default Delhi)
  const [center, setCenter] = useState({ lat: 28.6139, lng: 77.2090 });

  // Address picks and markers
  const [markers, setMarkers] = useState([]);

  // Routing
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [route, setRoute] = useState({ coords: [], distance: 0, duration: 0 });

  // Geofencing
  const [geofence, setGeofence] = useState(null); // {center, radius}
  const [inFence, setInFence] = useState(null);

  // Live location
  const { position: userPos, isTracking, start, stop, error: geoError } = useGeolocation();

  // Handlers kept stable (useCallback) to avoid child re-renders
  const onAddressPick = useCallback((place) => {
    setCenter({ lat: place.lat, lng: place.lng });
    setMarkers((m) => [{ id: Date.now(), lat: place.lat, lng: place.lng, label: place.label }, ...m]);
  }, []);

  const onPoiPick = useCallback((poi) => {
    setCenter({ lat: poi.lat, lng: poi.lng });
    setMarkers((m) => [{ id: poi.id, lat: poi.lat, lng: poi.lng, label: poi.label }, ...m]);
  }, []);

  const planFrom = useCallback((place) => setFrom({ lat: place.lat, lng: place.lng }), []);
  const planTo   = useCallback((place) => setTo({ lat: place.lat, lng: place.lng }), []);

  const computeRoute = useCallback(async () => {
    if (!from || !to) return;
    const r = await fetchRoute(from, to);
    setRoute(r);
  }, [from, to]);

  const onMapClick = useCallback((p) => {
    // Quick set geofence center on map click if geofence already exists
    if (geofence) setGeofence((g) => ({ ...g, center: p }));
  }, [geofence]);

  // Geofence status (memoized computation)
  useMemo(() => {
    if (!geofence || !userPos) return;
    const inside = insideCircle(userPos, geofence.center, geofence.radius);
    if (inFence === null) setInFence(inside);
    else if (inside !== inFence) {
      setInFence(inside);
      alert(inside ? "Entered geofence ✅" : "Exited geofence ⚠️");
    }
  }, [userPos, geofence, inFence]);

  // Derived markers: user + chosen points
  const mapMarkers = useMemo(() => markers, [markers]);

  // Weather (optional tiny integration via Open-Meteo)
  const [weather, setWeather] = useState(null);
  const loadWeather = useCallback(async () => {
    const c = userPos || center;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lng}&current=temperature_2m,wind_speed_10m`;
    const res = await fetch(url);
    const data = await res.json();
    setWeather(data.current ? { t: data.current.temperature_2m, w: data.current.wind_speed_10m } : null);
  }, [userPos, center]);

  return (
    <div className="app">
      {/* ==== TOP BAR ==== */}
      <div className="topbar">
        <div className="row">
          <div><span className="section-title">React Map App</span></div>

          <div>
            <div className="section-title">Tracking</div>
            <button className="btn" onClick={start} disabled={isTracking}>Start</button>{" "}
            <button className="btn warn" onClick={stop} disabled={!isTracking}>Stop</button>
            {geoError && <div className="small">{geoError}</div>}
            {userPos && (
              <div className="small">You: {userPos.lat.toFixed(4)}, {userPos.lng.toFixed(4)}</div>
            )}
          </div>

          <div>
            <div className="section-title">Geofence</div>
            <button
              className="btn secondary"
              onClick={() => setGeofence({ center: userPos || center, radius: 400 })}
            >
              Set at {userPos ? "My Location" : "Center"} (400m)
            </button>
            {geofence && (
              <div className="small">
                Center: {geofence.center.lat.toFixed(3)}, {geofence.center.lng.toFixed(3)} — {geofence.radius}m
                <br />
                Status:{" "}
                <span className={`badge ${inFence ? "green" : "red"}`}>
                  {inFence ? "Inside" : "Outside"}
                </span>
              </div>
            )}
          </div>

          <div>
            <div className="section-title">Weather</div>
            <button className="btn" onClick={loadWeather}>Get Weather</button>
            {weather && (
              <div className="small">Temp: {weather.t}°C, Wind: {weather.w} m/s</div>
            )}
          </div>
        </div>

        <div className="row">
          {/* Address search that also lets you set From/To for routing */}
          <div>
            <SearchBar onPick={onAddressPick} />
            <div className="row">
              <button className="btn secondary" onClick={() => from && setCenter(from)} disabled={!from}>Center From</button>
              <button className="btn secondary" onClick={() => to && setCenter(to)} disabled={!to}>Center To</button>
            </div>
          </div>

          <div>
            <div className="section-title">Set Route</div>
            <div className="small">Click suggestions below to set “From” and “To”.</div>
            <div className="row">
              <SearchBar onPick={planFrom} />
              <SearchBar onPick={planTo} />
            </div>
            <button className="btn" onClick={computeRoute} disabled={!from || !to}>Plan Route</button>
            <RouteInfo distance={route.distance} duration={route.duration} />
          </div>

          <div>
            <PoiList center={center} onSelect={onPoiPick} />
          </div>
        </div>
      </div>

      {/* ==== MAP + SIDE PANEL ==== */}
      <div className="main">
        <MapView
          center={center}
          userPos={userPos}
          markers={mapMarkers}
          routeCoords={route.coords}
          geofence={geofence}
          onMapClick={onMapClick}
        />
        <div className="panel">
          <div className="section-title">Tips</div>
          <ul style={{margin:0, paddingLeft:18}}>
            <li>Use “Start” to track location in real time.</li>
            <li>Use Address Search to jump the map and drop markers.</li>
            <li>Use the two search boxes to set <b>From</b> and <b>To</b>, then “Plan Route”.</li>
            <li>Set a Geofence then walk around — you’ll get enter/exit alerts.</li>
            <li>Click the map to move geofence center when active.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
