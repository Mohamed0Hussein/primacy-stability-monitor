import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'electron-updater';
const { autoUpdater } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = false;

let mainWindow = null;

function sendToRenderer(channel, payload) {
  mainWindow?.webContents.send(channel, payload);
}

autoUpdater.on('update-available', (info) => {
  sendToRenderer('update:available', { version: info.version });
});

autoUpdater.on('update-downloaded', (info) => {
  sendToRenderer('update:downloaded', { version: info.version });
});

autoUpdater.on('error', (err) => {
  sendToRenderer('update:error', err?.message || 'Update check failed');
});

ipcMain.handle('update:install', () => {
  autoUpdater.quitAndInstall();
});

function createWindow() {
  mainWindow = new BrowserWindow({
    title: `Primacy Stability Monitor v${app.getVersion()}`,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    width: 1920,
    height: 1080,
    icon: path.join(__dirname, '../assets/icon.png'),
  });

  // Keep the version in the title bar — don't let the page's <title> overwrite it
  mainWindow.on('page-title-updated', (event) => {
    event.preventDefault();
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

app.on('ready', () => {
  createWindow();

  if (app.isPackaged) {
    autoUpdater.checkForUpdates().catch((err) => {
      sendToRenderer('update:error', err?.message || 'Update check failed');
    });
  }
});

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