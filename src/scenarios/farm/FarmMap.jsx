import { COVER } from '../../components/LayerMap.jsx';

// Top-down map of Rosa's farm and the hill above it (400x300 units): burned ridge at the top,
// the strip above the field, the field sloping down to the stream, last wet season's gully across it.
// layers: { landcover, slope, gully } (baseline); plan + frame (five-year outlook)
export default function FarmMap({ layers = { landcover: true, slope: true, gully: true }, plan, frame, label }) {
  const gully = frame ? frame.gully : 1;
  const mud = frame ? frame.streamMud : 0.6;
  const contour = plan?.path === 'contour';
  const stream = mud > 1 ? 'color-mix(in srgb, var(--soil) 75%, var(--water))' : COVER.water;
  return (
    <svg className="vmap" viewBox="0 0 400 300" role="img" aria-label={label || 'Map of the farm, the field, the stream and the ridge'}>
      <rect x="0" y="0" width="400" height="300" fill={layers.landcover ? COVER.grass : 'color-mix(in srgb, var(--veg) 35%, var(--panel))'} />
      {/* burned ridge */}
      <rect x="0" y="0" width="400" height="70" fill={layers.landcover ? COVER.bare : 'color-mix(in srgb, var(--soil) 40%, var(--panel))'} />
      <text x="8" y="16" className="vm-label vm-label--light">BURNED RIDGE</text>
      {/* strip above the field */}
      {plan?.strip === 'planted' && (
        <g fill={COVER.trees}>
          {Array.from({ length: 14 }, (_, i) => (
            <rect key={i} x={40 + i * 22} y="76" width="14" height="12" />
          ))}
        </g>
      )}
      {plan?.strip === 'channel' && <rect x="30" y="80" width="320" height="8" fill="color-mix(in srgb, var(--faint) 60%, var(--bg))" stroke="var(--ink)" />}
      {/* field */}
      <rect x="30" y="92" width="300" height="160" fill={layers.landcover ? COVER.crop : 'color-mix(in srgb, var(--soil) 45%, var(--panel))'} stroke="var(--ink)" strokeWidth="2" />
      {plan &&
        (contour
          ? [110, 135, 160, 185, 210, 235].map((y) => <path key={y} d={`M30 ${y} C 130 ${y - 6}, 230 ${y + 6}, 330 ${y}`} fill="none" stroke="var(--wood)" strokeWidth="3" />)
          : [50, 80, 110, 140, 170, 200, 230, 260, 290, 320].map((x) => <rect key={x} x={x} y="92" width="4" height="160" fill="var(--wood)" />))}
      <text x="36" y="106" className="vm-label">SWEET POTATO FIELD</text>
      {/* gully */}
      {layers.gully && <path d="M150 92 L160 150 L150 200 L170 252" fill="none" stroke="color-mix(in srgb, var(--soil) 70%, var(--ink))" strokeWidth={3 + gully * 4} strokeLinecap="round" />}
      {layers.gully && !frame && <text x="176" y="170" className="vm-label">LAST WET SEASON’S GULLY</text>}
      {/* riverbank trees + stream */}
      <rect x="340" y="70" width="60" height="230" fill={layers.landcover ? COVER.trees : 'color-mix(in srgb, var(--veg) 50%, var(--panel))'} />
      <path d="M372 70 C 360 140, 384 200, 366 300" fill="none" stroke={stream} strokeWidth="16" />
      <rect x="0" y="262" width="340" height="38" fill="color-mix(in srgb, var(--veg) 30%, var(--panel))" />
      <text x="300" y="292" className="vm-label">STREAM →</text>
      {layers.slope && (
        <g className="vm-slope">
          <text x="250" y="40">STEEP · RIDGE</text>
          <text x="210" y="125">MODERATE · FIELD</text>
        </g>
      )}
    </svg>
  );
}
