const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  pickFile: (filters) => ipcRenderer.invoke('pick-file', filters),
  pickSave: (name) => ipcRenderer.invoke('pick-save', name),
  encryptFile: (p) => ipcRenderer.invoke('encrypt-file', p),
  decryptFile: (p) => ipcRenderer.invoke('decrypt-file', p),
  encryptText: (p) => ipcRenderer.invoke('encrypt-text', p),
  decryptText: (p) => ipcRenderer.invoke('decrypt-text', p),
});