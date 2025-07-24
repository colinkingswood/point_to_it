import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import type { MouseEvent } from 'react';
import { useState, useEffect } from 'react';
import geoData from '../data/world-countries-sans-antarctica.json';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import CountryList from './CountryList';
import MapGame from './MapGame';

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

// Helper to get query param
function getCountryFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get('country');
}

function App() {
  return (
    <BrowserRouter>
      {/* Menu bar removed */}
      <Routes>
        <Route path="/" element={<CountryList />} />
        <Route path="/play" element={<MapGame />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
