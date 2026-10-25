import { useState } from 'react';

// A baseline map with toggleable layers. render(on) draws the SVG for the layers that are on;
// layers: [{ id, label, note }]; legend: [{ color, label }] for the land-cover classes.
export function LayerMap({ layers, legend, render, initial }) {
  const [on, setOn] = useState(() => Object.fromEntries((initial || layers.map((l) => l.id)).map((id) => [id, true])));
  return (
    <div className="layermap">
      <div className="layermap__map">{render(on)}</div>
      <div className="layermap__side">
        <div className="riskmap__toggles">
          {layers.map((l) => (
            <button
              key={l.id}
              type="button"
              className={`timechip ${on[l.id] ? 'is-on' : ''}`}
              aria-pressed={Boolean(on[l.id])}
              onClick={() => setOn((s) => ({ ...s, [l.id]: !s[l.id] }))}
            >
              {l.label}
            </button>
          ))}
        </div>
        <ul className="riskmap__notes">
          {layers
            .filter((l) => on[l.id])
            .map((l) => (
              <li key={l.id}>
                <span className="label">{l.label}</span> {l.note}
              </li>
            ))}
        </ul>
        {legend && on.landcover && (
          <ul className="layermap__legend">
            {legend.map((x) => (
              <li key={x.label}>
                <span className="layermap__swatch" style={{ background: x.color }} />
                {x.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ESA WorldCover 2021, simplified to five classes (shared colours).
export const COVER = {
  trees: 'color-mix(in srgb, var(--veg) 55%, var(--ink))',
  grass: 'color-mix(in srgb, var(--warning) 45%, var(--veg))',
  crop: 'color-mix(in srgb, var(--soil) 55%, var(--tag))',
  built: 'color-mix(in srgb, var(--faint) 55%, var(--bg))',
  bare: 'color-mix(in srgb, var(--soil) 70%, var(--ink))',
  water: 'var(--water)',
};
export const COVER_NOTE = 'ESA WorldCover 2021, simplified to five classes. A starting condition, not a prediction.';
