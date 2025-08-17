import React, { memo, useEffect, useState } from "react";

// POI search with Overpass API (amenity around center within radius)
async function searchPOI({ lat, lng, keyword = "restaurant", radius = 1000 }) {
  const query = `
    [out:json][timeout:10];
    nwr(around:${radius},${lat},${lng})[name][~"${keyword}"~".",i];
    out center 25;
  `;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query,
  });
  const data = await res.json();
  const feats = (data.elements || []).slice(0, 25);
  return feats.map((e, i) => ({
    id: e.id || i,
    lat: e.lat ?? e.center?.lat,
    lng: e.lon ?? e.center?.lon,
    label: e.tags?.name || "(no name)",
    type: e.type,
  })).filter((x) => x.lat && x.lng);
}

function PoiList({ center, onSelect }) {
  const [kw, setKw] = useState("cafe");
  const [radius, setRadius] = useState(1000);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!center) return;
    setLoading(true);
    try { setList(await searchPOI({ ...center, keyword: kw, radius })); }
    finally { setLoading(false); }
  };

  useEffect(() => { /* no auto run */ }, []);

  return (
    <div>
      <div className="section-title">POI Search</div>
      <input className="input" value={kw} onChange={(e)=>setKw(e.target.value)} placeholder="keyword e.g., hospital, atm" />
      <input className="input" type="number" value={radius} onChange={(e)=>setRadius(Number(e.target.value))} placeholder="radius meters" />
      <button className="btn secondary" onClick={run}>Search POI</button>
      {loading && <div className="small">Searching…</div>}
      {list.map((p) => (
        <div key={p.id} className="poi-item" onClick={()=>onSelect?.(p)} style={{cursor:'pointer'}}>
          <div>{p.label}</div>
          <div className="small">{p.lat.toFixed(4)}, {p.lng.toFixed(4)}</div>
        </div>
      ))}
    </div>
  );
}

export default memo(PoiList);
