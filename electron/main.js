import { app, ipcMain, net } from 'electron'
import { createMainWindow } from './windows/mainWindow.js'
import { createOverlayWindow } from './windows/overlayWindow.js'

const isDev = process.env.NODE_ENV === 'development'

let mainWindow
let overlayWindow
let overlayVisible = false

app.whenReady().then(() => {
  mainWindow = createMainWindow()
  overlayWindow = createOverlayWindow(mainWindow)

  // Listen for keyboard events in main window and forward to overlay
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (!overlayVisible) return
    
    const relevantKeys = ['ArrowUp', 'ArrowDown', 'Enter', 'Escape']
    if (relevantKeys.includes(input.key)) {
      event.preventDefault()
      overlayWindow.webContents.send('keyboard:event', input.key)
    }
  })

  // Window controls
  ipcMain.on('window:minimize', () => mainWindow.minimize())
  ipcMain.on('window:maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })
  ipcMain.on('window:close', () => app.quit())
  
  if (isDev) {
    ipcMain.on('window:toggleDevTools', () => {
      if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools()
      } else {
        mainWindow.webContents.openDevTools({ mode: 'detach' })
      }
    })
  }

  // Overlay: show
  ipcMain.on('overlay:show', (event, bounds) => {
    const [winX, winY] = mainWindow.getPosition()
    const x = Math.round(winX + bounds.x)
    const y = Math.round(winY + bounds.y + bounds.height)
    overlayWindow.setPosition(x, y)
    overlayWindow.setSize(Math.round(bounds.width), 400)
    overlayWindow.show()
    overlayWindow.webContents.send('overlay:visibility', true)
    overlayVisible = true
  })

  // Overlay: hide
  ipcMain.on('overlay:hide', () => {
    overlayWindow.webContents.send('overlay:visibility', false)
    overlayVisible = false
  })

  // Suggestion selection
  ipcMain.on('suggestion:select', (event, suggestion) => {
    console.log('Selected:', suggestion)
    mainWindow.webContents.send('suggestion:selected', suggestion)
    overlayWindow.webContents.send('overlay:visibility', false)
    overlayVisible = false
  })

  // Overlay: query with Google suggest fetch
  ipcMain.on('overlay:query', (event, query) => {
    overlayWindow.webContents.send('query:update', query)

    if (!query.trim()) return

    const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q=${encodeURIComponent(query)}`

    net.fetch(url)
      .then(r => r.json())
      .then(data => overlayWindow.webContents.send('suggestions:update', data[1]))
      .catch(() => overlayWindow.webContents.send('suggestions:update', []))
  })

  // Hide overlay on move/resize
  mainWindow.on('move', () => {
    if (overlayWindow.isVisible()) {
      overlayWindow.webContents.send('overlay:visibility', false)
      overlayVisible = false
    }
  })

  mainWindow.on('resize', () => {
    if (overlayWindow.isVisible()) {
      overlayWindow.webContents.send('overlay:visibility', false)
      overlayVisible = false
    }
  })
})

app.on('window-all-closed', () => {
  app.quit()
})