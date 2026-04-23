const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveProject: (data) => ipcRenderer.invoke('fs:save-project', data),
  loadProject: (projectPath) => ipcRenderer.invoke('fs:load-project', projectPath),
  exportCsv: (data) => ipcRenderer.invoke('fs:export-csv', data),
  getDefaultPath: () => ipcRenderer.invoke('fs:get-default-path'),

  // Menu events from main process
  onMenuNewProject: (callback) => {
    ipcRenderer.on('menu:new-project', callback);
    return () => ipcRenderer.removeListener('menu:new-project', callback);
  },
  onMenuSave: (callback) => {
    ipcRenderer.on('menu:save', callback);
    return () => ipcRenderer.removeListener('menu:save', callback);
  },
  onMenuExportCsv: (callback) => {
    ipcRenderer.on('menu:export-csv', callback);
    return () => ipcRenderer.removeListener('menu:export-csv', callback);
  },
  onProjectLoaded: (callback) => {
    ipcRenderer.on('project:loaded', (_event, data) => callback(data));
    return () => ipcRenderer.removeListener('project:loaded', callback);
  },
  onProjectSaveAs: (callback) => {
    ipcRenderer.on('project:save-as', (_event, path) => callback(path));
    return () => ipcRenderer.removeListener('project:save-as', callback);
  },
});
