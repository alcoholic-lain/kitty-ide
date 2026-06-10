import {app, ipcMain} from 'electron'
import {createMainWindow} from './windows/mainWindow.js'
import { createOverlayWindow,repositionOverlay } from './windows/overlayWindow.js'

let overlayWindow





// app — Electron's core object, controls the application lifecycle (start, quit, ready etc)
// ipcMain — listens for messages sent from preload.js

let mainWindow

//The () => part means "a function that takes no arguments"
app.whenReady().then(()=>{
    mainWindow = createMainWindow()
    overlayWindow = createOverlayWindow()



mainWindow.on('move', () => repositionOverlay(overlayWindow))
mainWindow.on('resize', () => repositionOverlay(overlayWindow))

    ipcMain.on('window:minimize',()=>{mainWindow.minimize()})

    // isMaximized() is a built-in Electron method that returns true or false.
    ipcMain.on('window:maximize',()=>{
        if(mainWindow.isMaximized()){
            mainWindow.unmaximize()
        }else{
            mainWindow.maximize()
        }
    })

   ipcMain.on('window:close', () => app.quit())

    ipcMain.on('window:toggleDevTools', () => {
        if (mainWindow.webContents.isDevToolsOpened()) {
            mainWindow.webContents.closeDevTools()
        } else {
            mainWindow.webContents.openDevTools({ mode: 'detach' })
        }
    })




    ipcMain.on('overlay:show', (event, bounds) => {
        const [winX, winY] = mainWindow.getPosition()
        const x = Math.round(winX + bounds.x)
        const y = Math.round(winY + bounds.y + bounds.height)
        overlayWindow.setPosition(x, y)
        overlayWindow.setSize(Math.round(bounds.width), 400)
        overlayWindow.show()
    })

    ipcMain.on('overlay:hide', () => {
        overlayWindow.hide()
    })

})


app.on('window-all-closed', () => {
  app.quit()
})


