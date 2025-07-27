import { app, BrowserWindow } from 'electron';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import http from 'http';

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Handle unhandled promise rejections
process.on('unhandledRejection', error => {
  console.error('Unhandled Promise Rejection:', error);
});

let phpServer;
let viteDev;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // Change this if you want to point to Vite instead
  win.loadURL('http://localhost:5173');
}

function waitForVite(url, cb) {
  const tryConnect = () => {
    http.get(url, () => cb()).on('error', () => setTimeout(tryConnect, 500));
  };
  tryConnect();
}

app.whenReady().then(() => {
  // Start PHP server
  phpServer = spawn(
    path.join(__dirname, '../php/php.exe'),
    ['artisan', 'serve'],
    {
      cwd: path.join(__dirname, '../'),
      shell: true,
      windowsHide: true,
    }
  );

  phpServer.stdout.on('data', data => {
    console.log(`[PHP] ${data}`);
  });

  phpServer.stderr.on('data', data => {
    console.error(`[PHP ERROR] ${data}`);
  });

  // Start Vite dev server
  viteDev = spawn(
    path.join(__dirname, '../node/node.exe'),
    ['npm', 'run', 'dev'],
    {
      cwd: path.join(__dirname, '../'),
      shell: true,
      windowsHide: true,
    }
  );

  viteDev.stdout.on('data', data => {
    console.log(`[VITE] ${data}`);
  });

  viteDev.stderr.on('data', data => {
    console.error(`[VITE ERROR] ${data}`);
  });

  // Wait for Vite to be ready before opening the window
  waitForVite('http://localhost:5173', createWindow);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    phpServer && phpServer.kill();
    viteDev && viteDev.kill();
    app.quit();
  }
});
