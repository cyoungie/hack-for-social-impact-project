// Pixel-art river-mouth village, the morning after the typhoon (1440x760 grid).
//   plan:    Set of funded approaches (concrete, dredge, bridge, plant, clear, rebuild) or null
//   debris:  null | 'burn' | 'dump' | 'chip'
//   vote:    { houseId: 'same'|'stilts'|'uphill' } or null
//   mapped:  the flood-risk map is done (tags shown on the houses)
//   bay:     'brown' | 'murky' | 'blue'
//   rebuilt: houses have roofs again (consequence frame)

// The five damaged houses, matching the village map ids.
const HOUSES = [
  { id: 'h5', x: 360, y: 318 },
  { id: 'h7', x: 760, y: 318 },
  { id: 'h1', x: 300, y: 520 },
  { id: 'h6', x: 460, y: 556 },
  { id: 'h2', x: 790, y: 536 },
];
const UPHILL_SPOTS = [
  [1060, 262],
  [1180, 292],
  [1300, 262],
  [1100, 340],
  [1250, 352],
];

function House({ x, y, rebuilt, stilts, slabOnly, tag }) {
  if (slabOnly) {
    return (
      <g>
        <rect className="rs-slab" x={x} y={y + 64} width="130" height="14" />
        <g className="rs-sapling">
          {[x + 12, x + 46, x + 80, x + 112].map((sx) => (
            <rect key={sx} x={sx} y={y + 48} width="10" height="16" />
          ))}
        </g>
      </g>
    );
  }
  const lift = stilts ? 26 : 0;
  return (
    <g transform={`translate(0 ${-lift})`}>
      {stilts && (
        <g className="rs-post">
          {[x + 8, x + 58, x + 110].map((px) => (
            <rect key={px} x={px} y={y + 78} width="10" height={lift + 4} />
          ))}
        </g>
      )}
      <rect className="rs-wall" x={x} y={y} width="130" height="80" />
      {[16, 36, 56].map((dy) => (
        <rect key={dy} className="rs-plank" x={x} y={y + dy} width="130" height="3" />
      ))}
      <rect className="rs-door" x={x + 52} y={y + 36} width="26" height="44" />
      <rect className="rs-window" x={x + 14} y={y + 22} width="26" height="20" />
      <rect className="rs-window" x={x + 90} y={y + 22} width="26" height="20" />
      {rebuilt ? (
        <g className="rs-roof">
          <rect x={x - 12} y={y - 18} width="154" height="20" />
          <rect x={x + 12} y={y - 36} width="106" height="20" />
        </g>
      ) : (
        <g className="rs-rafter">
          {[x + 4, x + 40, x + 76, x + 112].map((rx, i) => (
            <rect key={rx} x={rx} y={y - 22 + (i % 2) * 8} width="10" height={24 - (i % 2) * 8} />
          ))}
          <rect className="rs-tarp" x={x + 20} y={y - 6} width="44" height="8" />
        </g>
      )}
      {tag && (
        <g transform={`translate(${x + 30} ${y - 54})`}>
          <rect className={`rs-tag rs-tag--${tag}`} width="72" height="22" />
          <text x="36" y="15" textAnchor="middle" className="rs-tag__txt">
            {tag === 'risk' ? 'AT RISK' : 'SAFE'}
          </text>
        </g>
      )}
    </g>
  );
}

function Person({ x, y, tint }) {
  return (
    <g>
      <rect className="rs-skin" x={x + 3} y={y} width="12" height="12" />
      <rect x={x} y={y + 12} width="18" height="18" style={{ fill: tint }} />
      <rect className="rs-legs" x={x + 2} y={y + 30} width="5" height="10" />
      <rect className="rs-legs" x={x + 11} y={y + 30} width="5" height="10" />
    </g>
  );
}

