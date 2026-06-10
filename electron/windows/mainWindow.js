import { BrowserWindow } from 'electron'
import { join } from 'path'


const isDev = process.env.NODE_ENV === 'development'


export function createMainWindow(){
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        frame: false,
        backgroundColor: '#1e1e2e',
        icon: join(import.meta.dirname,'../../public/kitty.png'),
        webPreferences: {
            preload: join(import.meta.dirname, '../preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox:false,
        }

    })
    // so if in production dev tools don't open and youload from static files on disk
    if(isDev){
        win.loadURL('http://localhost:5173')
        // F12 toggles devtools
        win.webContents.on('before-input-event', (event, input) => {
            if (input.key === 'F12') {
                if (win.webContents.isDevToolsOpened()) {
                    win.webContents.closeDevTools()
                } else {
                    win.webContents.openDevTools({ mode: 'detach' })
                }
            }
        })
    }else{
        win.loadFile(join(import.meta.dirname,'../../dist/index.html'))
    }
     return win

}