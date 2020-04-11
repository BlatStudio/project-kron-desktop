const {app, BrowserWindow, protocol, Menu} = require('electron');
const path = require('path');

let win;

const isDevelopment = process.env.NODE_ENV != 'production';
const winURL = isDevelopment ? `http://localhost:8080` : `kron://index.html`

function createWindow () {
  protocol.registerFileProtocol('kron', (request, callback) => {
    let url = request.url.substr(7);
    let files = [".js", ".css", '.map'];
    let fonts = ['.woff', '.woff2' ];
    let reqPath = path.normalize(url);
    if( files.includes(path.extname(reqPath)) ) {
      callback({ path: path.normalize(`${__dirname}/dist/${reqPath}`) })
    } else if( fonts.includes(path.extname(reqPath)) ) {
      reqPath = reqPath.replace('css/', '');
      callback({ path: path.normalize(`${__dirname}/dist/${reqPath}`) })
    } else {
      callback({ path: path.normalize(`${__dirname}/dist/index.html`) })
    }
  }, (error) => {
    if (error) console.error('Failed to register protocol')
  })

  let menu = Menu.buildFromTemplate([
    {
      label: 'Menu',
      submenu: [
        {type:'separator'},
        {
          label:'Quit Kron',
          click() { 
            app.quit() 
          } 
        }
      ]
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'Nova Promoção',
          click() {
            win.webContents.send('ping', 'whoooooooh!')
          }
        },
        {label:'CoinMarketCap'},
        {label:'Exit'}
      ]
    }
  ])
  Menu.setApplicationMenu(menu); 

  win = new BrowserWindow({
    width: 1200, height: 720,
    transparent: false,
    // titleBarStyle: 'hiddenInset',
    // frame: false,
    webPreferences: { // <--- (1) Additional preferences
      nodeIntegration: false,
      preload: `${__dirname}/preload.js` // <--- (2) Preload script
  }});
  win.loadURL(winURL); // <--- (3) Loading react
    
  if( isDevelopment ) {
    win.webContents.openDevTools();
  }

  win.on('closed', () => {  
      win = null
    });
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});
app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
});