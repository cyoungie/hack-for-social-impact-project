import { useState } from 'react';
import { PixelButton } from '../../components/ui.jsx';
import { usePick } from '../../components/usePick.js';
import VillageMap, { HOUSES, atRisk } from './VillageMap.jsx';

// 2.1 shows two toggles; land cover and slope are on the baseline map.
const LAYERS = [
  { id: 'flood', label: 'Flood', note: 'The ground the water reached on Tuesday.' },
  { id: 'bigger', label: 'Bigger storm', note: "A wider band, from the island's hazard map." },
];

// Understand the risk: toggle layers, tag each house At risk or Safe.
export default function RiskMap({ config, onComplete }) {
  const [layers, setLayers] = useState({ flood: true });
  const [tags, setTags] = useState({});
  const { picked, itemProps, targetProps } = usePick();
  const allTagged = HOUSES.every((h) => tags[h.id]);

  const submit = () => {
    const right = HOUSES.filter((h) => (tags[h.id] === 'risk') === atRisk(h)).length;
    const tier = right === HOUSES.length ? config.all : right >= 5 ? config.some : config.most;
    onComplete({
      points: tier.points,
      feedback: tier.feedback,
      verdict: right === HOUSES.length ? 'correct' : right >= 5 ? 'ok' : 'wrong',
      state: { right, tags },
      source: config.source,
    });
  };

  const shown = LAYERS.filter((l) => layers[l.id]);

  return (
    <div className="prim">
      <div className="riskmap">
        <div className="riskmap__map">
          <VillageMap layers={layers} tags={tags} label="Village map with the layers you turned on" />
          {HOUSES.map((h, i) => (
            <button
              key={h.id}
              type="button"
              className={`riskmap__house ${picked ? 'is-target' : ''}`}
              style={{ left: `${(h.x / 400) * 100}%`, top: `${(h.y / 300) * 100}%` }}
              aria-label={`House ${i + 1}${tags[h.id] ? `, tagged ${tags[h.id] === 'risk' ? 'at risk' : 'safe'}` : ''}`}
              {...targetProps((tag) => setTags((t) => ({ ...t, [h.id]: tag })))}
            />
          ))}
        </div>

        <div className="riskmap__side">
          <p className="label">Map layers</p>
          <div className="riskmap__toggles">
            {LAYERS.map((l) => (
              <button
                key={l.id}
                type="button"
                className={`timechip ${layers[l.id] ? 'is-on' : ''}`}
                aria-pressed={Boolean(layers[l.id])}
                onClick={() => setLayers((s) => ({ ...s, [l.id]: !s[l.id] }))}
              >
                {l.label}
              </button>
            ))}
          </div>
          <ul className="riskmap__notes">
            {shown.map((l) => (
              <li key={l.id}>
                <span className="label">{l.label}</span> {l.note}
              </li>
            ))}
          </ul>

          <p className="label">Tags · drag onto a house, or click a tag then a house</p>
          <div className="riskmap__tags">
            <button type="button" className={`token token--risk ${picked === 'risk' ? 'is-picked' : ''}`} {...itemProps('risk')}>
              At risk
            </button>
            <button type="button" className={`token token--safe ${picked === 'safe' ? 'is-picked' : ''}`} {...itemProps('safe')}>
              Safe
            </button>
          </div>
          <p className="caption">
            {Object.keys(tags).length} of {HOUSES.length} houses tagged
          </p>
        </div>
      </div>

      <PixelButton className="pbtn--block" disabled={!allTagged} onClick={submit}>
        Recommend map
      </PixelButton>
    </div>
  );
}
