# Kitty IDE — WebContentsView Refactor Readme

## Project Overview

Kitty IDE is an Electron-based browser automation studio with split-screen web views, action recording/replay, and VS Code-style layout management.

**Current State**: Search bar with Google suggestions working. Overlay window has native fade issues and doesn't follow window drag.

**Target State**: Professional IDE with tear-off tabs, resizable split panels, DOM overlays, and full browser automation capabilities.

---

## Current Architecture (Before Refactor)

```
┌─────────────────────────────────────────────────────────────┐
│                     BrowserWindow                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  React UI (HeaderBar, Sidebar, SearchBar, BottomBar)  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Overlay Window (BrowserWindow)                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SearchResults (positioned via IPC)                   │  │
│  │  - Native fade on hide (macOS)                        │  │
│  │  - Doesn't follow window drag                         │  │
│  │  - Separate OS window                                 │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    WebView (Not yet added)                  │
│                    Will have layering issues                │
└─────────────────────────────────────────────────────────────┘
```

### Current Problems

| Problem                               | Impact                        |
|---------------------------------------|-------------------------------|
| Overlay window doesn't follow drag    | Poor UX                       |
| Native fade on hide (macOS)           | Feels laggy                   |
| WebView would render under DOM        | Search dropdown buried        |
| No split-screen support               | Limited functionality         |
| No tab management                     | Cannot handle multiple pages  |
| No tear-off tabs                      | Not competitive with IDEs     |

---

## Target Architecture (After Refactor)

