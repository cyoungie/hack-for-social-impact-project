import { useRef, useState } from 'react';
import { PixelButton } from '../components/ui.jsx';
import { Icon } from '../components/Icons.jsx';
import { compareWith } from '../data/scoring.js';

// Mini-map is 300x210; the field slopes down toward the stream along the bottom edge,
// so contour lines run left-right and "across the slope" means a mostly horizontal path.
const MAP_W = 300;
const MAP_H = 210;
const MIN_PATH = 90;
const CONTOURS = [38, 70, 102, 134, 166];

const PRESET_PATHS = {
  contour: [
    [30, 50], [270, 56], [270, 88], [30, 84], [30, 118], [270, 122], [270, 152], [30, 150],
  ],
  downhill: [
    [50, 24], [56, 186], [100, 186], [96, 24], [146, 24], [150, 186], [196, 186], [192, 24],
  ],
};

function classify(points) {
  let dx = 0;
  let dy = 0;
  for (let i = 1; i < points.length; i += 1) {
    dx += Math.abs(points[i][0] - points[i - 1][0]);
    dy += Math.abs(points[i][1] - points[i - 1][1]);
  }
  if (dx + dy < MIN_PATH) return null;
  return dx >= dy * 1.5 ? 'contour' : 'downhill';
}

// P3 (+ a vertical P2): set the tiller depth, then drag the tractor's path across the field.
export default function TillerPlan({ config, onComplete }) {
  const [depthIdx, setDepthIdx] = useState(config.startDepth);
  const [points, setPoints] = useState([]);
  const drawing = useRef(false);
  const svgRef = useRef(null);
  const depth = config.depths[depthIdx];
  const path = classify(points);

  const toSvg = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * MAP_W, ((e.clientY - r.top) / r.height) * MAP_H];
  };

  const onDown = (e) => {
    drawing.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setPoints([toSvg(e)]);
  };
  const onMove = (e) => {
    if (!drawing.current) return;
    const p = toSvg(e);
    setPoints((pts) => {
      const last = pts[pts.length - 1];
      return Math.hypot(p[0] - last[0], p[1] - last[1]) > 4 ? [...pts, p] : pts;
    });
  };
  const onUp = () => {
    drawing.current = false;
  };

  const submit = () => {
    const depthOk = depth.ok;
    const pathOk = path === 'contour';
    const r = depthOk && pathOk ? config.results.right : depthOk ? config.results.badPath : pathOk ? config.results.badDepth : config.results.both;
    onComplete({
      points: r.points,
      feedback: r.feedback,
      verdict: depthOk && pathOk ? 'correct' : depthOk || pathOk ? 'ok' : 'wrong',
      state: { depth: depth.id, path },
      compare:
        depthOk && pathOk
          ? compareWith('Deep tilling, straight down the slope', config.results.both.points, config.results.both.feedback)
          : compareWith('No-till or shallow, along the contour', config.results.right.points, config.results.right.feedback),
    });
  };

  const tip = points[points.length - 1];

  return (
    <div className="prim">
      <div className="till">
        <section className="till__step">
          <p className="label">Step 1 · Tiller depth</p>
          <div className="till__depth">
            <input
              className="vslider"
              type="range"
              min={0}
              max={config.depths.length - 1}
              step={1}
              value={depthIdx}
              aria-label="Tiller depth"
              aria-valuetext={`${depth.label}, ${depth.sub}`}
              onChange={(e) => setDepthIdx(Number(e.target.value))}
            />
            <ol className="till__stops" aria-hidden="true">
              {config.depths.map((d, i) => (
                <li key={d.id} className={i === depthIdx ? 'is-on' : ''}>
                  <span className="till__stop-name">{d.label}</span>
                  <span className="till__stop-sub">{d.sub}</span>
                </li>
              ))}
            </ol>
            <svg className="xsection" viewBox="0 0 120 150" shapeRendering="crispEdges" aria-label={`Soil cross-section: tines reach ${depth.sub}`} role="img">
              <rect className="xs__top" x="0" y="20" width="120" height="40" />
              <rect className="xs__mid" x="0" y="60" width="120" height="45" />
              <rect className="xs__sub" x="0" y="105" width="120" height="45" />
              <text className="xs__txt" x="4" y="32">TOPSOIL</text>
              <text className="xs__txt" x="4" y="117">SUBSOIL</text>
              <rect className="xs__bar" x="10" y="8" width="100" height="10" />
              {[22, 46, 70, 94].map((x) => (
                <rect key={x} className="xs__tine" x={x} y="18" width="5" height={depth.reach} />
              ))}
            </svg>
          </div>
          <p className="caption">{depth.note}</p>
        </section>

        <section className="till__step">
          <p className="label">Step 2 · Drive the tractor</p>
          <svg
            ref={svgRef}
            className="minimap"
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            role="img"
            aria-label={`Field map sloping down to a stream. ${path ? `Path drawn: ${path === 'contour' ? 'across the slope' : 'up and down the slope'}.` : 'No path drawn yet.'}`}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          >
            <rect className="mm__field" x="0" y="0" width={MAP_W} height={MAP_H - 20} />
            {CONTOURS.map((y, i) => (
              <path
                key={y}
                className="mm__contour"
                d={`M0 ${y} C 80 ${y - 8}, 220 ${y + 8}, ${MAP_W} ${y}`}
                vectorEffect="non-scaling-stroke"
              >
                <title>{`Contour ${i + 1}`}</title>
              </path>
            ))}
            <rect className="mm__stream" x="0" y={MAP_H - 20} width={MAP_W} height="20" />
            <text className="mm__txt" x="8" y={MAP_H - 6}>
              STREAM — DOWNHILL
            </text>
            <text className="mm__txt" x="8" y="14">
              UPHILL
            </text>
            {points.length > 1 && (
              <polyline
                className={`mm__strip ${path === 'downhill' ? 'is-bad' : ''}`}
                points={points.map((p) => p.join(',')).join(' ')}
              />
            )}
            {tip && (
              <g transform={`translate(${tip[0] - 10} ${tip[1] - 10})`} className="mm__tractor">
                <rect width="20" height="20" />
              </g>
            )}
          </svg>
          <div className="till__paths">
            <span className="caption">Drag on the map — or pick:</span>
            <button type="button" className="timechip" onClick={() => setPoints(PRESET_PATHS.contour)}>
              Across the slope
            </button>
            <button type="button" className="timechip" onClick={() => setPoints(PRESET_PATHS.downhill)}>
              Up and down
            </button>
            <button type="button" className="timechip" disabled={!points.length} onClick={() => setPoints([])}>
              Clear
            </button>
          </div>
          <p className="caption" aria-live="polite">
            {points.length > 1 && !path
              ? 'Keep going — drive a longer path.'
              : path === 'contour'
                ? 'Path: across the slope, following the contour lines.'
                : path === 'downhill'
                  ? 'Path: straight up and down the slope.'
                  : 'Contour lines connect points at the same height.'}
          </p>
        </section>
      </div>

      <PixelButton className="pbtn--block" disabled={!path} onClick={submit}>
        <Icon name="tractor" size={22} /> Recommend plan
      </PixelButton>
    </div>
  );
}
