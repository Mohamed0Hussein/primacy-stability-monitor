import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true, // Be cautious with nodeIntegration for security
      contextIsolation: false, // Be cautious with contextIsolation for security
    },
    width: 1920,
    height: 1080,
    icon: path.join(__dirname, '../assets/icon.png'),
  });

  // Load your React app
  if (app.isPackaged) {
    // If packaged, load the built index.html from dist
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    // If in development, load from the Vite dev server
    mainWindow.loadURL("http://localhost:5173");
  }

  mainWindow.maximize();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});