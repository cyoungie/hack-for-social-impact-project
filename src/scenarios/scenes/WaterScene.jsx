// Pixel-art northern village on the limestone plateau, with a cutaway of the lens below (1440x760 grid).
//   chloride: null | number (from Lens Keeper) — salt cone under the well
//   leaksFixed: the leaking pipe was found and reported
//   septic: null | 'leave' | 'pump' | 'upgrade' | 'sewer'
//   stocked: the pantry is stocked for the typhoon
//   outcome: null | 'good' | 'bad'

export default function WaterScene({ chloride = null, leaksFixed = false, septic = null, stocked = false, outcome = null }) {
  const cone = chloride === null ? 0 : Math.max(0, chloride - 30) * 2.2;
  const lensTop = outcome === 'bad' ? 600 : 560;
  return (
    <svg className="farm" viewBox="0 0 1440 760" preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
      {/* Sky and rain */}
      <rect className="cs-sky" x="0" y="0" width="1440" height="340" />
      <g className="fs-cloud">
        <rect x="380" y="40" width="200" height="26" />
        <rect x="420" y="20" width="120" height="24" />
        <rect x="900" y="56" width="180" height="24" />
      </g>
      <g className="fs-rain">
        {[400, 440, 480, 520, 560, 920, 960, 1000, 1040].map((x) => (
          <rect key={x} x={x} y="80" width="4" height="18" />
        ))}
      </g>

      {/* Plateau surface */}
      <rect className="ws-ground" x="0" y="330" width="1440" height="70" />

      {/* Water tower */}
      <g className="ws-tower">
        <rect x="80" y="150" width="130" height="80" />
        <rect className="ws-tower__band" x="80" y="176" width="130" height="10" />
        <rect className="ws-leg" x="96" y="230" width="10" height="100" />
        <rect className="ws-leg" x="184" y="230" width="10" height="100" />
        <rect className="ws-leg" x="96" y="280" width="98" height="6" />
        <text x="100" y="168" className="ws-txt">WATER</text>
      </g>

      {/* Well house, with its pipe down to the lens */}
      <g className="ws-wellhouse">
        <rect className="rs-wall" x="250" y="250" width="110" height="80" />
        <g className="rs-roof">
          <rect x="240" y="232" width="130" height="20" />
        </g>
        <rect className="rs-door" x="292" y="282" width="26" height="48" />
      </g>
      <rect className="ws-pipe" x="300" y="330" width="10" height={lensTop - 300} />

      {/* Ana's home, pantry lean-to, rain barrel, faucet */}
      <g>
        <rect className="rs-wall" x="470" y="214" width="230" height="116" />
        <g className="rs-roof">
          <rect x="456" y="194" width="258" height="22" />
          <rect x="490" y="176" width="190" height="20" />
        </g>
        <rect className="rs-window" x="492" y="240" width="44" height="34" />
        <rect className="rs-window" x="634" y="240" width="44" height="34" />
        <rect className="rs-door" x="568" y="266" width="34" height="64" />
      </g>
      <g className="ws-pantry">
        <rect className="rs-wall" x="700" y="252" width="80" height="78" />
        <g className="rs-roof">
          <rect x="694" y="238" width="92" height="16" />
        </g>
        <rect className="ws-shelf" x="712" y="270" width="56" height="44" />
        {stocked && [716, 732, 748].map((x) => <rect key={x} className="ws-jug" x={x} y="284" width="12" height="26" />)}
      </g>
      <rect className="ws-barrel" x="790" y="284" width="34" height="46" />
      <rect className="ws-faucet" x="456" y="296" width="14" height="8" />

      {/* Septic tank in the yard */}
      <rect className="ws-lid" x="520" y="352" width="80" height="14" />
      <rect className={`ws-tank ${septic === 'upgrade' ? 'is-new' : ''}`} x="510" y="410" width="100" height="50" />
      {septic === 'sewer' && <rect className="ws-sewer" x="610" y="420" width="830" height="14" />}
      {(septic === null || septic === 'leave') && <path className="ws-leach" d="M560 460 L560 560" />}

      {/* Leaking pipe on the road */}
      <rect className="ws-mainpipe" x="820" y="372" width="300" height="14" />
      {!leaksFixed ? (
        <g className="ws-leak">
          <rect x="900" y="352" width="10" height="20" />
          <rect x="880" y="386" width="80" height="10" />
        </g>
      ) : (
        <rect className="ws-patch" x="894" y="368" width="24" height="22" />
      )}

      {/* Cutaway: limestone, the freshwater lens, seawater */}
      <rect className="lc-limestone" x="0" y="400" width="1440" height={lensTop - 400} />
      {[120, 260, 420, 700, 860, 1000, 1180, 1320].map((x, i) => (
        <rect key={x} className="lc-pore" x={x} y={430 + (i % 3) * 40} width="10" height="10" />
      ))}
      <g className="ws-seep">
        {[420, 470, 520, 940, 990, 1040].map((x) => (
          <path key={x} d={`M${x} 404 L${x + 10} ${lensTop - 6}`} />
        ))}
      </g>
      <path className="lc-lens" d={`M0 ${lensTop} Q 720 ${lensTop - 30} 1440 ${lensTop} L1440 700 Q 720 730 0 700 Z`} />
      <rect className="lc-sea" x="0" y="700" width="1440" height="60" />
      {cone > 0 && <path className="lc-cone" d={`M250 704 L305 ${Math.max(lensTop + 20, 704 - cone)} L360 704 Z`} />}
      <text x="24" y={lensTop + 40} className="ws-txt">FRESHWATER LENS</text>
      <text x="24" y="740" className="ws-txt ws-txt--light">SEAWATER</text>
      <text x="1180" y="440" className="ws-txt">POROUS LIMESTONE</text>
    </svg>
  );
}
