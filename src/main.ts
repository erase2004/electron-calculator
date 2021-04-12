import { app, BrowserWindow } from 'electron';
import isDev from 'electron-is-dev';
import path from 'path';
import { closeWindow } from '@/preload/menu-function';

const createWindow = (): void => {

  const win = new BrowserWindow({
    title: 'Calculator',
    width: 450,
    height: 600,
    minWidth: 300,
    minHeight: 400,
    center: true,
    frame: false,
    webPreferences: {
      enableRemoteModule: true,
      preload: path.join(__dirname, "../build/preload.js"),
    }
  });

  win.loadURL(
      isDev
        ? 'http://localhost:9000/build/index.html'
        : `file://${path.join(__dirname, "../build/index.html")}`
  );

  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'Escape') {
      event.preventDefault();
      closeWindow(win);
    }
  });
}

app.on('ready', createWindow);
