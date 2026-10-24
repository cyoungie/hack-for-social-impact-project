// Blocky face: rounded-3px head, two 5px square eyes, 10x3 mouth. `color` is any CSS color/var.
export function Avatar({ color, size = 96 }) {
  return (
    <svg
      className="avatar"
      width={size}
      height={size}
      viewBox="0 0 40 40"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
      style={{ '--avatar-color': color }}
    >
      <rect className="avatar__head" x="7" y="7" width="26" height="26" rx="3" />
      <rect className="avatar__ink" x="13" y="15" width="5" height="5" />
      <rect className="avatar__ink" x="22" y="15" width="5" height="5" />
      <rect className="avatar__ink" x="15" y="25" width="10" height="3" />
    </svg>
  );
}
