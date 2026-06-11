const { app, ipcMain, net } = require('electron')
const { createMainWindow } = require('./windows/mainWindow.cjs')
const { TabManager } = require('./tabManager.cjs')
const { IPC } = require('./ipcChannels.cjs')

let mainWindow
let tabManager

app.commandLine.appendSwitch('enable-logging')

console.log('Electron main process starting...')

app.whenReady().then(() => {
  console.log('App ready, creating window...')
  mainWindow = createMainWindow()
  tabManager = new TabManager(mainWindow)

  if (mainWindow.uiView) {
    mainWindow.uiView.webContents.on('console-message', (event, level, message, line, sourceId) => {
      console.log(`[Renderer] ${message}`)
    })
  }

  // Window controls
  ipcMain.on(IPC.WINDOW_MINIMIZE, () => mainWindow.minimize())
  ipcMain.on(IPC.WINDOW_MAXIMIZE, () => {
    if (mainWindow.isMaximized()) mainWindow.unmaximize()
    else mainWindow.maximize()
  })
  ipcMain.on(IPC.WINDOW_CLOSE, () => app.quit())
  ipcMain.on(IPC.WINDOW_TOGGLE_DEVTOOLS, () => {
    if (mainWindow.uiView) {
      mainWindow.uiView.webContents.openDevTools({ mode: 'detach' })
    }
  })

  // Search query handler
  ipcMain.on(IPC.SEARCH_QUERY, async (event, query) => {
    console.log(`Search query: ${query}`)
    if (!query.trim()) {
      if (mainWindow && mainWindow.searchView) {
        mainWindow.searchView.webContents.send(IPC.SEARCH_SUGGESTIONS, [])
      }
      return
    }
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q=${encodeURIComponent(query)}`
    try {
      const response = await net.fetch(url)
      const data = await response.json()
      if (mainWindow && mainWindow.searchView) {
        mainWindow.searchView.webContents.send(IPC.SEARCH_SUGGESTIONS, data[1])
      }
    } catch (err) {
      console.error('Search failed:', err)
      if (mainWindow && mainWindow.searchView) {
        mainWindow.searchView.webContents.send(IPC.SEARCH_SUGGESTIONS, [])
      }
    }
  })

  // Show search results
  ipcMain.on('search:show', (event, bounds) => {
    if (mainWindow && mainWindow.searchView && bounds) {
      console.log('Showing search results with bounds:', bounds)
      const x = bounds.x || bounds.left
      const y = (bounds.y || bounds.top) + (bounds.height || 30)
      const width = bounds.width || 400
      mainWindow.searchView.setBounds({ 
        x: Math.round(x), 
        y: Math.round(y), 
        width: Math.round(width), 
        height: 400 
      })
      mainWindow.searchView.webContents.send('search:visibility', true)
    }
  })

  // Hide search results
  ipcMain.on('search:hide', () => {
    if (mainWindow && mainWindow.searchView) {
      console.log('Hiding search results')
      mainWindow.searchView.setBounds({ x: -10000, y: -10000, width: 0, height: 0 })
      mainWindow.searchView.webContents.send('search:visibility', false)
    }
  })

  // Tabs
  ipcMain.handle(IPC.TAB_CREATE, async (_, url) => {
    console.log(`Creating tab with URL: ${url}`)
    return tabManager.createTab(url || 'https://www.google.com')
  })
  ipcMain.on(IPC.TAB_CLOSE, (_, tabId) => {
    console.log(`Closing tab: ${tabId}`)
    tabManager.closeTab(tabId)
  })
  ipcMain.on(IPC.TAB_SWITCH, (_, tabId) => {
    console.log(`Switching to tab: ${tabId}`)
    tabManager.switchTab(tabId)
  })

  // Web view bounds update
  ipcMain.on('webview:update-bounds', (event, bounds) => {
    if (mainWindow && mainWindow.webView && bounds) {
      console.log('Updating web view bounds:', bounds)
      mainWindow.webView.setBounds(bounds)
      mainWindow.webViewBounds = bounds
    }
  })
  
  console.log('IPC handlers registered')
})

app.on('window-all-closed', () => {
  app.quit()
})