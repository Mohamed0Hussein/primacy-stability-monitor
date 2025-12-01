 // electron-starter.js
 import { app, BrowserWindow } from 'electron';

 let mainWindow: BrowserWindow | null = null;

 function createWindow() {
   mainWindow = new BrowserWindow({
     webPreferences: {
       nodeIntegration: true, // Be cautious with nodeIntegration for security
       contextIsolation: false, // Be cautious with contextIsolation for security
     },
   });

   // Load your React app (either from the dev server or the built files)
   const startUrl = "http://localhost:5173";
   mainWindow.loadURL(startUrl);

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