```
kitty-ide/
├── electron/
│   ├── main.js
│   ├── preload.js
│   ├── ipcChannels.js           (NEW)
│   ├── tabManager.js             (NEW)
│   └── windows/
│       ├── mainWindow.js         (MODIFIED - BaseWindow replacement)
│       └── overlayWindow.js      (DELETE)
├── src/
│   ├── components/
│   │   ├── HeaderBar/
│   │   │   ├── HeaderBar.jsx
│   │   │   └── HeaderBar.css
│   │   ├── BottomBar/
│   │   │   ├── BottomBar.jsx
│   │   │   └── BottomBar.css
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.jsx
│   │   │   └── Sidebar.css
│   │   ├── SearchBar/
│   │   │   ├── SearchBar.jsx      (MODIFIED - DOM results)
│   │   │   ├── SearchBar.css
│   │   │   ├── SearchResults.jsx  (MODIFIED - DOM dropdown)
│   │   │   └── SearchResults.css  (MODIFIED)
│   │   └── TabBar/                (NEW)
│   │       ├── TabBar.jsx
│   │       └── TabBar.css
│   ├── layouts/
│   │   └── MainLayout/
│   │       ├── MainLayout.jsx     (MODIFIED - add TabBar)
│   │       └── MainLayout.css     (MODIFIED)
│   ├── styles/
│   │   └── theme.css
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   ├── index.css
│   └── overlay.jsx                (DELETE)
├── index.html
├── overlay.html                   (DELETE)
├── vite.config.js                 (MODIFIED - remove overlay)
├── package.json
└── package-lock.json
```