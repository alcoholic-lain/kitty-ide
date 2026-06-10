import { BrowserWindow } from 'electron'
import { join } from 'path'

const isDev = process.env.NODE_ENV === 'development'

export function createOverlayWindow(mainWindow) {
  const overlay = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,
    transparent: true,  // ← Window itself is transparent
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false,
    thickFrame: false,
    show: false,
    parent: mainWindow,
    backgroundColor: '#00000000',  // ← Fully transparent
    webPreferences: {
      preload: join(import.meta.dirname, '../preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (isDev) {
    overlay.loadURL('http://localhost:5173/overlay.html')
    overlay.webContents.openDevTools({ mode: 'detach' })
  } else {
    overlay.loadFile(join(import.meta.dirname, '../../dist/overlay.html'))
  }

  overlay.on('blur', () => {
    overlay.webContents.send('overlay:visibility', false)
  })

  return overlay
}