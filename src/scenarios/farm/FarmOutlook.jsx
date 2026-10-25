import { useMemo, useState } from 'react';
import { PixelButton } from '../../components/ui.jsx';
import YearStrip from '../typhoon/YearStrip.jsx';
import FarmMap from './FarmMap.jsx';
import { PLAN_LABELS, planName, runSoil } from './soilRule.js';

// Five-year outlook for Rosa's farm from the player's tractor and ridge choices.
// Try another plan reruns the tractor and ridge choices side by side, on the same storms.
export function planFrom(done) {
  return {
    depth: done.tractor?.state.depth || 'shallow',
    path: done.tractor?.state.path || 'contour',
    strip: done.ridge?.state || 'nothing',
    cover: done.cover?.state || 'mulch',
  };
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="field">
      <span className="label">{label}</span>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {Object.entries(options).map(([id, text]) => (
          <option key={id} value={id}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function FarmOutlook({ done }) {
  const yours = planFrom(done);
  const [other, setOther] = useState(null);
  const [draft, setDraft] = useState({ ...yours, path: yours.path === 'contour' ? 'downhill' : 'contour' });
  const [choosing, setChoosing] = useState(false);
  const a = useMemo(() => runSoil(yours), [yours.depth, yours.path, yours.strip, yours.cover]); // eslint-disable-line react-hooks/exhaustive-deps
  const b = useMemo(() => (other ? runSoil(other) : null), [other]);
  const map = (plan) => (f) => <FarmMap plan={plan} frame={f} layers={{ landcover: true, gully: true }} label={`Year ${f.year}`} />;

  return (
    <div className="prim">
      <div className={`fund__strips ${other || choosing ? 'is-compare' : ''}`}>
        <YearStrip title={`Your plan · ${planName(yours)}`} result={a} renderMap={map(yours)} instant={Boolean(other)} />
        {other && <YearStrip key={planName(other)} title={`Another plan · ${planName(other)}`} result={b} renderMap={map(other)} />}
        {choosing && !other && (
          <div className="prim">
            <p className="label">Another plan · same storms</p>
            <Select label="Tiller depth" value={draft.depth} options={PLAN_LABELS.depth} onChange={(v) => setDraft((d) => ({ ...d, depth: v }))} />
            <Select label="Tractor path" value={draft.path} options={PLAN_LABELS.path} onChange={(v) => setDraft((d) => ({ ...d, path: v }))} />
            <Select label="Top of the field" value={draft.strip} options={PLAN_LABELS.strip} onChange={(v) => setDraft((d) => ({ ...d, strip: v }))} />
            <PixelButton onClick={() => setOther(draft)}>Run this plan</PixelButton>
          </div>
        )}
      </div>
      {!choosing && !other && (
        <button type="button" className="pbtn pbtn--ghost" onClick={() => setChoosing(true)}>
          Try another plan
        </button>
      )}
    </div>
  );
}
