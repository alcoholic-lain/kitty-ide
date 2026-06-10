import { BrowserWindow } from 'electron'
import { join } from 'path'

const isDev = process.env.NODE_ENV === 'development'



export function createOverlayWindow(){
    const overlay = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,
    transparent: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false,
    show: false,
    webPreferences: {
      preload: join(import.meta.dirname, '../preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (isDev) {
    overlay.loadURL('http://localhost:5173/overlay.html')
  } else {
    overlay.loadFile(join(import.meta.dirname, '../../dist/overlay.html'))
  }

  return overlay
}





export function repositionOverlay(overlayWindow) {
    if (overlayWindow.isVisible()) {
        overlayWindow.hide()
    }
}