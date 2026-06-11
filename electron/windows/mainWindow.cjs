const { BaseWindow, WebContentsView, nativeImage } = require('electron')
const { join } = require('path')
const isDev = process.env.NODE_ENV === 'development'

function createMainWindow() {
  const iconPath = join(__dirname, '../../public/kitty.png')
  const icon = nativeImage.createFromPath(iconPath)
  const appIcon = icon.isEmpty() ? undefined : icon
  
  console.log('Creating main window...')
  
  const win = new BaseWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    backgroundColor: '#1e1e2e',
    titleBarStyle: 'hidden',
    icon: appIcon,
    show: false
  })

  // LAYER 1 (Bottom): UI View
  const uiView = new WebContentsView({
    webPreferences: {
      preload: join(__dirname, '../preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  })
  uiView.setBackgroundColor('#1e1e2e')
  win.contentView.addChildView(uiView)
  console.log('UI view created (bottom layer)')

  // LAYER 2 (Middle): Web View
  const webView = new WebContentsView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  })
  webView.setBackgroundColor('#1e1e2e')
  win.contentView.addChildView(webView)
  console.log('Web view created (middle layer)')

  // LAYER 3 (Top): Search View
  const searchView = new WebContentsView({
    webPreferences: {
      preload: join(__dirname, '../preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  })
  searchView.setBackgroundColor('#00000000')
  searchView.setBounds({ x: -10000, y: -10000, width: 0, height: 0 })
  win.contentView.addChildView(searchView)
  console.log('Search view created (top layer)')
  
  const loadUrl = isDev ? 'http://localhost:5173' : `file://${join(__dirname, '../../dist/index.html')}`
  console.log(`Loading UI from: ${loadUrl}`)
  
  uiView.webContents.loadURL(loadUrl).catch(err => {
    console.error('Failed to load UI:', err)
  })
  
  // Load search view
  const searchLoadUrl = isDev ? 'http://localhost:5173/search.html' : `file://${join(__dirname, '../../dist/search.html')}`
  console.log('Loading search view from:', searchLoadUrl)
  searchView.webContents.loadURL(searchLoadUrl).catch(err => {
    console.error('Failed to load search view:', err)
  })
  
  searchView.webContents.on('did-finish-load', () => {
    console.log('Search view loaded successfully')
    searchView.webContents.executeJavaScript(`
      document.body.style.backgroundColor = 'transparent';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
    `)
  })
  
  uiView.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`UI failed to load: ${errorDescription} (${errorCode}) - URL: ${validatedURL}`)
  })
  
  uiView.webContents.on('did-finish-load', () => {
    console.log('UI loaded successfully')
  })

  win.uiView = uiView
  win.webView = webView
  win.searchView = searchView
  win.webViewBounds = { x: 48, y: 80, width: 1232, height: 696 }

  const updateBounds = () => {
    const { width, height } = win.getBounds()
    uiView.setBounds({ x: 0, y: 0, width, height })
  }
  
  win.on('resize', updateBounds)
  win.on('move', updateBounds)
  updateBounds()

  const ensureSearchOnTop = () => {
    const children = win.contentView.children
    if (children && children.length > 0 && children[children.length - 1] !== searchView) {
      win.contentView.removeChildView(searchView)
      win.contentView.addChildView(searchView)
    }
  }
  
  setInterval(ensureSearchOnTop, 100)

  uiView.webContents.once('did-finish-load', () => {
    console.log('Showing window...')
    win.show()
  })
  
  return win
}

module.exports = { createMainWindow }