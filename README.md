# hack-for-social-impact-project

COMMON GROUND — desktop web game MVP (UNCCD land-planning challenge). Vite + React + plain CSS, no backend.

```sh
npm install
npm run dev
```

- Drop the island art at `public/guam-pixel.png` (444:562, transparent). A placeholder shows until it exists.
- Save state lives in `localStorage` under `cg_save` — clear it to restart the run.
- Design tokens: `src/styles/tokens.css`. Scenes: `src/scenes/`. Copy, problem data and forecast math: `src/data/game.js`.
