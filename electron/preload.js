import { contextBridge , ipcRenderer } from 'electron'

// contextBridge — lets us safely expose things to React via window
// ipcRenderer — lets us send messages to the main process
contextBridge.exposeInMainWorld('electron',{
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    toggleDevTools:  () => ipcRenderer.send('window:toggleDevTools'),
    showOverlay:    (bounds) => ipcRenderer.send('overlay:show', bounds),
    hideOverlay:    () => ipcRenderer.send('overlay:hide'),
})


