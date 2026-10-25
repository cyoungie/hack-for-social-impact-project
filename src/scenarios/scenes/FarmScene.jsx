// Pixel-art farm for Scenario 1, drawn on a 1440x760 grid (the stage's aspect).
// Everything that changes with the player's choices is a prop.
//   field:  'plowed' | 'mulch' | 'seedlings' | 'bare' | 'contour' | 'furrows'
//   crops:  null | 'healthy' | 'poor'
//   strip:  null | 'planted' | 'channel' | 'nothing' — what sits at the top of the field
//   muddy:  stream runs brown, with a mud fan in the bay
//   reefGrey, plume: the reef has bleached / a nutrient plume runs to it

const FIELD = { x: 320, y: 300, w: 680, h: 350 };
const ROWS = Array.from({ length: 11 }, (_, i) => FIELD.y + 28 + i * 30);

// Deterministic "random" scatter so the art never shifts between renders.
function scatter(n, seed) {
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return Array.from({ length: n }, () => [rnd(), rnd(), rnd()]);
}
const STRAW = scatter(260, 7);
const TUFTS = scatter(40, 3);

function Sun() {
  return (
    <g className="fs-sun">
      <rect x="1262" y="44" width="72" height="56" />
      <rect x="1272" y="34" width="52" height="76" />
    </g>
  );
}

function PuffCloud({ x, y, s = 1 }) {
  return (
    <g className="fs-cloud" transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="30" y="0" width="70" height="20" />
      <rect x="10" y="20" width="120" height="20" />
      <rect x="0" y="40" width="160" height="18" />
    </g>
  );
}

function RainCloud() {
  return (
    <g className="fs-raincloud">
      <rect className="fs-raincloud__top" x="620" y="36" width="170" height="36" />
      <rect className="fs-raincloud__top" x="586" y="66" width="250" height="40" />
      <rect className="fs-raincloud__top" x="566" y="100" width="300" height="38" />
      <rect className="fs-raincloud__belly" x="566" y="132" width="300" height="12" />
      <g className="fs-rain">
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={586 + i * 28} y={156 + (i % 3) * 10} width="4" height="18" />
        ))}
      </g>
    </g>
  );
}

// The ridge behind the farm, burned every dry season: black and bare patches on the slope.
function BurnedRidge() {
  return (
    <g className="fs-burn">
      <rect x="300" y="196" width="160" height="34" />
      <rect x="520" y="190" width="220" height="42" />
      <rect x="800" y="206" width="160" height="30" />
      <rect className="fs-burn__ash" x="360" y="210" width="60" height="14" />
      <rect className="fs-burn__ash" x="600" y="204" width="90" height="16" />
    </g>
  );
}

function Strip({ kind }) {
  if (kind === 'planted') {
    return (
      <g className="fs-strip">
        {Array.from({ length: 22 }, (_, i) => (
          <g key={i}>
            <rect x={326 + i * 30} y="282" width="18" height="14" />
            {i % 3 === 0 && <rect className="fs-strip__tree" x={330 + i * 30} y="262" width="10" height="22" />}
          </g>
        ))}
      </g>
    );
  }
  if (kind === 'channel') return <rect className="fs-channel" x="320" y="284" width="690" height="12" />;
  return null;
}

function Hills() {
  return (
    <g className="fs-hills">
      <rect x="0" y="214" width="400" height="50" />
      <rect x="60" y="192" width="230" height="30" />
      <rect x="120" y="176" width="110" height="20" />
      <rect x="330" y="226" width="460" height="40" />
      <rect x="430" y="206" width="210" height="26" />
      <rect x="880" y="208" width="560" height="56" />
      <rect x="990" y="188" width="300" height="26" />
      <rect x="1090" y="172" width="130" height="20" />
    </g>
  );
}

function Palm({ x, y, flip = false }) {
  return (
    <g transform={`translate(${x} ${y}) ${flip ? 'scale(-1 1)' : ''}`}>
      <g className="fs-trunk">
        <rect x="0" y="40" width="12" height="26" />
        <rect x="4" y="64" width="12" height="26" />
        <rect x="8" y="88" width="12" height="30" />
      </g>
      <g className="fs-frond">
        <rect x="-34" y="30" width="34" height="10" />
        <rect x="-46" y="40" width="16" height="10" />
        <rect x="12" y="24" width="38" height="10" />
        <rect x="46" y="34" width="16" height="10" />
        <rect x="-14" y="14" width="40" height="16" />
        <rect x="-6" y="4" width="20" height="12" />
      </g>
      <g className="fs-coconut">
        <rect x="-2" y="40" width="7" height="7" />
        <rect x="8" y="42" width="7" height="7" />
      </g>
    </g>
  );
}

