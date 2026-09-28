const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getDefaultWorkspace: () => ipcRenderer.invoke('app:getDefaultWorkspace'),
  selectFile: () => ipcRenderer.invoke('dialog:openFile'),
  selectDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  readDir: (path) => ipcRenderer.invoke('fs:readDir', path),
  readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('fs:writeFile', filePath, content),
  deleteFile: (filePath) => ipcRenderer.invoke('fs:deleteFile', filePath),
  confirmClose: () => ipcRenderer.invoke('dialog:confirmClose'),
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
});