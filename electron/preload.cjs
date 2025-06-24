const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 文件操作
  saveFileDialog: () => ipcRenderer.invoke('save-file-dialog'),
  
  // 监听主进程事件
  onNewDocument: (callback) => ipcRenderer.on('new-document', callback),
  onOpenFile: (callback) => ipcRenderer.on('open-file', callback),
  onSaveDocument: (callback) => ipcRenderer.on('save-document', callback),
  
  // 移除监听器
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // 系统信息
  platform: process.platform,
  
  // 剪贴板操作
  readClipboard: () => ipcRenderer.invoke('read-clipboard'),
  writeClipboard: (text) => ipcRenderer.invoke('write-clipboard', text),
  
  // 图片上传相关
  uploadImage: (imageData) => ipcRenderer.invoke('upload-image', imageData),
  getPicGoConfig: () => ipcRenderer.invoke('get-picgo-config'),
  setPicGoConfig: (config) => ipcRenderer.invoke('set-picgo-config', config),
}); 