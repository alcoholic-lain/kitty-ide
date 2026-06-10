# kitty-ide Handover

## Project Structure
```
kitty-ide/
├── electron/
│   ├── main.js                    ← App entry, creates both windows, IPC handlers
│   ├── preload.js                 ← Bridge between React & Electron
│   └── windows/
│       ├── mainWindow.js          ← Main app window (frameless, draggable)
│       └── overlayWindow.js       ← Transparent overlay for search results
├── src/
│   ├── components/
│   │   ├── HeaderBar/             ← Titlebar with window controls + search
│   │   ├── BottomBar/             ← Status bar
│   │   ├── Sidebar/               ← 48px icon sidebar
│   │   └── SearchBar/             ← Input + overlay results
│   ├── layouts/
│   │   └── MainLayout/            ← Sidebar + Editor area layout
│   ├── styles/
│   │   └── theme.css              ← CSS variables (Catppuccin Mocha)
│   ├── App.jsx
│   ├── main.jsx                   ← Main renderer entry
│   └── overlay.jsx                ← Overlay renderer entry
├── public/
│   └── kitty.png
├── index.html
├── overlay.html                   ← Second Vite entry for overlay window
└── vite.config.js                 ← Multi-entry build (index.html + overlay.html)
```

---

## Working Features ✅
- Frameless Electron window with custom HeaderBar
- Draggable window (`-webkit-app-region: drag`)
- Minimize / Maximize / Close buttons (Lucide icons)
- F12 and double-click logo toggles DevTools
- CSS variable theme system (Catppuccin Mocha)
- Sidebar + MainLayout + BottomBar layout
- HeaderBar now has two rows:
  - Row 1: logo | left | center | right (window buttons)
  - Row 2: `header-bar__util` — purple gradient bar, centered SearchBar
- Second transparent BrowserWindow (`overlayWindow`) created on startup
- IPC plumbing fully wired:
  - `overlay:show` → positions + shows overlay
  - `overlay:hide` → hides overlay
- `preload.js` exposes `showOverlay(bounds)` and `hideOverlay()` to React
- `SearchBar.jsx` fires `showOverlay` on focus, `hideOverlay` on blur
- Vite multi-entry config builds both `index.html` and `overlay.html`

---

## Current Bug 🔴 — Overlay Not Showing

### What was tried
- Confirmed `show: show` typo was fixed to `show: false` in `overlayWindow.js`
- Confirmed IPC handlers exist in `main.js`
- Manually called `window.electron.showOverlay(...)` from DevTools console — no window appeared
- All files look correct individually

### Most likely remaining causes to investigate

1. **Overlay window crashing on load**
   Add this to `main.js` right after `overlayWindow = createOverlayWindow()`:
   ```js
   overlayWindow.webContents.on('did-fail-load', (e, code, desc) => {
     console.error('Overlay failed to load:', code, desc)
   })
   overlayWindow.webContents.openDevTools({ mode: 'detach' })
   ```
   This will open a separate DevTools for the overlay and show any load errors.

2. **Vite not serving overlay.html**
   Open `http://localhost:5173/overlay.html` in a browser while dev server is running.
   If you get a 404, Vite isn't picking up the second entry — check `vite.config.js`:
   ```js
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import { resolve } from 'path'

   export default defineConfig({
     plugins: [react()],
     base: './',
     build: {
       rollupOptions: {
         input: {
           main: resolve(import.meta.dirname, 'index.html'),
           overlay: resolve(import.meta.dirname, 'overlay.html'),
         }
       }
     }
   })
   ```

3. **`overlay.html` missing or wrong**
   Make sure `overlay.html` exists at the project root and contains:
   ```html
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="UTF-8" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <title>overlay</title>
     </head>
     <body>
       <div id="overlay-root"></div>
       <script type="module" src="/src/overlay.jsx"></script>
     </body>
   </html>
   ```

4. **`overlay.jsx` import path wrong**
   `overlay.jsx` imports `./styles/theme.css` and `./components/SearchBar/SearchResults`.
   These paths are relative to `src/` — make sure the file is at `src/overlay.jsx`.

---

## Next Steps After Fixing Overlay

### 1. Wire query from SearchBar to SearchResults
In `SearchBar.jsx` add `useState` + send query via IPC:
```jsx
import { useRef, useState } from 'react'

const [query, setQuery] = useState('')

function handleChange(e) {
  const value = e.target.value
  setQuery(value)
  window.electron.sendQuery(value)
}
```

Add to `preload.js`:
```js
sendQuery: (query) => ipcRenderer.send('overlay:query', query)
```

In `main.js`:
```js
ipcMain.on('overlay:query', (event, query) => {
  overlayWindow.webContents.send('query:update', query)
})
```

In `overlayWindow.js` preload, expose a listener:
```js
onQuery: (cb) => ipcRenderer.on('query:update', (_, q) => cb(q))
```

In `SearchResults.jsx`:
```jsx
import { useState, useEffect } from 'react'

function SearchResults() {
  const [query, setQuery] = useState('')

  useEffect(() => {
    window.electron.onQuery((q) => setQuery(q))
  }, [])

  return (
    <div className="search-results">
      <p>{query || 'Start typing...'}</p>
    </div>
  )
}
```

### 2. Add blur → hide delay to SearchBar
Without this, clicking a result fires blur before the click lands:
```js
function handleBlur() {
  setTimeout(() => window.electron.hideOverlay(), 150)
}
```

### 3. Add Webview to MainLayout
```jsx
<webview src="https://example.com" style={{ width: '100%', height: '100%' }} />
```
The overlay should float above it because it's a separate `alwaysOnTop` BrowserWindow.

### 4. Sidebar Icons
```jsx
import { Search, Files, GitBranch, Settings } from 'lucide-react'
```

### 5. Resizable Sidebar
Listen to `mousedown` / `mousemove` on the sidebar border.

---

## Key Architecture Notes

| Problem | Solution |
|---|---|
| Overlay over webview | Separate `alwaysOnTop` BrowserWindow, not z-index |
| Frameless window draggable | `-webkit-app-region: drag` + `no-drag` on buttons |
| Header multi-row | `flex-direction: column` on `.header-bar`, each row is its own div |
| Drag zone covers all rows | `position: absolute; width: 100%; height: 100%` outside the row divs |
| Vite multi-entry | `rollupOptions.input` with both `index.html` and `overlay.html` |

## Theme Variables (Catppuccin Mocha)
```css
--color-base:     #1e1e2e
--color-mantle:   #181825
--color-crust:    #11111b
--color-surface:  #313244
--color-text:     #cdd6f4
--color-subtext:  #a6adc8
--color-red:      #f38ba8
--color-blue:     #89b4fa
--color-green:    #a6e3a1
--color-yellow:   #f9e2af
--color-mauve:    #cba6f7
--header-height:  40px
--sidebar-width:  48px
--bottom-height:  24px
--logo-dim:       35px
--color-border:   #211b25
--util-bg:        linear-gradient(to right, #1e1e2e, #2d1f3d, #1e1e2e)
```
