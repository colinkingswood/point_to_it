import React, { useState } from 'react';
import geoData from '../data/world-countries-sans-antarctica.json';
import { Link } from 'react-router-dom';

function CountryList() {
  // Find the first object with a geometries array in the TopoJSON
  const objects = geoData.objects;
  const geometries = Object.values(objects).find((obj: any) => Array.isArray(obj.geometries));
  const countries = geometries ? geometries.geometries.map((g: any) => g.properties.name).sort() : [];
  const [popup, setPopup] = useState<string | null>(null);

  const handleGenerateLink = (country: string) => {
    // Generate a link to /play?country=COUNTRY_NAME
    const url = `${window.location.origin}/play?country=${encodeURIComponent(country)}`;
    setPopup(url);
  };

  const handleClosePopup = () => setPopup(null);

  return (
    <div style={{
      minHeight: '80vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <div style={{
        padding: 32,
        maxWidth: 600,
        width: '100%',
        border: '1px solid #d0d0d0',
        borderRadius: 12,
        background: '#f9fafb',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        color: '#222',
        margin: '0 auto',
      }}>
        <h1 style={{ textAlign: 'center', marginTop: 0 }}>Country List</h1>
        <p style={{ textAlign: 'center' }}>Click a country to generate a shareable game link.</p>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {countries.map((country: string) => (
            <li key={country} style={{ margin: '8px 0', display: 'flex', alignItems: 'center' }}>
              <span style={{ flex: 1 }}>{country}</span>
              <Link
                to={`/play?country=${encodeURIComponent(country)}`}
                style={{
                  marginLeft: 8,
                  textDecoration: 'none',
                  color: '#fff',
                  fontWeight: 500,
                  background: '#2a5d9f',
                  border: 'none',
                  borderRadius: 4,
                  padding: '6px 14px',
                  fontSize: '1em',
                  cursor: 'pointer',
                  display: 'inline-block',
                  transition: 'background 0.2s',
                }}
              >
                Go to Map
              </Link>
              <button onClick={() => handleGenerateLink(country)} style={{
                marginLeft: 8,
                background: '#2a5d9f',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '6px 14px',
                fontSize: '1em',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}>
                Generate Link
              </button>
            </li>
          ))}
        </ul>
        {popup && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', minWidth: 300 }}>
              <h2>Shareable Link</h2>
              <input type="text" value={popup} readOnly style={{ width: '100%', marginBottom: 12, fontSize: '1em' }} onFocus={e => e.target.select()} />
              <button onClick={() => { navigator.clipboard.writeText(popup); }}>Copy to Clipboard</button>
              <button onClick={handleClosePopup} style={{ marginLeft: 8 }}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CountryList; 