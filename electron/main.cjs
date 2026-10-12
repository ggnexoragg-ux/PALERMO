const { app, BrowserWindow, shell } = require('electron')

const GAME_URL = 'https://palermo.gg/'
const WINDOW_BACKGROUND = '#08070d'

function errorPage(title, message) {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Palermo — Connection issue</title>
  <style>
    *{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#08070d;color:#f7f4ff;font:16px/1.6 Segoe UI,Arial,sans-serif}
    main{width:min(560px,calc(100% - 40px));padding:36px;border:1px solid #30263e;border-radius:20px;background:linear-gradient(145deg,#171020,#0d0b12);box-shadow:0 24px 90px #0008}
    .mark{color:#c4a2ff;font-size:12px;font-weight:700;letter-spacing:.22em}h1{margin:14px 0 8px;font-size:30px}p{color:#c8c1d3}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}
    a,button{display:inline-block;border:1px solid #6c4b91;border-radius:10px;padding:11px 16px;background:#8c5bd0;color:white;text-decoration:none;font:inherit;font-weight:600;cursor:pointer}
    a.secondary{background:transparent;border-color:#494052;color:#eee7f7}small{display:block;margin-top:22px;color:#8f879b}
  </style>
</head>
<body><main><div class="mark">PALERMO</div><h1>${title}</h1><p>${message}</p>
<div class="actions"><button onclick="location.href='${GAME_URL}'">Try again</button><a class="secondary" href="https://palermo.gg/" target="_blank">Open in browser</a></div>
<small>Check your internet connection, then try again. If the website works in your browser, reopen Palermo after refreshing it.</small></main></body></html>`
  return 'data:text/html;charset=utf-8,' + encodeURIComponent(html)
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    minHeight: 620,
    title: 'Palermo',
    backgroundColor: WINDOW_BACKGROUND,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  })

  let showingErrorPage = false

  win.once('ready-to-show', () => win.show())

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  win.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    if (!isMainFrame || showingErrorPage || errorCode === -3) return
    console.error('[Palermo] Main-frame load failed:', { errorCode, errorDescription, validatedURL })
    showingErrorPage = true
    win.loadURL(errorPage('Could not load Palermo', 'The game website could not be reached. Your installation is still okay; retry the connection or open the website in your browser.'))
      .catch(error => console.error('[Palermo] Could not show connection page:', error))
  })

  win.webContents.on('render-process-gone', (_event, details) => {
    console.error('[Palermo] Renderer process exited:', details)
    if (!win.isDestroyed()) {
      showingErrorPage = true
      win.loadURL(errorPage('Palermo stopped unexpectedly', 'The game window stopped responding. Try reloading it or open Palermo in your browser.'))
        .catch(error => console.error('[Palermo] Could not show recovery page:', error))
    }
  })

  win.webContents.on('console-message', (_event, details) => {
    if (details.level >= 2) {
      console.error('[Palermo page]', details.message, details.sourceId, details.lineNumber)
    }
  })

  win.webContents.on('did-finish-load', () => {
    console.log('[Palermo] Page loaded:', win.webContents.getURL())
  })

  win.loadURL(GAME_URL).catch(error => {
    console.error('[Palermo] Initial navigation failed:', error)
    if (!win.isDestroyed() && !showingErrorPage) {
      showingErrorPage = true
      win.loadURL(errorPage('Could not load Palermo', 'The game website could not be reached. Check your internet connection and try again.'))
        .catch(fallbackError => console.error('[Palermo] Could not show connection page:', fallbackError))
    }
  })

  return win
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
