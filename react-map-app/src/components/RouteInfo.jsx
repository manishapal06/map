import React, { memo } from "react";

function RouteInfo({ distance, duration }) {
  if (!distance) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div className="section-title">Route</div>
      <div className="badge green">Distance: {(distance/1000).toFixed(2)} km</div>{" "}
      <span className="badge green">ETA: {(duration/60).toFixed(0)} min</span>
    </div>
  );
}
export default memo(RouteInfo);
