// Inline stroke icons — square caps, no fills, 24px grid.
const PATHS = {
  palm: (
    <>
      <path d="M12 21V10" />
      <path d="M12 10C10 6 6 6 4 8" />
      <path d="M12 10C14 6 18 6 20 8" />
      <path d="M12 10C9 9 6 11 5 14" />
      <path d="M12 10C15 9 18 11 19 14" />
      <path d="M7 21h10" />
    </>
  ),
  sun: (
    <>
      <rect x="8" y="8" width="8" height="8" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
    </>
  ),
  waves: (
    <>
      <path d="M3 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
      <path d="M3 13c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
      <path d="M3 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
    </>
  ),
  mountain: (
    <>
      <path d="M2 20l7-11 4 6 3-4 6 9z" />
      <path d="M7 12l2 1 2-1" />
    </>
  ),
  grass: (
    <>
      <path d="M3 21h18" />
      <path d="M6 21V11M6 14l-2-2M6 14l2-2" />
      <path d="M12 21V7M12 11l-3-3M12 11l3-3M12 15l-3-2M12 15l3-2" />
      <path d="M18 21V12M18 15l-2-2M18 15l2-2" />
    </>
  ),
  city: (
    <>
      <path d="M3 21h18" />
      <path d="M5 21V9h6v12" />
      <path d="M11 21V4h8v17" />
      <path d="M14 8h2M14 12h2M14 16h2M7 13h2M7 17h2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6-6-6-11a6 6 0 0 1 12 0c0 5-6 11-6 11z" />
      <rect x="10" y="8" width="4" height="4" />
    </>
  ),
  chevron: <path d="M9 5l7 7-7 7" />,
  search: (
    <>
      <rect x="4" y="4" width="12" height="12" />
      <path d="M16 16l5 5" />
    </>
  ),
  check: <path d="M4 12l5 5L20 6" />,
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" />
      <rect x="13" y="4" width="7" height="7" />
      <rect x="4" y="13" width="7" height="7" />
      <rect x="13" y="13" width="7" height="7" />
    </>
  ),
  external: (
    <>
      <path d="M14 4h6v6" />
      <path d="M20 4l-9 9" />
      <path d="M18 14v6H4V6h6" />
    </>
  ),
  // Scenario sprites
  coral: (
    <>
      <path d="M12 21V11M12 14l-4-4V6M12 12l4-4V5M8 10H5M16 8h3" />
      <path d="M6 21h12" />
    </>
  ),
  stream: (
    <>
      <path d="M4 3c4 3-2 6 2 9s-1 6 3 9" />
      <path d="M12 3c4 3-2 6 2 9s-1 6 3 9" />
    </>
  ),
  bucket: (
    <>
      <path d="M5 8h14l-2 13H7z" />
      <path d="M7 8a5 5 0 0 1 10 0" />
      <path d="M9 13h6" />
    </>
  ),
  anchor: (
    <>
      <rect x="10" y="2" width="4" height="4" />
      <path d="M12 6v15M8 10h8" />
      <path d="M4 14c0 4 4 7 8 7s8-3 8-7" />
    </>
  ),
  faucet: (
    <>
      <path d="M3 8h10v4H3z" />
      <path d="M13 10h4a3 3 0 0 1 3 3v2" />
      <path d="M8 4v4M5 4h6" />
      <path d="M20 18v2" />
    </>
  ),
  pump: (
    <>
      <rect x="4" y="9" width="10" height="12" />
      <path d="M9 9V4h7v4h4" />
      <path d="M7 14h4M7 17h4" />
      <path d="M17 21v-6" />
    </>
  ),
  lawn: (
    <>
      <path d="M3 20h18" />
      <path d="M5 20l1-5M9 20l-1-6M13 20l1-5M17 20l-1-6M21 20l-1-4" />
      <path d="M14 4h6v4" />
      <path d="M20 8l-3 3" />
    </>
  ),
  lid: (
    <>
      <rect x="4" y="9" width="16" height="10" />
      <path d="M2 9h20M10 6h4v3" />
      <path d="M8 14h8" />
    </>
  ),
  flask: (
    <>
      <path d="M9 3h6M10 3v6l-5 10v2h14v-2L14 9V3" />
      <path d="M8 15h8" />
    </>
  ),
  drain: (
    <>
      <rect x="4" y="6" width="16" height="12" />
      <path d="M8 6v12M12 6v12M16 6v12" />
    </>
  ),
  fence: (
    <>
      <path d="M3 20V8l2-3 2 3v12M10 20V8l2-3 2 3v12M17 20V8l2-3 2 3v12" />
      <path d="M3 11h18M3 16h18" />
    </>
  ),
  board: (
    <>
      <rect x="3" y="4" width="18" height="12" />
      <path d="M7 20l2-4M17 20l-2-4" />
      <path d="M7 8h6M7 12h10" />
    </>
  ),
  fish: (
    <>
      <path d="M3 12c3-5 9-6 14-2l4-3v10l-4-3c-5 4-11 3-14-2z" />
      <rect x="7" y="10" width="2" height="2" />
    </>
  ),
  can: (
    <>
      <rect x="6" y="9" width="10" height="11" />
      <path d="M16 12l5-4M8 9V6h6v3" />
    </>
  ),
  rain: (
    <>
      <path d="M5 13h13a3 3 0 0 0 0-6 5 5 0 0 0-9-1 4 4 0 0 0-4 7z" />
      <path d="M8 16l-1 3M12 16l-1 3M16 16l-1 3" />
    </>
  ),
  sunny: (
    <>
      <rect x="9" y="9" width="6" height="6" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    </>
  ),
  toilet: (
    <>
      <rect x="5" y="3" width="8" height="6" />
      <path d="M4 11h14a5 5 0 0 1-5 5H9v5h6" />
    </>
  ),
  hose: (
    <>
      <path d="M4 20c0-6 4-6 6-10s6-5 10-5" />
      <path d="M17 3l3 2-2 3" />
    </>
  ),
  washer: (
    <>
      <rect x="4" y="3" width="16" height="18" />
      <rect x="8" y="9" width="8" height="8" />
      <path d="M7 6h3" />
    </>
  ),
  kettle: (
    <>
      <path d="M6 9h11v11H6z" />
      <path d="M17 12h3v4h-3M9 9V6h5v3" />
    </>
  ),
  tank: (
    <>
      <rect x="3" y="6" width="18" height="13" />
      <path d="M3 10h18M8 14l2-2 2 2 2-2 2 2" />
    </>
  ),
  barrel: (
    <>
      <path d="M6 4h12v16H6z" />
      <path d="M6 9h12M6 15h12" />
      <path d="M12 1v3" />
    </>
  ),
  camera: (
    <>
      <rect x="3" y="7" width="18" height="13" />
      <rect x="9" y="10" width="6" height="6" />
      <path d="M8 7l2-3h4l2 3" />
    </>
  ),
  boat: (
    <>
      <path d="M3 15h18l-3 5H6z" />
      <path d="M12 15V3l6 9h-6" />
    </>
  ),
  home: (
    <>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
      <rect x="10" y="14" width="4" height="6" />
    </>
  ),
};

export function Icon({ name, size = 24, strokeWidth = 2, className = '' }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