function Farmhouse() {
  return (
    <g className="fs-house">
      <rect className="fs-house__wall" x="70" y="332" width="190" height="122" />
      <rect className="fs-house__plank" x="70" y="360" width="190" height="4" />
      <rect className="fs-house__plank" x="70" y="392" width="190" height="4" />
      <rect className="fs-house__plank" x="70" y="424" width="190" height="4" />
      <rect className="fs-house__roof" x="50" y="312" width="230" height="24" />
      <rect className="fs-house__roof" x="80" y="288" width="170" height="28" />
      <rect className="fs-house__roof" x="112" y="264" width="106" height="28" />
      <rect className="fs-house__door" x="150" y="392" width="38" height="62" />
      <rect className="fs-house__window" x="90" y="364" width="40" height="30" />
      <rect className="fs-house__frame" x="108" y="364" width="4" height="30" />
      <rect className="fs-house__window" x="208" y="364" width="36" height="30" />
      <rect className="fs-house__frame" x="224" y="364" width="4" height="30" />
    </g>
  );
}

function Tractor() {
  return (
    <g className="fs-tractor">
      {/* tiller behind */}
      <rect className="fs-steel" x="96" y="548" width="58" height="14" />
      {[100, 116, 132, 148].map((x) => (
        <rect key={x} className="fs-steel" x={x} y="560" width="6" height="22" />
      ))}
      <rect className="fs-red" x="150" y="496" width="118" height="54" />
      <rect className="fs-red" x="236" y="512" width="54" height="38" />
      <rect className="fs-red-dark" x="150" y="540" width="140" height="10" />
      <rect className="fs-cab" x="160" y="456" width="62" height="42" />
      <rect className="fs-glass" x="170" y="464" width="42" height="28" />
      <rect className="fs-roof" x="152" y="446" width="80" height="12" />
      <rect className="fs-steel" x="250" y="478" width="8" height="34" />
      <rect className="fs-steel" x="246" y="472" width="16" height="8" />
      {/* rear wheel, with tread */}
      <rect className="fs-tire" x="146" y="530" width="80" height="80" rx="6" />
      {[536, 556, 576, 596].map((ty) => (
        <rect key={ty} className="fs-tread" x="140" y={ty} width="8" height="10" />
      ))}
      {[536, 556, 576, 596].map((ty) => (
        <rect key={`r${ty}`} className="fs-tread" x="224" y={ty} width="8" height="10" />
      ))}
      <rect className="fs-rim" x="160" y="544" width="52" height="52" />
      <rect className="fs-hub" x="172" y="556" width="28" height="28" />
      {/* front wheel */}
      <rect className="fs-tire" x="250" y="566" width="44" height="44" rx="4" />
      <rect className="fs-hub" x="264" y="580" width="16" height="16" />
    </g>
  );
}

function FieldSurface({ field }) {
  const { x, y, w, h } = FIELD;
  return (
    <g className={`fs-field fs-field--${field}`}>
      <rect className="fs-field__base" x={x} y={y} width={w} height={h} />

      {field === 'plowed' &&
        ROWS.map((ry) => <rect key={ry} className="fs-row" x={x} y={ry} width={w} height="10" />)}

      {field === 'mulch' &&
        STRAW.map(([a, b, c], i) => (
          <rect
            key={i}
            className={c > 0.5 ? 'fs-straw' : 'fs-straw fs-straw--dark'}
            x={x + 6 + a * (w - 30)}
            y={y + 6 + b * (h - 16)}
            width={c > 0.3 ? 22 : 6}
            height={c > 0.3 ? 5 : 16}
          />
        ))}

      {field === 'seedlings' &&
        ROWS.map((ry) => (
          <g key={ry}>
            <rect className="fs-row fs-row--light" x={x} y={ry} width={w} height="6" />
            {Array.from({ length: 18 }, (_, i) => (
              <g key={i} className="fs-sprout">
                <rect x={x + 22 + i * 37} y={ry - 10} width="4" height="10" />
                <rect x={x + 16 + i * 37} y={ry - 16} width="16" height="6" />
              </g>
            ))}
          </g>
        ))}

      {field === 'bare' && (
        <>
          {ROWS.map((ry) => (
            <rect key={ry} className="fs-row fs-row--faint" x={x} y={ry} width={w} height="6" />
          ))}
          {[380, 520, 660, 800, 930].map((rx, i) => (
            <path
              key={rx}
              className="fs-rivulet"
              d={`M${rx} ${y + 10} q 26 70 6 140 t 18 120 t 30 ${70 + i * 6}`}
            />
          ))}
        </>
      )}

      {field === 'contour' &&
        ROWS.map((ry) => (
          <path key={ry} className="fs-contour" d={`M${x} ${ry} C ${x + 230} ${ry - 14}, ${x + 460} ${ry + 14}, ${x + w} ${ry}`} />
        ))}

      {field === 'furrows' && (
        <>
          {Array.from({ length: 16 }, (_, i) => (
            <rect key={i} className="fs-furrow" x={x + 18 + i * 42} y={y + 6} width="18" height={h - 12} />
          ))}
          {Array.from({ length: 16 }, (_, i) => (
            <path key={i} className="fs-mudflow" d={`M${x + 27 + i * 42} ${y + 10} V ${y + h - 10}`} />
          ))}
        </>
      )}

      <rect className="fs-field__edge" x={x} y={y} width={w} height={h} />
    </g>
  );
}

