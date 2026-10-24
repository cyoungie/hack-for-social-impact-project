import { useEffect, useState } from 'react';
import { Avatar } from './Avatar.jsx';

// 'loading' | 'ok' | 'missing' — lets art paths be coded now and dropped in later.
export function useImage(src) {
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    let alive = true;
    const img = new Image();
    img.onload = () => alive && setStatus('ok');
    img.onerror = () => alive && setStatus('missing');
    img.src = src;
    return () => {
      alive = false;
    };
  }, [src]);
  return status;
}

// Full-bleed scene background (cover, pixelated). Placeholder: horizon band tinted to the persona.
export function SceneBackdrop({ src, tint, className = '', children }) {
  const status = useImage(src);
  const style =
    status === 'ok'
      ? { backgroundImage: `url(${src})` }
      : {
          backgroundImage: `linear-gradient(180deg, color-mix(in srgb, ${tint} 22%, var(--panel)) 0 58%, color-mix(in srgb, ${tint} 60%, var(--ink) 12%) 58% 100%)`,
        };
  return (
    <div className={`backdrop ${className}`} style={style}>
      {children}
    </div>
  );
}

// Standing persona. Sprite art is 64x96; shown at 2.5x. Placeholder: blocky tinted figure.
export function PersonaSprite({ persona, className = '' }) {
  const status = useImage(persona.sprite);
  if (status === 'ok') {
    return <img className={`sprite ${className}`} src={persona.sprite} alt="" width={160} height={240} />;
  }
  return (
    <svg
      className={`sprite ${className}`}
      viewBox="0 0 64 96"
      width={160}
      height={240}
      shapeRendering="crispEdges"
      aria-hidden="true"
      style={{ '--tint': persona.tint }}
    >
      <rect className="sprite__shade" x="14" y="92" width="36" height="4" />
      <rect className="sprite__body" x="18" y="42" width="28" height="30" />
      <rect className="sprite__body" x="20" y="72" width="10" height="20" />
      <rect className="sprite__body" x="34" y="72" width="10" height="20" />
      <rect className="sprite__body" x="10" y="44" width="8" height="22" />
      <rect className="sprite__body" x="46" y="44" width="8" height="22" />
      <rect className="sprite__head" x="16" y="8" width="32" height="32" rx="3" />
      <rect className="sprite__ink" x="24" y="18" width="5" height="5" />
      <rect className="sprite__ink" x="35" y="18" width="5" height="5" />
      <rect className="sprite__ink" x="27" y="29" width="10" height="3" />
    </svg>
  );
}

// Head-and-shoulders crop of the sprite for the 96px portrait tile.
export function PersonaPortrait({ persona }) {
  const status = useImage(persona.sprite);
  return (
    <span className="portrait" style={{ '--tint': persona.tint }}>
      {status === 'ok' ? (
        <span className="portrait__crop" style={{ backgroundImage: `url(${persona.sprite})` }} />
      ) : (
        <Avatar color={persona.tint} size={78} />
      )}
    </span>
  );
}
