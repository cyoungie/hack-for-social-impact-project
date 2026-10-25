// Top-down map of the river-mouth village, about 1 km across (400x300 units).
// Used by the risk map (layers + tags), the five-year frames (state from the rule), and the vote.

export const HOUSES = [
  { id: 'h1', x: 140, y: 215, band: 'observed' },
  { id: 'h2', x: 232, y: 222, band: 'observed' },
  { id: 'h3', x: 108, y: 140, band: 'bigger' },
  { id: 'h4', x: 274, y: 150, band: 'bigger' },
  { id: 'h5', x: 162, y: 138, band: 'observed' },
  { id: 'h6', x: 160, y: 238, band: 'observed' },
  { id: 'h7', x: 212, y: 142, band: 'observed' },
  { id: 'h8', x: 338, y: 112, band: 'none' },
];
export const atRisk = (h) => h.band !== 'none';

const OBSERVED = 'M115 250 L115 175 C135 150, 165 128, 185 122 C 210 128, 240 150, 262 175 L262 250 Z';
const BIGGER = 'M75 250 L75 160 C105 120, 150 100, 185 95 C 225 100, 280 125, 305 155 L305 250 Z';
const RIVER = 'M150 0 C 140 60, 190 100, 185 140 S 205 220, 200 250';
const ROAD_Y = 150;
const UPHILL = { h1: [300, 70], h2: [318, 82], h5: [336, 70], h6: [354, 82], h7: [372, 70] };

const mix = (a, b, t) => `color-mix(in srgb, ${a} ${Math.round(t * 100)}%, ${b})`;