function Crops({ quality }) {
  return (
    <g className={`fs-crops fs-crops--${quality}`}>
      {ROWS.filter((_, i) => i % 2 === 0).map((ry) =>
        Array.from({ length: 12 }, (_, i) => {
          const cx = FIELD.x + 34 + i * 54;
          const small = quality === 'poor' && i % 3 !== 0;
          return (
            <g key={`${ry}-${i}`}>
              <rect className="fs-leaf" x={cx - 16} y={ry - 10} width={small ? 18 : 34} height="14" />
              {!small && <rect className="fs-leaf fs-leaf--top" x={cx - 8} y={ry - 20} width="18" height="10" />}
            </g>
          );
        }),
      )}
    </g>
  );
}

function Stream({ muddy }) {
  return (
    <g className={`fs-stream ${muddy ? 'is-muddy' : ''}`}>
      <rect x="1094" y="196" width="46" height="118" />
      <rect x="1104" y="306" width="46" height="118" />
      <rect x="1084" y="416" width="46" height="118" />
      <rect x="1098" y="526" width="46" height="112" />
      <g className="fs-stream__shine">
        <rect x="1104" y="230" width="6" height="22" />
        <rect x="1118" y="350" width="6" height="22" />
        <rect x="1096" y="460" width="6" height="22" />
        <rect x="1112" y="570" width="6" height="22" />
      </g>
    </g>
  );
}

function Bay({ muddy, reefGrey, plume }) {
  return (
    <g>
      <rect className="fs-sand" x="1000" y="626" width="440" height="16" />
      <rect className="fs-sea" x="1000" y="640" width="440" height="120" />
      <g className="fs-wave">
        <rect x="1030" y="676" width="30" height="4" />
        <rect x="1150" y="716" width="30" height="4" />
        <rect x="1380" y="664" width="30" height="4" />
      </g>
      {muddy && (
        <g className="fs-mudfan">
          <rect x="1060" y="640" width="150" height="34" />
          <rect x="1040" y="672" width="210" height="28" />
        </g>
      )}
      <g className={`fs-reef ${reefGrey ? 'is-grey' : ''}`}>
        <rect className="fs-coral-a" x="1222" y="690" width="40" height="30" />
        <rect className="fs-coral-a" x="1232" y="676" width="10" height="16" />
        <rect className="fs-coral-b" x="1268" y="700" width="46" height="22" />
        <rect className="fs-coral-b" x="1280" y="684" width="12" height="18" />
        <rect className="fs-coral-c" x="1320" y="694" width="34" height="28" />
        <rect className="fs-coral-c" x="1352" y="708" width="40" height="14" />
        <rect className="fs-coral-a" x="1364" y="694" width="10" height="16" />
      </g>
      {plume && (
        <path className="fs-plume" d="M1000 560 C 1060 600, 1110 650, 1180 680 S 1290 712, 1380 706" />
      )}
    </g>
  );
}

export default function FarmScene({ field = 'plowed', crops = null, strip = null, muddy = false, reefGrey = false, plume = false }) {
  return (
    <svg className="farm" viewBox="0 0 1440 760" preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
      <rect className="fs-sky" x="0" y="0" width="1440" height="260" />
      <Sun />
      <PuffCloud x={120} y={50} />
      <PuffCloud x={1010} y={84} s={0.8} />
      <Hills />
      <BurnedRidge />
      <RainCloud />
      <rect className="fs-grass" x="0" y="250" width="1440" height="510" />
      {TUFTS.map(([a, b], i) => {
        const tx = a * 1400;
        const ty = 270 + b * 470;
        const inField = tx > 300 && tx < 1010 && ty > 290 && ty < 660;
        const inBay = tx > 990 && ty > 620;
        return inField || inBay ? null : (
          <g key={i} className="fs-tuft">
            <rect x={tx} y={ty} width="4" height="10" />
            <rect x={tx + 6} y={ty + 4} width="4" height="6" />
          </g>
        );
      })}
      <Stream muddy={muddy} />
      <Farmhouse />
      <Palm x={30} y={226} />
      <Palm x={286} y={262} flip />
      <Palm x={1196} y={300} />
      <Palm x={1300} y={420} flip />
      <Strip kind={strip} />
      <FieldSurface field={field} />
      {crops && <Crops quality={crops} />}
      <Tractor />
      <Bay muddy={muddy} reefGrey={reefGrey} plume={plume} />
    </svg>
  );
}
