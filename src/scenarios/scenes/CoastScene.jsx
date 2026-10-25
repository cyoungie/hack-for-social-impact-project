// Pixel-art bay at low tide (1440x760 grid).
//   route:    null | 'straight' | 'switch' | 'ridge' — the road cut on the hill
//   controls: Set of 'fences' | 'pond' | 'pause' | 'replant'
//   drain:    null | 'basin' | 'pipe' | 'block'
//   counted:  null | number of healthy corals counted (glow)
//   bay:      'brown' | 'murky' | 'clear'
//   shopClosed: the dive shop has closed

const ROUTE_PATHS = {
  straight: 'M760 430 L470 150',
  switch: 'M760 430 L450 380 L700 320 L440 260 L660 200 L470 150',
  ridge: 'M760 430 C 980 360, 1000 200, 860 140 L470 150',
};

export default function CoastScene({ route = null, controls = new Set(), drain = null, counted = null, bay = 'brown', shopClosed = false }) {
  const greened = controls.has('replant');
  return (
    <svg className="farm" viewBox="0 0 1440 760" preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
      <rect className="cs-sky" x="0" y="0" width="1440" height="200" />
      <g className="fs-sun">
        <rect x="1250" y="40" width="64" height="48" />
        <rect x="1260" y="30" width="44" height="68" />
      </g>
      <g className="fs-cloud">
        <rect x="160" y="50" width="160" height="22" />
        <rect x="190" y="32" width="100" height="20" />
      </g>

      {/* The hill, forest on the ridge, the red road cut */}
      <rect className="cs-hill" x="0" y="150" width="1000" height="320" />
      <rect className="cs-hill" x="80" y="120" width="760" height="40" />
      <rect className="cs-hill" x="220" y="94" width="480" height="30" />
      <rect className="cs-hill" x="340" y="74" width="220" height="24" />
      <rect className="cs-forest" x="820" y="120" width="300" height="290" />
      <rect className="cs-forest" x="860" y="96" width="220" height="30" />
      {route === 'ridge' && <rect className="cs-cleared" x="850" y="130" width="150" height="240" />}
      {route ? (
        <>
          <path className={`cs-cut ${greened ? 'is-green' : ''}`} d={ROUTE_PATHS[route]} />
          <path className="cs-road" d={ROUTE_PATHS[route]} />
        </>
      ) : (
        <path className="cs-cut" d="M560 360 L420 150" />
      )}
      {controls.has('fences') && <path className="cs-fence" d="M380 440 L1000 440" />}
      {controls.has('pond') && <rect className="cs-pond" x="520" y="420" width="120" height="30" />}
      {controls.has('pause') && (
        <g className="cs-sign">
          <rect x="400" y="330" width="8" height="40" />
          <rect x="370" y="306" width="70" height="30" />
        </g>
      )}

      {/* Village street at the foot of the hill */}
      <rect className="cs-street" x="600" y="430" width="440" height="30" />
      {[620, 720, 820, 920].map((x) => (
        <g key={x}>
          <rect className="rs-wall" x={x} y="372" width="70" height="58" />
          <g className="rs-roof">
            <rect x={x - 8} y="356" width="86" height="18" />
          </g>
        </g>
      ))}

      {/* Beach, storm drain, basin, dive shop */}
      <rect className="cs-sand" x="0" y="460" width="1440" height="80" />
      <g className="cs-drain">
        <rect x="900" y="460" width="34" height="56" />
        <rect className="cs-drain__mouth" x="904" y="506" width="26" height="12" />
      </g>
      {drain === 'pipe' && <rect className="cs-pipe" x="910" y="518" width="16" height="200" />}
      {drain === 'block' && <rect className="cs-block" x="896" y="500" width="42" height="18" />}
      {drain === 'basin' && (
        <g className="cs-basin">
          <rect x="860" y="508" width="120" height="30" />
          {[870, 900, 930, 960].map((x) => (
            <rect key={x} className="cs-reed" x={x} y="496" width="8" height="16" />
          ))}
        </g>
      )}
      <g className="cs-shop">
        <rect className="rs-wall" x="1080" y="404" width="110" height="64" />
        <g className="rs-roof">
          <rect x="1070" y="386" width="130" height="20" />
        </g>
        <rect className={`cs-shop__sign ${shopClosed ? 'is-closed' : ''}`} x="1094" y="418" width="82" height="22" />
        <text x="1135" y="434" textAnchor="middle" className="cs-shop__txt">
          {shopClosed ? 'CLOSED' : 'DIVE'}
        </text>
      </g>

      {/* Bay at low tide, the boat, the point and its coral */}
      <rect className={`cs-bay cs-bay--${bay}`} x="0" y="540" width="1440" height="220" />
      {bay !== 'clear' && (
        <g className="cs-plume">
          <rect x="820" y="540" width="240" height="40" />
          <rect x="780" y="580" width="320" height="40" />
        </g>
      )}
      <g className="cs-boat">
        <rect x="500" y="604" width="150" height="26" />
        <rect x="516" y="630" width="118" height="10" />
        <rect className="cs-mast" x="570" y="540" width="8" height="66" />
        <rect className="cs-sail" x="578" y="548" width="50" height="44" />
      </g>
      <rect className="cs-point" x="1260" y="470" width="180" height="120" />
      <rect className="cs-point" x="1320" y="440" width="120" height="40" />
      <g className={`cs-coral ${counted ? 'is-counted' : ''}`}>
        {[1140, 1190, 1240, 1290, 1340].map((x, i) => (
          <g key={x}>
            <rect className={i % 2 ? 'cs-coral--white' : 'cs-coral--live'} x={x} y={650 + (i % 2) * 14} width="36" height="26" />
            <rect className={i % 2 ? 'cs-coral--white' : 'cs-coral--live'} x={x + 12} y={636 + (i % 2) * 14} width="10" height="16" />
          </g>
        ))}
      </g>
      <g className="fs-wave">
        <rect x="120" y="680" width="40" height="5" />
        <rect x="320" y="720" width="40" height="5" />
      </g>
    </svg>
  );
}
