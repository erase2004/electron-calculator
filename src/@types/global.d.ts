export default interface WinApi {
    getCurrentWindow: () => Electron.BrowserWindow;
    minimizeWindow: (browserWindow?: Electron.BrowserWindow) => void;
    maxUnmaxWindow: (browserWindow?: Electron.BrowserWindow) => void;
    closeWindow: (browserWindow?: Electron.BrowserWindow) => void;
    isWindowMaximized: (browserWindow?: Electron.BrowserWindow) => boolean;
    iconPath: () => string
}

declare global {
    interface Window {
        winApi: WinApi
    }
}