```
┌─────────────────────────────────────────────────────────────┐
│                       BaseWindow                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  contentView (Native View Container)                  │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Layer 3: IDE UI (React)                        │  │  │
│  │  │  - HeaderBar, Sidebar, BottomBar                │  │  │
│  │  │  - SearchBar with DOM dropdown (NO FADE!)       │  │  │
│  │  │  - Context menus, tooltips                      │  │  │
│  │  │  - Always on top of web content                 │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Layer 2: Web Content Views                     │  │  │
│  │  │  ┌──────────┬──────────┬──────────┐             │  │  │
│  │  │  │ Tab 1    │ Tab 2    │ Terminal │             │  │  │
│  │  │  │ WebView  │ WebView  │ View     │             │  │  │
│  │  │  └──────────┴──────────┴──────────┘             │  │  │
│  │  │  - Split-screen capable                         │  │  │
│  │  │  - Resizable via splitters                      │  │  │
│  │  │  - Hide on drag for performance                 │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Layer 1: Sidecar / Overlays (Native)           │  │  │
│  │  │  - Translation popups                           │  │  │
│  │  │  - Extension UI elements                        │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Tear-off Windows (BaseWindow)                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Single WebContentsView (moved from main)             │  │
│  │  - Preserves web page state                           │  │
│  │  - Can be reattached to main window                   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Features to Implement

### Phase 1: Core Architecture (Week 1)

| Feature                   | Description                           | Status     |
|---------------------------|---------------------------------------|------------|
| BaseWindow                | Replace BrowserWindow with BaseWindow | ⬜ Todo    |
| WebContentsView layers    | Create React UI view + Web views      | ⬜ Todo    |
| View stacking order       | Ensure React UI is on top             | ⬜ Todo    |
| Window resize handling    | Update all view bounds on resize      | ⬜ Todo    |
| 1px Windows resize fix    | Polling + bounds rounding             | ⬜ Todo    |
| Session partitioning      | Profile isolation per view            | ⬜ Todo    |

### Phase 2: Search Overlay (Week 1)

| Feature | Description | Status |
|---------|-------------|--------|
| Move to DOM | Render SearchResults in React UI layer | ⬜ Todo |
| Remove overlay window | Delete overlayWindow.js and overlay.html | ⬜ Todo |
| Remove IPC positioning | No more showOverlay/hideOverlay | ⬜ Todo |
| Keyboard navigation | Arrow keys, Enter, Escape | ✅ Done |
| Google suggestions | Fetch via main process | ✅ Done |
| Instant hide | No native fade | ✅ Done |

### Phase 3: Tab Management (Week 2)

| Feature | Description | Status |
|---------|-------------|--------|
| Tab bar UI | Visual tabs at top of web content area | ⬜ Todo |
| Create tab | New WebContentsView for each tab | ⬜ Todo |
| Close tab | Proper cleanup (webContents.close()) | ⬜ Todo |
| Switch tab | Change active view visibility | ⬜ Todo |
| Tab ordering | Drag to reorder tabs | ⬜ Todo |
| Tab state persistence | Save/restore tabs between sessions | ⬜ Todo |
| Tab discarding | Unload background tabs for memory | ⬜ Todo |
| Tab thumbnails | CapturePage for tab preview | ⬜ Todo |
| View pool | Reuse WebContentsView for recently closed | ⬜ Todo |

### Phase 4: Split Screen & Resizable Panels (Week 2-3)

| Feature | Description | Status |
|---------|-------------|--------|
| Layout engine | Integrate GoldenLayout | ⬜ Todo |
| Horizontal split | Left/right web views | ⬜ Todo |
| Vertical split | Top/bottom web views | ⬜ Todo |
| Nested splits | Multiple splits in any direction | ⬜ Todo |
| Resizable splitters | Drag to resize (hide-on-drag pattern) | ⬜ Todo |
| Minimum size constraints | Prevent panels from disappearing | ⬜ Todo |
| Layout persistence | Save/load layout from disk | ⬜ Todo |
| Collapsible side panels | Sidebar that can be hidden | ⬜ Todo |

### Phase 5: Tear-off Tabs (Week 3)

| Feature | Description | Status |
|---------|-------------|--------|
| Detach tab | Move WebContentsView to new BaseWindow | ⬜ Todo |
| New window creation | Position at cursor on drag | ⬜ Todo |
| State preservation | Page continues running | ⬜ Todo |
| Reattach tab | Move WebContentsView back to main | ⬜ Todo |
| Window tracking | Maintain relationship between windows | ⬜ Todo |
| Focus management | Don't steal focus on detach | ⬜ Todo |
| Cross-window tab drag | Drag tab directly between windows | ⬜ Todo |

### Phase 6: Automation Features (Week 4)

| Feature | Description | Status |
|---------|-------------|--------|
| Action recorder | Capture clicks, inputs, navigation | ⬜ Todo |
| Action storage | Save recordings as JSON | ⬜ Todo |
| Action replay | Execute recorded actions | ⬜ Todo |
| DOM highlighting | Visual feedback on selected elements | ⬜ Todo |
| Network monitoring | Per-view network traffic logging | ⬜ Todo |
| Console capture | Capture console.log per view | ⬜ Todo |
| Screenshot capture | CapturePage for reports | ⬜ Todo |
| Network throttling | Simulate slow connections | ⬜ Todo |
| User agent spoofing | Per-view User-Agent | ⬜ Todo |

### Phase 7: Overlay & UI Management (Week 4)

| Feature | Description | Status |
|---------|-------------|--------|
| Global overlay registry | Track all open overlays | ⬜ Todo |
| Z-index management | Coordinate overlay layering | ⬜ Todo |
| Context menus | Custom right-click menus | ⬜ Todo |
| Tooltips | Hover information | ⬜ Todo |
| Translation popup | Injected DOM popup | ⬜ Todo |
| Extension support | electron-chrome-extensions | ⬜ Optional |

### Phase 8: Polish & Performance (Week 5)

| Feature | Description | Status |
|---------|-------------|--------|
| Memory leak fixes | Proper cleanup on close | ⬜ Todo |
| Render process limit | Tab discarding + pooling | ⬜ Todo |
| IPC throttling | Batch bounds updates | ⬜ Todo |
| GPU acceleration | Enable compositing | ⬜ Todo |
| Error boundaries | Handle crashed views | ⬜ Todo |
| Layout serialization | Save/restore layouts | ⬜ Todo |

---

## Files to Create/Modify

### New Files

```
electron/
├── windows/
│   ├── mainWindow.js        (MODIFY: BrowserWindow → BaseWindow)
│   └── overlayWindow.js     (DELETE: no longer needed)
├── main.js                  (MODIFY: WebContentsView setup)
├── preload.js               (MODIFY: Remove overlay IPC)
├── tabManager.js            (NEW: Tab creation, closing, switching)
├── layoutManager.js         (NEW: GoldenLayout integration)
├── overlayRegistry.js       (NEW: Global z-index management)
├── viewPool.js              (NEW: Reuse WebContentsView)
└── ipcChannels.js           (NEW: Structured IPC constants)

