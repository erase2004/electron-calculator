import { contextBridge } from 'electron';
import { getCurrentWindow, minimizeWindow, maxUnmaxWindow, closeWindow, isWindowMaximized } from './menu-function';
import path from 'path';

contextBridge.exposeInMainWorld(
    'winApi',
    {
        'getCurrentWindow': getCurrentWindow,
        'minimizeWindow': minimizeWindow,
        'maxUnmaxWindow': maxUnmaxWindow,
        'closeWindow': closeWindow,
        'isWindowMaximized': isWindowMaximized,
        'iconPath': () => path.resolve('@', '../assets/icons/calculator.png')
    }
);