import React, { memo, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Fix default marker icons (CRA + Leaflet quirk)
import icon2x from "leaflet/dist/images/marker-icon-2x.png";
import icon1x from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";
const DefaultIcon = L.icon({ iconUrl: icon1x, iconRetinaUrl: icon2x, shadowUrl: shadow, iconSize:[25,41], iconAnchor:[12,41] });
L.Marker.prototype.options.icon = DefaultIcon;

// Click-capture helper
function MapClicker({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function MapView({
  center,
  zoom = 13,
  userPos,
  markers = [],            // [{id, lat, lng, label}]
  routeCoords = [],        // [{lat, lng}, ...]
  geofence = null,         // { center:{lat,lng}, radius }
  onMapClick,
}) {
  const poly = useMemo(() => routeCoords.map((p) => [p.lat, p.lng]), [routeCoords]);

  return (
    <MapContainer center={[center.lat, center.lng]} zoom={zoom} className="map-wrap" scrollWheelZoom>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userPos && (
        <Marker position={[userPos.lat, userPos.lng]}>
          <Popup>Your location</Popup>
        </Marker>
      )}

      {markers.map((m) => (
        <Marker key={m.id} position={[m.lat, m.lng]}>
          <Popup>{m.label || "Location"}</Popup>
        </Marker>
      ))}

      {poly.length > 1 && <Polyline positions={poly} />}

      {geofence && (
        <Circle
          center={[geofence.center.lat, geofence.center.lng]}
          radius={geofence.radius}
          pathOptions={{ color: "#ef4444" }}
        />
      )}

      <MapClicker onMapClick={onMapClick} />
    </MapContainer>
  );
}

export default memo(MapView);