src/
├── components/
│   ├── SearchBar/
│   │   ├── SearchBar.jsx    (MODIFY: Remove overlay IPC)
│   │   └── SearchResults.jsx (MODIFY: Now DOM, not separate window)
│   ├── TabBar/
│   │   ├── TabBar.jsx       (NEW)
│   │   └── TabBar.css       (NEW)
│   ├── Layout/
│   │   ├── Layout.jsx       (NEW: GoldenLayout container)
│   │   └── Layout.css       (NEW)
│   └── WebViewPanel/
│       ├── WebViewPanel.jsx (NEW: Renders placeholder, IPC to main)
│       └── WebViewPanel.css (NEW)
├── stores/
│   ├── tabStore.js          (NEW: Tab state management)
│   ├── layoutStore.js       (NEW: Layout state management)
│   └── overlayStore.js      (NEW: Overlay registry)
├── overlay.jsx              (DELETE: No longer separate window)
└── overlay.html             (DELETE: No longer needed)
```

### Files to Keep (Mostly Unchanged)

```
src/
├── components/
│   ├── HeaderBar/           (KEEP: Minor changes for tab bar integration)
│   ├── BottomBar/           (KEEP: Unchanged)
│   └── Sidebar/             (KEEP: Unchanged)
├── styles/
│   └── theme.css            (KEEP: Add CSS variables for safe zones)
├── App.jsx                  (KEEP: Wrap with Layout component)
└── main.jsx                 (KEEP: Unchanged)
```

---

## Technical Specifications

### 1. BaseWindow Configuration

```javascript
const { BaseWindow, WebContentsView } = require('electron')

const mainWindow = new BaseWindow({
  width: 1280,
  height: 800,
  minWidth: 800,
  minHeight: 600,
  frame: false,
  backgroundColor: '#1e1e2e',
  titleBarStyle: 'hidden'
})

// Layer 3: React UI (on top)
const uiView = new WebContentsView({
  webPreferences: { preload: join(__dirname, 'preload.js') }
})
mainWindow.contentView.addChildView(uiView)
uiView.setBounds({ x: 0, y: 0, width: 1280, height: 800 })
uiView.webContents.loadURL('http://localhost:5173')

// Layer 2: Web content (initially hidden until tabs created)
// Layer 1: Sidecar overlays (optional)
```

### 2. Tab Management API

```javascript
// tabManager.js
class TabManager {
  createTab(url, options)      // Returns tabId
  closeTab(tabId)              // Cleanup + webContents.close()
  switchTab(tabId)             // Change active view
  detachTab(tabId)             // Move to new BaseWindow
  reattachTab(tabId, position) // Move back to main window
  getTabState(tabId)           // Returns { url, history, scrollPosition }
}
```

### 3. IPC Channel Structure

```javascript
// ipcChannels.js
export const IPC = {
  // Tabs
  TAB_CREATE: 'tab:create',
  TAB_CLOSE: 'tab:close',
  TAB_SWITCH: 'tab:switch',
  TAB_DETACH: 'tab:detach',
  TAB_REATTACH: 'tab:reattach',
  
  // Layout
  LAYOUT_UPDATE_BOUNDS: 'layout:update-bounds',
  LAYOUT_SPLIT: 'layout:split',
  LAYOUT_SAVE: 'layout:save',
  LAYOUT_LOAD: 'layout:load',
  
  // Overlays
  OVERLAY_REGISTER: 'overlay:register',
  OVERLAY_UNREGISTER: 'overlay:unregister',
  OVERLAY_BRING_TO_FRONT: 'overlay:bring-to-front',
  
  // Automation
  ACTION_RECORD: 'action:record',
  ACTION_REPLAY: 'action:replay',
  CAPTURE_SCREENSHOT: 'capture:screenshot'
}
```

### 4. Layout Engine Integration

```javascript
// Layout.jsx
import GoldenLayout from 'golden-layout'

const layoutConfig = {
  settings: { hasHeaders: true, constrainDragToContainer: false },
  content: [{
    type: 'row',
    content: [
      { type: 'component', componentName: 'webview', componentState: { url: 'about:blank' } }
    ]
  }]
}

// When GoldenLayout creates a component, create a WebContentsView in main process
// When GoldenLayout resizes, send bounds to main process via IPC
```

### 5. Overlay Registry

```javascript
// overlayStore.js
class OverlayRegistry {
  constructor() {
    this.overlays = []  // [{ id, zIndex, element, type }]
    this.nextZIndex = 1000
  }
  