// layers: { landcover, flood, bigger, slope }
// frame (optional, from the rule): { reef, bankVeg, bare, street, down, storm }
// plan (optional Set), vote (optional { houseId: 'same'|'stilts'|'uphill' }), tags (optional { houseId: 'risk'|'safe' })
export default function VillageMap({ layers = {}, frame, plan, vote = {}, tags = {}, className = '', label }) {
  const reef = frame?.reef ?? 0.8;
  const bankVeg = frame?.bankVeg ?? 0.4;
  const bare = frame?.bare ?? 0.5;
  const concrete = plan?.has('concrete');
  const raised = plan?.has('bridge');
  const bay = reef >= 0.7 ? 'var(--water)' : reef >= 0.5 ? mix('var(--water)', 'var(--soil)', 0.55) : mix('var(--soil)', 'var(--wood)', 0.8);
  const ridge = mix('var(--soil)', 'var(--veg)', Math.min(1, bare * 1.4));

  return (
    <svg className={`vmap ${className}`} viewBox="0 0 400 300" role="img" aria-label={label || 'Map of the river-mouth village'}>
      <defs>
        <clipPath id="vm-up">
          <rect x="0" y="0" width="400" height={ROAD_Y + 6} />
        </clipPath>
        <clipPath id="vm-down">
          <rect x="0" y={ROAD_Y + 6} width="400" height="300" />
        </clipPath>
      </defs>

      {/* Ground, ridge, built strip */}
      <rect x="0" y="0" width="400" height="250" fill={layers.landcover ? 'var(--panel)' : mix('var(--veg)', 'var(--panel)', 0.35)} />
      <rect x="0" y="0" width="200" height="80" fill={layers.landcover ? 'color-mix(in srgb, var(--veg) 70%, var(--ink))' : mix('var(--veg)', 'var(--ink)', 0.55)} />
      <rect x="200" y="0" width="200" height="80" fill={layers.landcover ? 'color-mix(in srgb, var(--warning) 55%, var(--soil))' : ridge} />
      {plan?.has('plant') && (frame?.year ?? 0) >= 3 && (
        <g fill="var(--veg)">
          {[214, 244, 274, 304, 334, 364].map((x) => (
            <rect key={x} x={x} y={(x % 3) * 12 + 18} width="8" height="8" />
          ))}
        </g>
      )}
      {layers.landcover && <rect x="0" y="128" width="400" height="56" fill="color-mix(in srgb, var(--faint) 45%, var(--bg))" />}

      {/* Slope + contours */}
      {[40, 66, 92, 118].map((y) => (
        <path key={y} d={`M0 ${y} C 120 ${y - 6}, 280 ${y + 6}, 400 ${y}`} className="vm-contour" />
      ))}
      {layers.slope && (
        <g className="vm-slope">
          <text x="300" y="30">STEEP · RIDGE</text>
          <text x="8" y="104">MODERATE · ROAD</text>
          <text x="40" y="200">FLAT · RIVER</text>
        </g>
      )}

      {/* Riverbank: trees, or concrete */}
      {concrete ? (
        <path d={RIVER} className="vm-concrete" />
      ) : (
        <path d={RIVER} className="vm-bank" style={{ strokeWidth: 18 + 30 * bankVeg }} />
      )}
      <path d={RIVER} className="vm-river" />

      {/* Flood layers */}
      {layers.bigger && <path d={BIGGER} className="vm-bigger" />}
      {layers.flood && <path d={OBSERVED} className="vm-observed" />}
      {frame?.storm && (
        <>
          <path d={OBSERVED} className="vm-flood" clipPath="url(#vm-up)" style={{ opacity: Math.min(0.75, frame.street / 2.4) }} />
          <path d={OBSERVED} className="vm-flood" clipPath="url(#vm-down)" style={{ opacity: Math.min(0.75, frame.down / 2.4) }} />
        </>
      )}

      {/* Road + bridge */}
      <rect x="0" y={ROAD_Y} width="400" height="12" className="vm-road" />
      <rect x="170" y={ROAD_Y - (raised ? 4 : 0)} width="34" height={raised ? 20 : 12} className={`vm-bridge ${raised ? 'is-raised' : ''}`} />

      {/* Bay + reef flat */}
      <rect x="0" y="250" width="400" height="50" fill={bay} />
      <rect x="40" y="272" width="320" height="10" fill={reef >= 0.55 ? 'color-mix(in srgb, var(--people) 55%, var(--danger))' : 'color-mix(in srgb, var(--faint) 60%, var(--soil))'} />
      {plan?.has('dredge') && (frame?.year ?? 0) >= 2 && <rect x="150" y="268" width="110" height="16" fill="color-mix(in srgb, var(--soil) 80%, var(--wood))" />}

      {/* School on the hill */}
      <rect x="318" y="38" width="56" height="24" className="vm-school" />
      <text x="322" y="54" className="vm-label">SCHOOL</text>

      {/* Houses */}
      {HOUSES.map((h) => {
        const v = vote[h.id];
        const [hx, hy] = v === 'uphill' ? UPHILL[h.id] : [h.x, h.y];
        const tag = tags[h.id];
        return (
          <g key={h.id} className="vm-house" transform={`translate(${hx - 9} ${hy - 9})`}>
            {v === 'uphill' && <rect x="-2" y="-2" width="22" height="22" className="vm-slab-old" transform={`translate(${h.x - hx} ${h.y - hy})`} />}
            {v === 'stilts' && (
              <g className="vm-stilts">
                <rect x="2" y="16" width="3" height="6" />
                <rect x="13" y="16" width="3" height="6" />
              </g>
            )}
            <rect x="0" y="4" width="18" height="14" className="vm-house__body" />
            <path d="M-2 5 L9 -3 L20 5 Z" className="vm-house__roof" />
            {tag && (
              <g transform="translate(-8 -18)">
                <rect width="34" height="11" className={`vm-tag vm-tag--${tag}`} />
                <text x="17" y="8.5" textAnchor="middle" className="vm-tag__txt">
                  {tag === 'risk' ? 'AT RISK' : 'SAFE'}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {(layers.flood || layers.bigger || layers.landcover) && (
        <text x="6" y="294" className="vm-label vm-label--light">
          OBSERVED
        </text>
      )}
    </svg>
  );
}
