# Mòshì Huáxià / 末世华夏

A browser-based zombie-apocalypse survival and shelter-management game set in a fictional country inspired by modern China. This repository currently contains the **Leitian vertical slice**: a compact playable foundation used to validate the larger game design before the 12-region world is expanded.

The project is deliberately static and single-player. Runtime state lives in the browser through IndexedDB, so GitHub Pages does not require a backend.

## Playable vertical slice

The current slice includes seeded New Game creation, the Northern Suburbs and Railway District local maps, persistent looting and inventory, abstract infected encounters and tactical pause, survivor recruitment, a claimable apartment shelter with jobs/storage, a driveable utility van and district travel, CRA trading, radio/quest/research events, an evolving Railway District threat, IndexedDB saves, `.hxs` export/import, responsive UI, and accessibility settings.

Country-scale faction wars, the full 12-region/24-city map, deep relationship simulation, advanced vehicles/convoys, complete Project Huangquan investigation, and multiple end states are intentionally deferred to later milestones.

## Controls

- **WASD / Arrow keys** — move or drive
- **Shift** — sprint
- **E** — loot nearby container
- **I** — inventory
- **X** — abstract nearby attack
- **Space** — tactical pause/resume
- **R** — recruit nearby survivor
- **C** — claim nearby eligible building
- **H** — shelter panel
- **F** — enter/exit nearby vehicle
- **T** — district travel panel
- **G** — trader in Railway District
- **Q** — radio, quests, and research
- **Esc** — close the current modal

## Run locally

The runtime itself has no server-side dependency. The simplest local launch is:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Then open `http://127.0.0.1:4173/` in a browser.

For the Vite development server, install development dependencies and run:

```bash
npm install
npm run dev
```

## Verification

Dependency-free checks can run with Node alone:

```bash
npm run test:run
npm run check
```

The Playwright browser flow is prepared in `tests/e2e/vertical-slice.spec.js`. On a normal machine with npm/browser access:

```bash
npm install
npx playwright install chromium
npm run test:e2e
npm run build
```

There is also `npm run test:e2e:offline`, a no-package Chrome DevTools Protocol smoke runner for environments that already provide Chromium. It requires browser policy to allow local URLs.

## Test-only controls

The deterministic `Debug:` buttons used by E2E are available only when the URL includes `?test=1`. Normal play does not expose them, and they call the same gameplay systems used by the regular UI rather than maintaining a separate test state.

## Save files

Browser saves use IndexedDB database `moshi-huaxia`. Manual exports use the `.hxs` extension and contain versioned JSON state. Import validates the save version before loading it. World seeds reproduce the initial deterministic world, while subsequent player actions change that world independently.

## GitHub Pages

Because all runtime paths are relative, the repository can be published directly as a static GitHub Pages site. In the repository, open **Settings → Pages**, choose **Deploy from a branch**, select the branch you want to publish and the repository root, then save. The included `.nojekyll` file keeps the assets unchanged.

If you prefer a Vite build, run `npm install`, `npm run test:run`, and `npm run build`, then publish the generated `dist/` folder with a Pages workflow. `vite.config.js` uses `base: './'`, so assets continue to resolve when the game is hosted under a repository subpath.

## Project structure

```text
index.html             browser entry point
css/                   desktop, HUD, menu and mobile styles
data/                  regions, districts, items, infected, vehicles and factions
js/core/               state, clock, RNG and events
js/world/              local/world generation and simulation
js/combat/             combat and tactical mode
js/npc/                survivor and job systems
js/shelter/            shelter state and storage
js/vehicles/           vehicle and district-travel systems
js/factions/           faction state and relations
js/economy/            trading
js/quests/             quest state
js/research/           research progression
js/save/               IndexedDB and .hxs persistence
js/ui/                 menus, HUD, panels and settings
tests/unit/            domain tests
tests/integration/     complete vertical-slice state loop
tests/e2e/             browser acceptance flow
```

## Status

This is an early playable vertical slice, not the final full-country game. Its purpose is to lock down the architecture and survival loop before content expansion.
