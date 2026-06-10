import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
    // Window controls
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    toggleDevTools: () => ipcRenderer.send('window:toggleDevTools'),
    
    // Overlay controls
    showOverlay: (bounds) => ipcRenderer.send('overlay:show', bounds),
    hideOverlay: () => ipcRenderer.send('overlay:hide'),
    sendQuery: (query) => ipcRenderer.send('overlay:query', query),
    
    // Selection
    selectSuggestion: (suggestion) => ipcRenderer.send('suggestion:select', suggestion),
    
    // Listeners
    onQuery: (cb) => {
        const handler = (_, q) => cb(q)
        ipcRenderer.on('query:update', handler)
        return () => ipcRenderer.removeListener('query:update', handler)
    },
    onSuggestions: (cb) => {
        const handler = (_, s) => cb(s)
        ipcRenderer.on('suggestions:update', handler)
        return () => ipcRenderer.removeListener('suggestions:update', handler)
    },
    onOverlayVisibility: (cb) => {
        const handler = (_, v) => cb(v)
        ipcRenderer.on('overlay:visibility', handler)
        return () => ipcRenderer.removeListener('overlay:visibility', handler)
    },
    onSuggestionSelected: (cb) => {
        const handler = (_, s) => cb(s)
        ipcRenderer.on('suggestion:selected', handler)
        return () => ipcRenderer.removeListener('suggestion:selected', handler)
    },
    onKeyboardEvent: (cb) => {
        const handler = (_, key) => cb(key)
        ipcRenderer.on('keyboard:event', handler)
        return () => ipcRenderer.removeListener('keyboard:event', handler)
    },
})