export default function RiverScene({ plan = null, debris = null, vote = null, mapped = null, bay = 'brown', rebuilt = false }) {
  const has = (id) => Boolean(plan?.has(id));
  const raised = has('bridge');
  let uphillIdx = 0;

  return (
    <svg className="farm" viewBox="0 0 1440 760" preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
      {/* Sky, overcast morning */}
      <rect className="rs-sky" x="0" y="0" width="1440" height="240" />
      <g className="rs-cloud">
        <rect x="80" y="40" width="220" height="30" />
        <rect x="120" y="20" width="140" height="24" />
        <rect x="560" y="60" width="260" height="28" />
        <rect x="610" y="40" width="160" height="24" />
      </g>

      {/* Ridge: forest left, burned savanna right (greens up if planted) */}
      <rect className="rs-forest" x="0" y="170" width="620" height="90" />
      <rect className="rs-forest" x="80" y="150" width="300" height="30" />
      <rect className={`rs-savanna ${has('plant') ? 'is-planted' : ''}`} x="620" y="180" width="420" height="80" />
      <rect className={`rs-savanna ${has('plant') ? 'is-planted' : ''}`} x="700" y="160" width="220" height="24" />
      {has('plant') && (
        <g className="rs-sapling">
          {[650, 700, 750, 800, 850, 900, 950, 1000].map((sx, i) => (
            <rect key={sx} x={sx} y={196 + (i % 2) * 22} width="10" height="16" />
          ))}
        </g>
      )}

      {/* Hill with the school; people outside */}
      <rect className="rs-hill" x="1020" y="170" width="420" height="300" />
      <rect className="rs-hill" x="1080" y="140" width="300" height="40" />
      <rect className="rs-school" x="1160" y="150" width="200" height="90" />
      <rect className="rs-school-roof" x="1150" y="132" width="220" height="22" />
      {[1176, 1220, 1292, 1336].map((wx) => (
        <rect key={wx} className="rs-window" x={wx} y="176" width="22" height="20" />
      ))}
      <rect className="rs-door" x="1250" y="196" width="26" height="44" />
      <Person x={1090} y={250} tint="var(--people)" />
      <Person x={1124} y={258} tint="var(--warning)" />
      <Person x={1380} y={252} tint="var(--water)" />
      <Person x={1350} y={262} tint="var(--danger)" />

      {/* Village ground, mud */}
      <rect className="rs-ground" x="0" y="260" width="1020" height="380" />
      <rect className="rs-ground" x="1020" y="470" width="420" height="170" />
      <g className="rs-mud">
        <rect x="120" y="470" width="160" height="22" />
        <rect x="620" y="606" width="200" height="20" />
        <rect x="900" y="590" width="120" height="18" />
      </g>

      {/* River (bank trees, concrete, or planted) */}
      <g className={`rs-bank ${has('concrete') ? 'is-concrete' : ''} ${has('plant') ? 'is-planted' : ''}`}>
        <rect x="508" y="240" width="140" height="190" />
        <rect x="548" y="460" width="150" height="190" />
      </g>
      <g className="rs-river">
        <rect x="530" y="240" width="96" height="190" />
        <rect x="570" y="460" width="106" height="190" />
      </g>

      {/* Road with mud, and the bridge */}
      <rect className="rs-road" x="0" y="430" width="1440" height="40" />
      <g className="rs-mud">
        <rect x="200" y="436" width="140" height="18" />
        <rect x="860" y="440" width="110" height="20" />
      </g>
      <g className={`rs-bridge ${raised ? 'is-raised' : ''}`}>
        {raised && (
          <>
            <rect className="rs-pier" x="560" y="410" width="16" height="64" />
            <rect className="rs-pier" x="676" y="410" width="16" height="64" />
          </>
        )}
        <rect x="540" y={raised ? 400 : 424} width="170" height={raised ? 24 : 20} />
        <rect className="rs-rail" x="540" y={raised ? 392 : 418} width="170" height="6" />
      </g>
      {!raised && (
        <g className="rs-logs">
          <rect x="520" y="400" width="80" height="14" />
          <rect x="590" y="392" width="70" height="12" />
          <rect x="640" y="404" width="60" height="12" />
        </g>
      )}

      {/* Power poles: one standing, two down */}
      <g className="rs-pole">
        <rect x="900" y="290" width="12" height="142" />
        <rect x="878" y="300" width="56" height="8" />
        <path className="rs-wire" d="M906 304 Q 960 380 1010 440" />
        <path d="M940 452 L1060 420 L1062 432 L942 464 Z" />
        <path d="M980 470 L1090 488 L1088 500 L978 482 Z" />
      </g>

      {/* Flood line: a measuring post with the water mark */}
      <g className="rs-gauge">
        <rect x="290" y="300" width="12" height="130" />
        {[310, 340, 370, 400].map((ty) => (
          <rect key={ty} x="302" y={ty} width="10" height="4" />
        ))}
        <rect className="rs-waterline" x="270" y="352" width="230" height="5" />
      </g>

      {/* Houses (roofs gone), or moved uphill, or on stilts */}
      {HOUSES.map((h) => {
        const v = vote?.[h.id];
        if (v === 'uphill') {
          const [ux, uy] = UPHILL_SPOTS[uphillIdx];
          uphillIdx += 1;
          return (
            <g key={h.id}>
              <House x={h.x} y={h.y} slabOnly />
              <g transform={`translate(${ux} ${uy}) scale(0.55) translate(${-ux} ${-uy})`}>
                <House x={ux} y={uy} rebuilt />
              </g>
            </g>
          );
        }
        return <House key={h.id} x={h.x} y={h.y} rebuilt={rebuilt || has('rebuild')} stilts={v === 'stilts'} tag={mapped?.[h.id]} />;
      })}

      {/* Debris pile by the road */}
      {debris === null && (
        <g className="rs-debris">
          <rect x="1000" y="490" width="120" height="30" />
          <rect x="1016" y="470" width="80" height="24" />
          <rect className="rs-metal" x="1030" y="462" width="60" height="10" />
          <rect x="990" y="508" width="40" height="12" />
          <rect x="1090" y="480" width="44" height="10" />
        </g>
      )}
      {debris === 'burn' && (
        <g>
          <rect className="rs-scorch" x="980" y="480" width="170" height="44" />
          <rect className="rs-scorch" x="500" y="236" width="40" height="190" />
        </g>
      )}
      {debris === 'chip' && (
        <g className="rs-chips">
          <rect x="1010" y="496" width="110" height="24" />
          <rect x="1030" y="482" width="70" height="16" />
        </g>
      )}

      {/* Notice board */}
      <g className="rs-board">
        <rect className="rs-post" x="1112" y="372" width="10" height="58" />
        <rect className="rs-post" x="1172" y="372" width="10" height="58" />
        <rect x="1100" y="326" width="94" height="56" />
        <rect className="rs-paper" x="1110" y="334" width="30" height="22" />
        <rect className="rs-paper" x="1148" y="338" width="36" height="18" />
        <rect className="rs-paper" x="1124" y="360" width="40" height="16" />
      </g>

      {/* Nina at the roadside */}
      <Person x={880} y={476} tint="var(--people)" />

      {/* The bay and the reef flat */}
      <rect className={`rs-bay rs-bay--${bay}`} x="0" y="640" width="1440" height="120" />
      <g className="rs-wave">
        <rect x="80" y="676" width="40" height="5" />
        <rect x="420" y="716" width="40" height="5" />
        <rect x="1180" y="680" width="40" height="5" />
      </g>
      <g className={`rs-reef ${bay === 'brown' ? 'is-grey' : ''}`}>
        <rect x="900" y="700" width="60" height="22" />
        <rect x="980" y="694" width="80" height="26" />
        <rect x="1080" y="704" width="70" height="18" />
        <rect x="1170" y="698" width="90" height="24" />
      </g>
      {has('dredge') && <rect className="rs-spoil" x="960" y="688" width="220" height="30" />}
    </svg>
  );
}
