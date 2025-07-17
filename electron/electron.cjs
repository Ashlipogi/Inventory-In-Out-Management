const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec, spawn } = require('child_process');
const waitOn = require('wait-on');
const fs = require('fs');

let laravelProcess = null;
let viteProcess = null;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const rootPath = path.join(__dirname, '..');

  // Check if we're in development or production
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  // Use embedded PHP and Node paths
  const phpPath = path.join(rootPath, 'php', 'php.exe');
  const nodePath = path.join(rootPath, 'node', 'node.exe');

  console.log('Root path:', rootPath);
  console.log('PHP path:', phpPath);
  console.log('Node path:', nodePath);

  // Start Laravel server
  console.log('Starting Laravel server...');

  // Check if we should use embedded PHP or system PHP
  const useEmbeddedPHP = require('fs').existsSync(phpPath);
  const phpCommand = useEmbeddedPHP ? phpPath : 'php';

  laravelProcess = spawn(phpCommand, ['artisan', 'serve', '--host=127.0.0.1', '--port=8000'], {
    cwd: rootPath,
    stdio: 'pipe',
    shell: true,  // Use shell to handle path issues
    env: {
      ...process.env,
      // Disable problematic PHP extensions
      PHP_INI_SCAN_DIR: ''
    }
  });

  laravelProcess.stdout.on('data', (data) => {
    console.log('Laravel:', data.toString());
  });

  laravelProcess.stderr.on('data', (data) => {
    console.error('Laravel Error:', data.toString());
  });

  laravelProcess.on('close', (code) => {
    console.log(`Laravel process exited with code ${code}`);
  });

  // Start Vite dev server
  console.log('Starting Vite dev server...');

  // Check if we should use embedded node or system node
  const useEmbeddedNode = require('fs').existsSync(nodePath);
  const nodeCommand = useEmbeddedNode ? nodePath : 'node';

  viteProcess = spawn(nodeCommand, ['node_modules/vite/bin/vite.js', '--port', '5173', '--host', '127.0.0.1'], {
    cwd: rootPath,
    stdio: 'pipe',
    shell: true  // Use shell to handle path issues
  });

  viteProcess.stdout.on('data', (data) => {
    console.log('Vite:', data.toString());
  });

  viteProcess.stderr.on('data', (data) => {
    console.error('Vite Error:', data.toString());
  });

  viteProcess.on('close', (code) => {
    console.log(`Vite process exited with code ${code}`);
  });

  // Wait for both servers to be ready
  console.log('Waiting for servers to be ready...');

  // First wait for Laravel
  waitOn({
    resources: ['http://127.0.0.1:8000'],
    timeout: 30000,
    interval: 1000,
    window: 1000
  }, (err) => {
    if (err) {
      console.error('Laravel server not ready:', err);
    } else {
      console.log('Laravel server ready!');
    }

    // Then wait for Vite
    waitOn({
      resources: ['http://127.0.0.1:5173'],
      timeout: 30000,
      interval: 1000,
      window: 1000
    }, (viteErr) => {
      if (viteErr) {
        console.error('Vite server not ready:', viteErr);
        console.log('Loading Laravel directly...');
        mainWindow.loadURL('http://127.0.0.1:8000');
      } else {
        console.log('Vite server ready! Loading application...');
        mainWindow.loadURL('http://127.0.0.1:5173');
      }
    });
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    stopServers();
  });
}

function stopServers() {
  console.log('Stopping servers...');

  if (laravelProcess) {
    laravelProcess.kill('SIGTERM');
    laravelProcess = null;
  }

  if (viteProcess) {
    viteProcess.kill('SIGTERM');
    viteProcess = null;
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  stopServers();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopServers();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
