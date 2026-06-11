const { randomUUID } = require('crypto')

class TabManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow
    this.tabs = new Map()
    this.activeTabId = null
    console.log('TabManager initialized')
  }

  createTab(url = 'https://www.google.com') {
    console.log(`createTab called with URL: ${url}`)
    const tabId = randomUUID()
    const webView = this.mainWindow.webView
    
    if (!webView) {
      console.error('WebView not available!')
      return null
    }
    
    console.log(`Loading URL in web view: ${url}`)
    webView.webContents.loadURL(url).catch(err => {
      console.error('Failed to load URL:', err)
    })
    
    this.tabs.set(tabId, { id: tabId, url, title: 'Loading...' })
    this.activeTabId = tabId
    
    if (this.mainWindow.uiView) {
      this.mainWindow.uiView.webContents.send('tab:loading', { tabId, isLoading: true })
      this.mainWindow.uiView.webContents.send('tab:created', { tabId, url })
    }
    
    webView.webContents.removeAllListeners('page-title-updated')
    
    webView.webContents.on('page-title-updated', (_, title) => {
      console.log(`Tab title updated: ${title}`)
      const tab = this.tabs.get(tabId)
      if (tab) {
        tab.title = title
        if (this.mainWindow.uiView) {
          this.mainWindow.uiView.webContents.send('tab:updated', { tabId, title })
          this.mainWindow.uiView.webContents.send('tab:loading', { tabId, isLoading: false })
        }
      }
    })
    
    webView.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      console.error(`Web view failed to load: ${errorDescription} (${errorCode}) - URL: ${validatedURL}`)
      if (this.mainWindow.uiView) {
        this.mainWindow.uiView.webContents.send('tab:loading', { tabId, isLoading: false })
      }
    })
    
    console.log(`Tab created with ID: ${tabId}`)
    return tabId
  }

  switchTab(tabId) {
    console.log(`switchTab called for: ${tabId}`)
    this.activeTabId = tabId
  }

  closeTab(tabId) {
    console.log(`closeTab called for: ${tabId}`)
    this.tabs.delete(tabId)
    if (this.activeTabId === tabId && this.tabs.size > 0) {
      this.activeTabId = Array.from(this.tabs.keys())[0]
    }
    if (this.mainWindow.uiView) {
      this.mainWindow.uiView.webContents.send('tab:closed', { tabId })
    }
  }
}

module.exports = { TabManager }