// Top-down map of the hill, the village, the beach and the reef at the point (400x300 units).
// Used by the road plan (route choice) and the five-year frames (state from the rule).

export const ROUTE_LINES = {
  straight: [
    [230, 210],
    [110, 40],
  ],
  switch: [
    [230, 210],
    [118, 182],
    [228, 146],
    [118, 108],
    [220, 72],
    [110, 40],
  ],
  ridge: [
    [230, 210],
    [300, 186],
    [338, 120],
    [312, 56],
    [232, 28],
    [110, 40],
  ],
};
export const CUT_BOX = { x: 90, y: 20, w: 270, h: 200 };

const pts = (line) => line.map((p) => p.join(',')).join(' ');
const mix = (a, b, t) => `color-mix(in srgb, ${a} ${Math.round(t * 100)}%, ${b})`;

// route: id or null; controls: Set; frame (optional): { mud, reef, bare, year }; drain: 'basin'|null
export default function ReefMap({ route, controls = new Set(), frame, drain, showRoutes = false, firstCut = false, layers = { landcover: true }, className = '', label }) {
  const mud = frame?.mud ?? 0.4;
  const reef = frame?.reef ?? 0.6;
  const bay = mud < 0.3 ? 'var(--water)' : mud < 0.6 ? mix('var(--water)', 'var(--soil)', 0.5) : mix('var(--soil)', 'var(--wood)', 0.8);
  const coral = reef >= 0.6 ? mix('var(--people)', 'var(--danger)', 0.6) : reef >= 0.4 ? 'var(--bg)' : reef >= 0.2 ? mix('var(--faint)', 'var(--bg)', 0.5) : mix('var(--faint)', 'var(--ink)', 0.7);
  const greened = controls.has('replant') && (frame?.year ?? 1) >= 3;

  return (
    <svg className={`vmap ${className}`} viewBox="0 0 400 300" role="img" aria-label={label || 'Map of the hill, the village and the reef'}>
      {/* Hill and forest */}
      <rect x="0" y="0" width="400" height="230" fill="color-mix(in srgb, var(--veg) 55%, var(--panel))" />
      <rect x="250" y="0" width="150" height="230" fill="color-mix(in srgb, var(--veg) 55%, var(--ink))" />
      {[40, 80, 120, 160, 200].map((y) => (
        <path key={y} d={`M0 ${y} C 120 ${y - 8}, 260 ${y + 8}, 400 ${y}`} className="vm-contour" />
      ))}
      <text x="8" y="16" className="vm-label">
        STEEP HILL
      </text>
      <text x="300" y="16" className="vm-label vm-label--light">
        FOREST
      </text>

      {/* Candidate routes (road plan) */}
      {showRoutes &&
        Object.entries(ROUTE_LINES).map(([id, line]) => (
          <polyline key={id} points={pts(line)} className={`rm-candidate ${route === id ? 'is-on' : ''}`} />
        ))}

      {/* The chosen road and its cut */}
      {route && (
        <>
          <polyline points={pts(ROUTE_LINES[route])} className={`rm-cut ${greened ? 'is-green' : ''}`} />
          <polyline points={pts(ROUTE_LINES[route])} className="rm-road" />
          {route === 'ridge' && <rect x="270" y="30" width="80" height="170" className="rm-cleared" />}
        </>
      )}
      {firstCut && !route && <polyline points="230,210 190,152" className="rm-cut" />}
      {firstCut && !route && <text x="196" y="190" className="vm-label">FIRST 200 M OF ROAD CUT</text>}
      {layers.slope && (
        <g className="vm-slope">
          <text x="120" y="60">STEEP · UPPER SLOPE</text>
          <text x="20" y="196">GENTLE · VILLAGE</text>
        </g>
      )}
      {controls.has('fences') && route && <polyline points="60,224 380,224" className="rm-fence" />}
      {controls.has('pond') && route && <rect x="150" y="214" width="70" height="14" className="rm-pond" />}

      {/* Village, beach, drain */}
      <rect x="170" y="200" width="120" height="30" fill="color-mix(in srgb, var(--faint) 40%, var(--bg))" />
      {[180, 210, 240, 266].map((x) => (
        <rect key={x} x={x} y="205" width="16" height="12" className="vm-house__body" />
      ))}
      <rect x="0" y="230" width="400" height="14" fill="color-mix(in srgb, var(--tag) 45%, var(--postcard))" />
      <rect x="236" y="232" width="8" height="12" fill="var(--ink)" />
      {drain === 'basin' && <rect x="220" y="230" width="40" height="12" className="rm-basin" />}

      {/* Bay and the reef at the point */}
      <rect x="0" y="244" width="400" height="56" fill={bay} />
      <rect x="330" y="236" width="70" height="30" fill="color-mix(in srgb, var(--faint) 60%, var(--ink))" />
      <rect x="300" y="268" width="80" height="16" fill={coral} stroke="var(--ink)" strokeWidth="1.5" />
      <text x="304" y="296" className="vm-label vm-label--light">
        REEF AT THE POINT
      </text>
    </svg>
  );
}
