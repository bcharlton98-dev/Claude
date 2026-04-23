const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let currentProjectPath = null;

function createWindow() {
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
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { role: 'resetZoom' },
      ],
    },
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

async function handleOpenProject() {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Open QualCode Project',
    filters: [{ name: 'QualCode Project', extensions: ['qualcode'] }],
    properties: ['openDirectory'],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const projectDir = result.filePaths[0];
    const projectFile = path.join(projectDir, 'project.json');

    if (!fs.existsSync(projectFile)) {
      dialog.showErrorBox('Invalid Project', 'No project.json found in the selected folder.');
      return;
    }

    try {
      const raw = fs.readFileSync(projectFile, 'utf-8');
      const state = JSON.parse(raw);
      currentProjectPath = projectDir;
      updateTitle();
      mainWindow.webContents.send('project:loaded', { state, path: projectDir });
    } catch (e) {
      dialog.showErrorBox('Error', `Failed to read project: ${e.message}`);
    }
  }
}

async function handleSaveAs() {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Choose Project Folder',
    properties: ['openDirectory', 'createDirectory'],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    currentProjectPath = result.filePaths[0];
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
    const dir = projectPath || currentProjectPath || getDefaultProjectPath();
    fs.mkdirSync(dir, { recursive: true });
    fs.mkdirSync(path.join(dir, 'transcripts'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'exports'), { recursive: true });

    // Save main project file
    fs.writeFileSync(
      path.join(dir, 'project.json'),
      JSON.stringify(state, null, 2),
      'utf-8',
    );

    // Save each transcript as a readable .txt file
    if (state.transcripts) {
      for (const t of Object.values(state.transcripts)) {
        const safeName = t.title.replace(/[<>:"/\\|?*]/g, '_').slice(0, 100);
        fs.writeFileSync(
          path.join(dir, 'transcripts', `${safeName}.txt`),
          t.text,
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
    const dir = projectPath || getDefaultProjectPath();
    const projectFile = path.join(dir, 'project.json');

    if (!fs.existsSync(projectFile)) {
      return { success: true, state: null };
    }

    const raw = fs.readFileSync(projectFile, 'utf-8');
    const state = JSON.parse(raw);
    currentProjectPath = dir;
    updateTitle();
    return { success: true, state };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('fs:export-csv', async (_event, { csv, defaultName }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Export CSV',
    defaultPath: defaultName,
    filters: [{ name: 'CSV', extensions: ['csv'] }],
  });

  if (!result.canceled && result.filePath) {
    try {
      fs.writeFileSync(result.filePath, csv, 'utf-8');

      // Also save to project exports folder if we have a project
      if (currentProjectPath) {
        const exportsDir = path.join(currentProjectPath, 'exports');
        fs.mkdirSync(exportsDir, { recursive: true });
        fs.writeFileSync(path.join(exportsDir, defaultName), csv, 'utf-8');
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
