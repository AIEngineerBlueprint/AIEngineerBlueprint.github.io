# Platform Architecture

AIEngineerBlueprint is a static-first learning platform:

- `index.html` is the dashboard.
- `sections/<track>/index.html` contains track overviews.
- `sections/<track>/<chapter>.html` contains generated lessons.
- `assets/css/styles.css` owns responsive layout, accessibility states, and visual design.
- `assets/js/app.js` owns LocalStorage progress, bookmarks, command palette search, quizzes, reading time, theme switching, keyboard shortcuts, expandable diagrams, and service worker registration.
- `search-index.json` powers offline search.
- `service-worker.js` caches core assets and progressively caches visited pages.

The generator emits plain HTML so GitHub Pages can host the repository root without Node, bundlers, package managers, or a backend.
