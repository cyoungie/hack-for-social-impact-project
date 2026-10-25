// Pixel-art town with a couple of factories and a military base within view (1440x760 grid).
//   path: null | 'townhall' | 'discuss' | 'filter' — what the community chose
//   outcome: null | 'good' | 'bad'

export default function TownScene({ path = null, outcome = null }) {
  const cleaner = outcome === 'good';
  return (
    <svg className="farm" viewBox="0 0 1440 760" preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
      <rect className="ts-sky" x="0" y="0" width="1440" height="300" />
      {!cleaner && (
        <g className="ts-soot">
          <rect x="820" y="40" width="160" height="40" />
          <rect x="860" y="80" width="120" height="30" />
          <rect x="1040" y="30" width="140" height="36" />
        </g>
      )}

      {/* Military base, not far off: fence, hangar, tower, runway */}
      <rect className="ts-base" x="0" y="190" width="620" height="120" />
      <rect className="ts-runway" x="20" y="270" width="560" height="22" />
      {[60, 160, 260, 360, 460].map((x) => (
        <rect key={x} className="ts-stripe" x={x} y="279" width="40" height="4" />
      ))}
      <rect className="ts-hangar" x="80" y="196" width="170" height="64" />
      <rect className="ts-hangar__door" x="110" y="220" width="110" height="40" />
      <rect className="ts-tower" x="420" y="150" width="34" height="110" />
      <rect className="ts-tower__cab" x="408" y="134" width="58" height="26" />
      <g className="ts-fence">
        {Array.from({ length: 32 }, (_, i) => (
          <rect key={i} x={i * 20} y="300" width="4" height="26" />
        ))}
        <rect x="0" y="306" width="640" height="3" />
      </g>

      {/* Factories with smokestacks */}
      <rect className="ts-factory" x="760" y="180" width="200" height="130" />
      <rect className="ts-factory__roof" x="760" y="166" width="200" height="16" />
      <rect className="ts-stack" x="880" y="80" width="34" height="100" />
      <rect className="ts-factory" x="1000" y="200" width="190" height="110" />
      <rect className="ts-factory__roof" x="1000" y="186" width="190" height="16" />
      <rect className="ts-stack" x="1110" y="70" width="34" height="130" />
      {[780, 830, 1020, 1070, 1120].map((x) => (
        <rect key={x} className="rs-window" x={x} y="230" width="30" height="22" />
      ))}
      <rect className="ts-tank" x="1220" y="240" width="80" height="70" />

      {/* Town ground, street, houses */}
      <rect className="ts-ground" x="0" y="310" width="1440" height="450" />
      <rect className="cs-street" x="0" y="470" width="1440" height="40" />
      {[80, 280, 480, 680].map((x) => (
        <g key={x}>
          <rect className="rs-wall" x={x} y="380" width="130" height="90" />
          <g className="rs-roof">
            <rect x={x - 10} y="360" width="150" height="22" />
          </g>
          <rect className="rs-window" x={x + 16} y="404" width="30" height="24" />
          <rect className="rs-door" x={x + 76} y="420" width="28" height="50" />
        </g>
      ))}

      {/* Stream running from the factories past the town */}
      <path className={`ts-stream ${cleaner ? 'is-clear' : ''}`} d="M1260 310 L1240 420 L1300 520 L1260 640 L1300 760" />
      {!cleaner && <path className="ts-sheen" d="M1250 360 L1246 420 L1290 500" />}
      {/* Black water at a tap */}
      <rect className="ws-faucet" x="196" y="440" width="16" height="10" />
      {!cleaner && <rect className="ts-blackwater" x="200" y="452" width="8" height="14" />}

      {/* What the community chose */}
      {path === 'townhall' && (
        <g>
          <rect className="ts-hall" x="880" y="540" width="260" height="120" />
          <rect className="ts-hall__sign" x="920" y="556" width="180" height="28" />
          <text x="1010" y="576" textAnchor="middle" className="ws-txt">
            TOWN HALL TONIGHT
          </text>
          {[910, 950, 990, 1030, 1070].map((x, i) => (
            <rect key={x} className="ts-person" x={x} y={612 + (i % 2) * 6} width="18" height="34" />
          ))}
        </g>
      )}
      {path === 'discuss' && (
        <g>
          <rect className="ts-table" x="300" y="580" width="360" height="40" />
          {[320, 400, 480, 560, 620].map((x) => (
            <rect key={x} className="ts-person" x={x} y="540" width="18" height="40" />
          ))}
        </g>
      )}
      {path === 'filter' && (
        <g>
          <rect className="ts-filter" x="900" y="560" width="200" height="90" />
          <rect className="ts-filter__stage" x="916" y="576" width="40" height="58" />
          <rect className="ts-filter__stage" x="976" y="576" width="40" height="58" />
          <rect className="ts-filter__stage" x="1036" y="576" width="40" height="58" />
          <rect className="ws-pipe" x="1100" y="600" width="140" height="10" />
        </g>
      )}
    </svg>
  );
}
