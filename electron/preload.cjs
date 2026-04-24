const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveProject: (data) => ipcRenderer.invoke('fs:save-project', data),
  loadProject: (projectPath) => ipcRenderer.invoke('fs:load-project', projectPath),
  exportCsv: (data) => ipcRenderer.invoke('fs:export-csv', data),
  getDefaultPath: () => ipcRenderer.invoke('fs:get-default-path'),

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
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('project:loaded', handler);
    return () => ipcRenderer.removeListener('project:loaded', handler);
  },
  onProjectSaveAs: (callback) => {
    const handler = (_event, p) => callback(p);
    ipcRenderer.on('project:save-as', handler);
    return () => ipcRenderer.removeListener('project:save-as', handler);
  },
});
