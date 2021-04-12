import { remote } from 'electron';

export function getCurrentWindow(): Electron.BrowserWindow {
  return remote.getCurrentWindow();
}

export function minimizeWindow(browserWindow = getCurrentWindow()): void {
  if (browserWindow.minimizable) {
    // browserWindow.isMinimizable() for old electron versions
    browserWindow.minimize();
  }
}

export function maximizeWindow(browserWindow = getCurrentWindow()): void {
  if (browserWindow.maximizable) {
    // browserWindow.isMaximizable() for old electron versions
    browserWindow.maximize();
  }
}

export function unmaximizeWindow(browserWindow = getCurrentWindow()): void {
  browserWindow.unmaximize();
}

export function maxUnmaxWindow(browserWindow = getCurrentWindow()): void {
  if (browserWindow.isMaximized()) {
    browserWindow.unmaximize();
  } else {
    browserWindow.maximize();
  }
}

export function closeWindow(browserWindow = getCurrentWindow()): void {
  browserWindow.close();
}

export function isWindowMaximized(browserWindow = getCurrentWindow()): boolean {
  return browserWindow.isMaximized();
}