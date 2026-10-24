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
