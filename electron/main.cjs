const { app, BrowserWindow, ipcMain, dialog, Menu, session } = require('electron');
const path = require('path');
const fs = require('fs/promises');
const fsSync = require('fs');

let mainWindow;
let currentProjectPath = null;

function createWindow() {
  // Content Security Policy
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'none'"
        ],
      },
    });
  });

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'QualCode',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  buildMenu();
}

function buildMenu() {
  const isDev = !!process.env.VITE_DEV_SERVER_URL;

  const viewSubmenu = [
    { role: 'reload' },
    { type: 'separator' },
    { role: 'zoomIn' },
    { role: 'zoomOut' },
    { role: 'resetZoom' },
  ];
  if (isDev) {
    viewSubmenu.splice(1, 0, { role: 'toggleDevTools' });
  }

  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow.webContents.send('menu:new-project'),
        },
        {
          label: 'Open Project...',
          accelerator: 'CmdOrCtrl+O',
          click: () => handleOpenProject(),
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow.webContents.send('menu:save'),
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => handleSaveAs(),
        },
        { type: 'separator' },
        {
          label: 'Export CSV...',
          click: () => mainWindow.webContents.send('menu:export-csv'),
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    { label: 'View', submenu: viewSubmenu },
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// Path validation — only allow paths under Documents
function isPathAllowed(requestedPath) {
  const documentsDir = app.getPath('documents');
  const resolved = path.resolve(requestedPath);
  return resolved.startsWith(documentsDir + path.sep) || resolved === documentsDir;
}

function sanitizeFilename(name) {
  return path.basename(name).replace(/[<>:"/\\|?*]/g, '_').replace(/\.\./g, '_').slice(0, 100);
}

function validateState(state) {
  return (
    state &&
    typeof state === 'object' &&
    state.schemaVersion === 1 &&
    typeof state.transcripts === 'object' && state.transcripts !== null &&
    typeof state.codes === 'object' && state.codes !== null &&
    typeof state.excerpts === 'object' && state.excerpts !== null
  );
}

async function handleOpenProject() {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Open QualCode Project Folder',
    properties: ['openDirectory'],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const projectDir = result.filePaths[0];

    if (!isPathAllowed(projectDir)) {
      dialog.showErrorBox('Access Denied', 'Projects must be inside your Documents folder.');
      return;
    }

    const projectFile = path.join(projectDir, 'project.json');

    try {
      await fs.access(projectFile);
      const raw = await fs.readFile(projectFile, 'utf-8');
      const state = JSON.parse(raw);

      if (!validateState(state)) {
        dialog.showErrorBox('Invalid Project', 'The project file is corrupted or has an unsupported format.');
        return;
      }

      currentProjectPath = projectDir;
      updateTitle();
      mainWindow.webContents.send('project:loaded', { state, path: projectDir });
    } catch (e) {
      if (e.code === 'ENOENT') {
        dialog.showErrorBox('Invalid Project', 'No project.json found in the selected folder.');
      } else {
        dialog.showErrorBox('Error', `Failed to read project: ${e.message}`);
      }
    }
  }
}

async function handleSaveAs() {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Choose Project Folder',
    properties: ['openDirectory', 'createDirectory'],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const targetPath = result.filePaths[0];
    if (!isPathAllowed(targetPath)) {
      dialog.showErrorBox('Access Denied', 'Projects must be saved inside your Documents folder.');
      return;
    }
    currentProjectPath = targetPath;
    updateTitle();
    mainWindow.webContents.send('project:save-as', currentProjectPath);
  }
}

function updateTitle() {
  const name = currentProjectPath ? path.basename(currentProjectPath) : 'Untitled';
  mainWindow.setTitle(`QualCode — ${name}`);
}

// IPC handlers

ipcMain.handle('fs:save-project', async (_event, { projectPath, state }) => {
  try {
    if (typeof projectPath === 'string' && !isPathAllowed(projectPath)) {
      return { success: false, error: 'Path not allowed. Projects must be in Documents.' };
    }
    if (!validateState(state)) {
      return { success: false, error: 'Invalid state object.' };
    }

    const dir = projectPath || currentProjectPath || getDefaultProjectPath();
    await fs.mkdir(dir, { recursive: true });
    await fs.mkdir(path.join(dir, 'transcripts'), { recursive: true });
    await fs.mkdir(path.join(dir, 'exports'), { recursive: true });

    await fs.writeFile(
      path.join(dir, 'project.json'),
      JSON.stringify(state, null, 2),
      'utf-8',
    );

    if (state.transcripts) {
      for (const t of Object.values(state.transcripts)) {
        const safeName = sanitizeFilename(t.title || 'untitled');
        const filename = `${safeName}_${t.id.slice(0, 8)}.txt`;
        await fs.writeFile(
          path.join(dir, 'transcripts', filename),
          t.text || '',
          'utf-8',
        );
      }
    }

    if (!currentProjectPath) {
      currentProjectPath = dir;
      updateTitle();
    }

    return { success: true, path: dir };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('fs:load-project', async (_event, projectPath) => {
  try {
    if (typeof projectPath === 'string' && !isPathAllowed(projectPath)) {
      return { success: false, error: 'Path not allowed.' };
    }

    const dir = projectPath || getDefaultProjectPath();
    const projectFile = path.join(dir, 'project.json');

    try {
      await fs.access(projectFile);
    } catch {
      return { success: true, state: null };
    }

    const raw = await fs.readFile(projectFile, 'utf-8');
    const state = JSON.parse(raw);

    if (!validateState(state)) {
      return { success: false, error: 'Project file is corrupted.' };
    }

    currentProjectPath = dir;
    updateTitle();
    return { success: true, state };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('fs:export-csv', async (_event, { csv, defaultName }) => {
  if (typeof csv !== 'string' || typeof defaultName !== 'string') {
    return { success: false, error: 'Invalid parameters.' };
  }

  const safeName = sanitizeFilename(defaultName);

  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Export CSV',
    defaultPath: safeName,
    filters: [{ name: 'CSV', extensions: ['csv'] }],
  });

  if (!result.canceled && result.filePath) {
    try {
      await fs.writeFile(result.filePath, csv, 'utf-8');

      if (currentProjectPath) {
        const exportsDir = path.join(currentProjectPath, 'exports');
        await fs.mkdir(exportsDir, { recursive: true });
        await fs.writeFile(path.join(exportsDir, safeName), csv, 'utf-8');
      }

      return { success: true, path: result.filePath };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
  return { success: false, error: 'cancelled' };
});

ipcMain.handle('fs:get-default-path', () => {
  return getDefaultProjectPath();
});

function getDefaultProjectPath() {
  return path.join(app.getPath('documents'), 'QualCode Projects', 'Default');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
