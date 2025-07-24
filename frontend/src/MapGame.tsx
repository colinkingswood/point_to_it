import React, { useState, useEffect } from 'react';
import geoData from '../data/world-countries-sans-antarctica.json';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

function getCountryFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get('country');
}

function getCentroid(geo: any): [number, number] {
  if (geo && geo.geometry && geo.geometry.coordinates) {
    let coords = geo.geometry.coordinates;
    if (geo.geometry.type === 'MultiPolygon') {
      coords = coords.flat(2);
    } else if (geo.geometry.type === 'Polygon') {
      coords = coords[0];
    }
    const n = coords.length;
    if (n === 0) return [0, 0];
    const sum = coords.reduce((acc: [number, number], c: [number, number]) => [acc[0] + c[0], acc[1] + c[1]], [0, 0]);
    return [sum[0] / n, sum[1] / n];
  }
  return [0, 0];
}

function haversineDistance([lon1, lat1]: [number, number], [lon2, lat2]: [number, number]) {
  const toRad = (deg: number) => deg * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function PanZoomControls({ onZoomIn, onZoomOut, onPan }: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPan: (dx: number, dy: number) => void;
}) {
  const btnStyle = {
    padding: '2px 8px',
    fontSize: '1.1em',
    margin: '0 2px',
    minWidth: 0,
    minHeight: 0,
    lineHeight: 1.2,
    borderRadius: 4,
    border: '1px solid #ccc',
    background: '#f5f5f5',
    cursor: 'pointer',
  } as React.CSSProperties;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', margin: '12px 0' }}>
      <button style={btnStyle} onClick={onZoomIn} title="Zoom In">🔍➕</button>
      <button style={btnStyle} onClick={onZoomOut} title="Zoom Out">🔍➖</button>
      <div style={{ display: 'inline-flex', flexDirection: 'column', marginLeft: 8 }}>
        <button style={btnStyle} onClick={() => onPan(0, 10)} title="Pan up">⬆️</button>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button style={btnStyle} onClick={() => onPan(-20, 0)} title="Pan left">⬅️</button>
          <button style={btnStyle} onClick={() => onPan(20, 0)} title="Pan right">➡️</button>
        </div>
        <button style={btnStyle} onClick={() => onPan(0, -10)} title="Pan down">⬇️</button>
      </div>
    </div>
  );
}

const MapGame: React.FC = () => {
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 0]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [geographies, setGeographies] = useState<any[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    setSelectedCountry(getCountryFromQuery());
  }, []);

  const handleGeographies = ({ geographies }: { geographies: any[] }) => {
    setGeographies(geographies);
    return geographies.map((geo: any) => (
      <Geography
        key={geo.rsmKey}
        geography={geo}
        onClick={(event) => handleMapClick(event, geo)}
        style={{
          default: { fill: "#D6D6DA", outline: "none" },
          hover: { fill: "#D6D6DA", outline: "none" },
          pressed: { fill: "#D6D6DA", outline: "none" },
        }}
      />
    ));
  };

  const handleMapClick = (
    event: React.MouseEvent<SVGPathElement, globalThis.MouseEvent>,
    geo: any
  ) => {
    if (!selectedCountry) return;
    setAttempts(a => a + 1);
    const clicked = geo.properties.name;
    if (clicked.toLowerCase() === selectedCountry.toLowerCase()) {
      setResult('Correct!');
    } else {
      const correctGeo = geographies.find(g => g.properties.name.toLowerCase() === selectedCountry.toLowerCase());
      if (correctGeo) {
        const clickedCentroid = getCentroid(geo);
        const correctCentroid = getCentroid(correctGeo);
        const dist = haversineDistance(clickedCentroid, correctCentroid);
        setResult(`Incorrect. You were ${dist.toFixed(0)} km away.`);
      } else {
        setResult('Country not found in map data.');
      }
    }
    setShowPopup(true);
  };

  const handleTryAgain = () => {
    setResult(null);
    setShowPopup(false);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.5, 8));
  const handleZoomOut = () => setZoom((z) => Math.max(z / 1.5, 1));
  const PAN_STEP = 20;
  const handlePan = (dx: number, dy: number) => {
    setCenter(([lng, lat]) => [lng + dx, Math.max(Math.min(lat + dy, 90), -90)]);
  };

  return (
    <div style={{ width: '100vw', margin: '0 auto' }}>
      <h1>Can you point to it on a map?</h1>
      {selectedCountry && (
        <div style={{ margin: '12px 0', fontSize: '1.2em', fontWeight: 500 }}>
          Find: <span style={{ color: '#2a5d9f' }}>{selectedCountry}</span>
        </div>
      )}
      <div style={{ marginBottom: 12, fontSize: '1em', color: '#444' }}>
        Attempts: {attempts}
      </div>
      <div style={{ position: 'relative', width: '100%', maxWidth: '1600px', margin: '0 auto', paddingBottom: '30%', maxHeight: '70vh', minHeight: 300, overflow: 'hidden' }}>
        <ComposableMap
          projection="geoEqualEarth"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        >
          <ZoomableGroup zoom={zoom} center={center}>
            <Geographies geography={geoData}>
              {handleGeographies}
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>
      <PanZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onPan={handlePan} />
      {showPopup && result && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#232946',
            padding: 32,
            borderRadius: 12,
            boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
            minWidth: 320,
            textAlign: 'center',
            color: '#fff',
          }}>
            <h2 style={{ marginTop: 0, color: result.startsWith('Correct') ? '#38e54d' : '#ff595e' }}>
              {result.startsWith('Correct') ? '🎉 Correct!' : '❌ Incorrect'}
            </h2>
            <div style={{ margin: '16px 0', fontSize: '1.1em', color: '#fff' }}>{result}</div>
            <button onClick={handleTryAgain} style={{
              background: '#2a5d9f',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '8px 18px',
              fontSize: '1em',
              fontWeight: 500,
              cursor: 'pointer',
              marginTop: 8,
            }}>
              Try Again
            </button>
          </div>
        </div>
      )}
      <p>Click the country you think is correct!</p>
    </div>
  );
};

export default MapGame; 