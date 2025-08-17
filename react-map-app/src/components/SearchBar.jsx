import React, { memo, useEffect, useMemo, useState, useCallback } from "react";

// Simple address search using Nominatim
async function geocode(q) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  const data = await res.json();
  return data.slice(0, 6).map((d) => ({
    label: d.display_name,
    lat: Number(d.lat),
    lng: Number(d.lon),
  }));
}

function SearchBar({ onPick }) {
  const [q, setQ] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debounced fetch
  useEffect(() => {
    if (!q.trim()) { setList([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try { setList(await geocode(q)); } finally { setLoading(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [q]);

  const pick = useCallback((item) => {
    onPick?.(item);
    setQ(item.label);
    setList([]);
  }, [onPick]);

  return (
    <div>
      <div className="section-title">Address Search</div>
      <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search address/place" />
      {loading && <div className="small">Searching…</div>}
      {list.map((it) => (
        <div key={`${it.lat}${it.lng}`} className="poi-item" onClick={() => pick(it)} style={{cursor:'pointer'}}>
          {it.label}
          <div className="small">{it.lat.toFixed(4)}, {it.lng.toFixed(4)}</div>
        </div>
      ))}
    </div>
  );
}

export default memo(SearchBar);
