const { contextBridge, ipcRenderer } = require('electron')

console.log('Preload script loaded')

contextBridge.exposeInMainWorld('electron', {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    toggleDevTools: () => ipcRenderer.send('window:toggleDevTools'),
    
    sendQuery: (query) => ipcRenderer.send('search:query', query),
    onSuggestions: (cb) => {
      const handler = (_, s) => cb(s)
      ipcRenderer.on('search:suggestions', handler)
      return () => ipcRenderer.removeListener('search:suggestions', handler)
    },
    showSearchResults: (bounds) => ipcRenderer.send('search:show', bounds),
    hideSearchResults: () => ipcRenderer.send('search:hide'),
    onSearchVisibility: (cb) => {
      const handler = (_, visible) => cb(visible)
      ipcRenderer.on('search:visibility', handler)
      return () => ipcRenderer.removeListener('search:visibility', handler)
    },
    
    createTab: (url) => ipcRenderer.invoke('tab:create', url),
    closeTab: (tabId) => ipcRenderer.send('tab:close', tabId),
    switchTab: (tabId) => ipcRenderer.send('tab:switch', tabId),
    onTabCreated: (cb) => {
      const handler = (_, data) => cb(data)
      ipcRenderer.on('tab:created', handler)
      return () => ipcRenderer.removeListener('tab:created', handler)
    },
    onTabUpdated: (cb) => {
      const handler = (_, data) => cb(data)
      ipcRenderer.on('tab:updated', handler)
      return () => ipcRenderer.removeListener('tab:updated', handler)
    },
    onTabClosed: (cb) => {
      const handler = (_, data) => cb(data)
      ipcRenderer.on('tab:closed', handler)
      return () => ipcRenderer.removeListener('tab:closed', handler)
    },
    onTabLoading: (cb) => {
      const handler = (_, data) => cb(data)
      ipcRenderer.on('tab:loading', handler)
      return () => ipcRenderer.removeListener('tab:loading', handler)
    },
    
    updateWebViewBounds: (bounds) => {
      ipcRenderer.send('webview:update-bounds', bounds)
    },
})