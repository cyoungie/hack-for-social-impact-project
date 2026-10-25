import { COVER } from '../../components/LayerMap.jsx';

// The six streets below the hill, with the plant, the base and the fuel tanks above,
// and a cutaway of the aquifer under all of it (400x300 units). Fictional town.
export const STREETS = [
  { id: 'a', name: 'Mango St', x: 60, y: 150, six: true },
  { id: 'b', name: 'Harbor Rd', x: 60, y: 176, six: true },
  { id: 'c', name: 'Pier Ln', x: 60, y: 202, six: true },
  { id: 'd', name: 'Coral Ave', x: 190, y: 150, six: true },
  { id: 'e', name: 'Shell St', x: 190, y: 176, six: true },
  { id: 'f', name: 'Market St', x: 190, y: 202, six: true },
  { id: 'g', name: 'Beach Rd', x: 320, y: 176, six: false },
  { id: 'h', name: 'School Ln', x: 320, y: 202, six: false },
];

// on: { landcover, wells } ; frame (outlook): { wellOpen, found, safe }; pins: { streetId: count }
export default function TownMap({ on = { landcover: true }, frame, pins, cluster = false, label }) {
  return (
    <svg className="vmap" viewBox="0 0 400 300" role="img" aria-label={label || 'Map of the six streets below the hill'}>
      <rect x="0" y="0" width="400" height="135" fill={on.landcover ? COVER.trees : 'color-mix(in srgb, var(--veg) 40%, var(--panel))'} />
      <rect x="40" y="20" width="110" height="60" fill={on.landcover ? COVER.built : 'var(--postcard)'} stroke="var(--ink)" />
      <text x="48" y="36" className="vm-label">THE PLANT</text>
      <rect x="230" y="14" width="140" height="70" fill={on.landcover ? COVER.built : 'var(--postcard)'} stroke="var(--ink)" />
      <text x="238" y="30" className="vm-label">THE BASE</text>
      {[170, 192, 214].map((x) => (
        <rect key={x} x={x} y="92" width="16" height="16" fill={frame?.found && frame.year >= 4 ? 'var(--select)' : 'color-mix(in srgb, var(--faint) 60%, var(--ink))'} stroke="var(--ink)" />
      ))}
      <text x="164" y="124" className="vm-label vm-label--light">FUEL TANKS</text>
      <rect x="0" y="135" width="400" height="95" fill={on.landcover ? COVER.grass : 'color-mix(in srgb, var(--veg) 30%, var(--panel))'} />
      {cluster && <rect x="40" y="140" width="260" height="76" fill="var(--danger)" opacity="0.25" />}
      {STREETS.map((s) => (
        <g key={s.id}>
          <rect x={s.x - 20} y={s.y - 8} width="110" height="10" fill="color-mix(in srgb, var(--faint) 55%, var(--ink))" />
          <text x={s.x - 18} y={s.y - 11} className="vm-label">{s.name.toUpperCase()}</text>
          {pins?.[s.id] > 0 && (
            <g>
              {Array.from({ length: pins[s.id] }, (_, i) => (
                <rect key={i} x={s.x + i * 9} y={s.y - 6} width="7" height="7" fill="var(--danger)" stroke="var(--ink)" />
              ))}
            </g>
          )}
        </g>
      ))}
      <rect x="372" y="96" width="22" height="20" fill={frame?.wellOpen ? 'var(--select)' : 'var(--postcard)'} stroke="var(--ink)" />
      <text x="282" y="128" className="vm-label vm-label--light">TOWN WELL{frame && !frame.wellOpen ? ' (CLOSED)' : ''}</text>
      <rect x="0" y="230" width="400" height="70" fill="color-mix(in srgb, var(--postcard) 70%, var(--faint))" />
      <path d="M0 262 Q 200 252 400 262 L400 300 L0 300 Z" fill="color-mix(in srgb, var(--water) 60%, var(--bg))" />
      <text x="6" y="290" className="vm-label">AQUIFER</text>
      {frame && !frame.wellOpen && <path d="M214 108 L 383 116" stroke="color-mix(in srgb, var(--soil) 70%, var(--ink))" strokeWidth="5" strokeDasharray="8 6" fill="none" />}
    </svg>
  );
}
