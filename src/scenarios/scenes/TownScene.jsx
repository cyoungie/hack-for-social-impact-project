// Pixel-art harbor town (fictional) with two factories and a military base on the hill (1440x760 grid).
//   station:   the clinic's water station is up (5.1)
//   cluster:   the case map shows a cluster below the hill (5.2)
//   plan:      efforts chosen in 5.3 (monitoring wells, filtration point, town hall, meeting, bottled water)
//   townhall:  the town hall happened (5.4)
//   posted:    monitoring results pinned to the notice board (5.5)
//   outcome:   null | 'good' | 'bad'

export default function TownScene({ station = false, cluster = false, plan = [], townhall = false, posted = false, outcome = null }) {
  const has = (id) => plan.includes(id);
  const cleared = outcome === 'good';
  return (
    <svg className="farm" viewBox="0 0 1440 760" preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
      <rect className="ts-sky" x="0" y="0" width="1440" height="260" />

      {/* The hill: the plant, the base, the fuel tanks */}
      <rect className="ts-hill" x="0" y="150" width="1440" height="190" />
      <rect className="ts-hill" x="200" y="120" width="900" height="40" />
      <g>
        <rect className="ts-factory" x="140" y="150" width="190" height="110" />
        <rect className="ts-factory__roof" x="140" y="136" width="190" height="16" />
        <rect className="ts-stack" x="270" y="70" width="30" height="80" />
        <rect className="ts-factory" x="360" y="170" width="160" height="90" />
        <rect className="ts-factory__roof" x="360" y="156" width="160" height="16" />
        <rect className="ts-stack" x="470" y="90" width="28" height="70" />
        <text x="150" y="250" className="ws-txt">THE PLANT</text>
      </g>
      <g>
        <rect className="ts-hangar" x="880" y="160" width="200" height="90" />
        <rect className="ts-hangar__door" x="920" y="190" width="120" height="60" />
        <rect className="ts-tower" x="1120" y="120" width="30" height="130" />
        <rect className="ts-tower__cab" x="1108" y="104" width="54" height="24" />
        <text x="890" y="150" className="ws-txt">THE BASE</text>
        <g className="ts-fence">
          {Array.from({ length: 22 }, (_, i) => (
            <rect key={i} x={860 + i * 24} y="260" width="4" height="26" />
          ))}
          <rect x="860" y="266" width="530" height="3" />
        </g>
      </g>
      {[600, 660, 720].map((x) => (
        <rect key={x} className={cleared ? 'ts-tank is-empty' : 'ts-tank'} x={x} y="200" width="46" height="56" />
      ))}
      <text x="596" y="190" className="ws-txt">FUEL TANKS</text>
      {has('monitoring') && [560, 700, 840].map((x) => <rect key={x} className="ts-monwell" x={x} y="300" width="16" height="34" />)}

      {/* Town ground and the six streets */}
      <rect className="ts-ground" x="0" y="340" width="1440" height="300" />
      {[520, 560, 600].map((y) => (
        <rect key={y} className="cs-street" x="0" y={y} width="1040" height="14" />
      ))}
      {cluster && <rect className="ts-cluster" x="40" y="508" width="940" height="110" />}

      {/* Corner shop with Marco's sign */}
      <rect className="rs-wall" x="60" y="380" width="230" height="120" />
      <g className="rs-roof">
        <rect x="48" y="362" width="254" height="20" />
      </g>
      <rect className="rs-door" x="150" y="440" width="40" height="60" />
      <rect className="ts-sign" x="70" y="394" width="210" height="34" />
      <text x="175" y="416" textAnchor="middle" className="ts-sign__txt">
        {cleared ? 'WELL WATER BACK' : 'WATER FROM THE TRUCK ONLY'}
      </text>
      <g>
        <rect className="rs-skin" x="203" y="456" width="12" height="12" />
        <rect x="200" y="468" width="18" height="22" style={{ fill: 'var(--warning)' }} />
      </g>

      {/* Well house, gate closed */}
      <rect className="rs-wall" x="330" y="410" width="120" height="90" />
      <g className="rs-roof">
        <rect x="320" y="394" width="140" height="18" />
      </g>
      {!cleared ? <rect className="ts-gate" x="350" y="450" width="80" height="50" /> : <rect className="rs-door" x="372" y="450" width="36" height="50" />}
      <text x="338" y="440" className="ws-txt">WELL</text>

      {/* Clinic, with the water station */}
      <rect className="rs-wall ts-clinic" x="490" y="380" width="210" height="120" />
      <rect className="ts-cross" x="580" y="394" width="30" height="10" />
      <rect className="ts-cross" x="590" y="384" width="10" height="30" />
      <rect className="rs-door" x="575" y="440" width="40" height="60" />
      <text x="500" y="430" className="ws-txt">CLINIC</text>
      {station && (
        <g>
          <rect className="ts-station" x="710" y="440" width="50" height="60" />
          <rect className="ws-jug" x="720" y="452" width="14" height="22" />
          <rect className="ws-jug" x="738" y="452" width="14" height="22" />
        </g>
      )}
      {has('filtration') && <rect className="ts-filter" x="770" y="430" width="90" height="70" />}

      {/* Notice board */}
      <rect className="rs-post" x="1168" y="450" width="10" height="50" />
      <rect className="rs-post" x="1228" y="450" width="10" height="50" />
      <rect className="ts-board" x="1156" y="404" width="94" height="56" />
      {posted ? <rect className="ts-posted" x="1170" y="412" width="66" height="40" /> : <rect className="rs-paper" x="1170" y="414" width="30" height="20" />}

      {/* Town hall */}
      <rect className="rs-wall ws-hall" x="900" y="380" width="230" height="120" />
      <rect className="ws-pediment" x="888" y="362" width="254" height="22" />
      {[920, 980, 1040, 1100].map((x) => (
        <rect key={x} className="ws-column" x={x} y="392" width="12" height="108" />
      ))}
      {townhall && (
        <g>
          {[930, 960, 990, 1020, 1050, 1080].map((x, i) => (
            <rect key={x} className="ts-person" x={x} y={506 + (i % 2) * 6} width="16" height="30" />
          ))}
        </g>
      )}

      {/* Harbor */}
      <rect className="cs-sand" x="1040" y="520" width="400" height="30" />
      <rect className={`ts-harbor ${cleared ? 'is-clear' : ''}`} x="1040" y="550" width="400" height="210" />
      <rect className={`ts-harbor ${cleared ? 'is-clear' : ''}`} x="0" y="640" width="1440" height="120" />
      <g className="cs-boat">
        <rect x="1200" y="600" width="120" height="22" />
        <rect className="cs-mast" x="1250" y="548" width="8" height="54" />
      </g>
    </svg>
  );
}
