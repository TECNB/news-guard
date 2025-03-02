import { app, BrowserWindow, globalShortcut } from 'electron'
import path from 'path'

function createWindow() {
  // Enable remote module
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      devTools: true
    }
  })

  // In development, load from Vite dev server
  // In production, load from dist directory
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(app.getAppPath(), 'dist/index.html'))
  }
  
  // Always enable DevTools in both dev and prod
  win.webContents.openDevTools()
  
  // Register DevTools toggle shortcut for both dev and prod
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    win.webContents.toggleDevTools()
  })
  
  // Register reload shortcut
  globalShortcut.register('CommandOrControl+R', () => {
    win.reload()
  })

  return win
}

app.whenReady().then(() => {
  const mainWindow = createWindow()
  
  // Enable keyboard shortcuts
  globalShortcut.register('CommandOrControl+R', () => {
    mainWindow.reload()
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