  register(id, element, type) {
    const zIndex = this.nextZIndex++
    this.overlays.push({ id, element, type, zIndex })
    this.updateZIndices()
    return zIndex
  }
  
  bringToFront(id) {
    const overlay = this.overlays.find(o => o.id === id)
    if (overlay) {
      overlay.zIndex = this.nextZIndex++
      this.updateZIndices()
    }
  }
  
  updateZIndices() {
    this.overlays.sort((a, b) => a.zIndex - b.zIndex)
    this.overlays.forEach((overlay, i) => {
      overlay.element.style.zIndex = 1000 + i
    })
  }
}
```

---

## Known Issues & Workarounds

| Issue | Workaround | Priority |
|-------|------------|----------|
| 1px Windows resize bug | Poll for bounds changes every 16ms | 🔴 High |
| Hide on drag feels jarring | Pre-allocate view at predicted size | 🟡 Medium |
| Memory leak on tab close | Always call webContents.close() | 🔴 High |
| Render process limit | Implement tab discarding | 🟡 Medium |
| Z-index conflicts | Centralized overlay registry | 🟡 Medium |
| Layout lost on restart | Serialize to userData directory | 🟡 Medium |
| IPC overload on resize | Throttle to 16ms intervals | 🟢 Low |
| Cross-window tab drag | Complex, defer to later | 🟢 Low |

---

## Migration Checklist

### Phase 1: Core Architecture (2 days)
- [ ] Replace BrowserWindow with BaseWindow
- [ ] Create React UI WebContentsView
- [ ] Remove overlay window completely
- [ ] Move SearchResults into DOM
- [ ] Test search overlay (no fade, follows drag)

### Phase 2: Tab System (3 days)
- [ ] Implement tab bar UI
- [ ] Create TabManager in main process
- [ ] Add create/close/switch tab functionality
- [ ] Add tab state persistence
- [ ] Test memory cleanup on close

### Phase 3: Layout (3 days)
- [ ] Integrate GoldenLayout
- [ ] Implement split-screen
- [ ] Add resize handlers with hide-on-drag
- [ ] Add layout persistence
- [ ] Test nested splits

### Phase 4: Tear-off Tabs (2 days)
- [ ] Implement detach tab to new window
- [ ] Implement reattach to main window
- [ ] Test state preservation
- [ ] Test focus management

### Phase 5: Automation (3 days)
- [ ] Add action recorder
- [ ] Add action storage
- [ ] Add action replay
- [ ] Add DOM highlighting
- [ ] Add network monitoring

### Phase 6: Polish (2 days)
- [ ] Add error boundaries for crashed views
- [ ] Add tab thumbnails
- [ ] Add view pool for recently closed tabs
- [ ] Add network throttling controls
- [ ] Performance testing

---

## Success Criteria

| Feature | Success Metric |
|---------|----------------|
| Search overlay | No fade, follows window drag perfectly |
| Split-screen | Resize without visible lag (>30fps) |
| Tear-off tabs | Move between windows without page reload |
| Memory usage | <500MB for 10 tabs |
| Tab switching | <100ms to switch active tab |
| Layout persistence | Restores exactly on restart |
| Action replay | Successfully replays recorded actions |

---

## Rollback Plan

If refactor fails, revert to commit:

```bash
git checkout pre-refactor-search-working
```

The current working state is:
- Search bar with Google suggestions
- Overlay window with fade (acceptable for now)
- No webview yet
- All IPC channels working

The refactor is worth the risk because it:
1. Fixes the overlay fade permanently
2. Enables split-screen web views
3. Enables tear-off tabs
4. Sets foundation for automation features

---

## Questions Before Starting

1. **GoldenLayout license**: MIT, compatible with closed source ✅
2. **Electron 41 compatibility**: WebContentsView stable since 28 ✅
3. **Windows resize bug**: Workaround exists (polling) ✅
4. **Memory target**: <500MB for 10 tabs achievable ✅
5. **Timeline**: 2 weeks for core, 3 weeks for automation ✅

---

**Prepared by**: Architecture Review  
**Date**: 2026-06-10  
**Next Step**: Begin Phase 1 — Replace BrowserWindow with BaseWindow