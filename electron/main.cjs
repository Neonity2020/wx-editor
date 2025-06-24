const { app, BrowserWindow, Menu, ipcMain, dialog, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');

// 检测是否为开发环境
const isDev = !app.isPackaged;

let mainWindow;

function createWindow() {
  // 根据平台选择图标文件
  let iconPath;
  if (process.platform === 'darwin') {
    iconPath = path.resolve(__dirname, '../public/icon.icns');
  } else {
    iconPath = path.resolve(__dirname, '../public/icon.png');
  }
  
  console.log('图标路径:', iconPath);
  console.log('图标文件是否存在:', fs.existsSync(iconPath));
  
  // 如果图标文件不存在，尝试其他路径
  if (!fs.existsSync(iconPath)) {
    console.log('尝试备用路径...');
    const altIconPath = path.resolve(process.cwd(), 'public/icon.png');
    console.log('备用图标路径:', altIconPath);
    console.log('备用图标文件是否存在:', fs.existsSync(altIconPath));
    iconPath = altIconPath;
  }
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    icon: iconPath,
    titleBarStyle: 'default',
    show: false
  });

  // 加载应用
  if (isDev) {
    // 尝试多个端口，因为Vite可能会使用不同的端口
    const ports = [5173, 5174, 5175, 5176];
    let connected = false;
    
    for (const port of ports) {
      try {
        mainWindow.loadURL(`http://localhost:${port}`);
        connected = true;
        console.log(`Connected to Vite dev server on port ${port}`);
        break;
      } catch (error) {
        console.log(`Failed to connect to port ${port}`);
      }
    }
    
    if (!connected) {
      console.error('Failed to connect to Vite dev server');
      mainWindow.loadURL('http://localhost:5173');
    }
    
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 创建菜单
function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '新建',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('new-document');
          }
        },
        {
          label: '打开',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [
                { name: 'Markdown文件', extensions: ['md', 'markdown'] },
                { name: '所有文件', extensions: ['*'] }
              ]
            });
            if (!result.canceled) {
              mainWindow.webContents.send('open-file', result.filePaths[0]);
            }
          }
        },
        {
          label: '保存',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('save-document');
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC 处理程序
ipcMain.handle('save-file-dialog', async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'Markdown文件', extensions: ['md'] },
      { name: 'HTML文件', extensions: ['html'] }
    ]
  });
  return result;
});

// 剪贴板操作
ipcMain.handle('read-clipboard', async () => {
  return clipboard.readText();
});

ipcMain.handle('write-clipboard', async (event, text) => {
  try {
    // 尝试写入富文本格式
    if (text.includes('<') && text.includes('>')) {
      // 如果是HTML内容，尝试写入富文本
      clipboard.write({
        text: text,
        html: text
      });
    } else {
      // 普通文本
      clipboard.writeText(text);
    }
    return true;
  } catch (error) {
    console.error('写入剪贴板失败:', error);
    // 如果富文本写入失败，回退到纯文本
    try {
      clipboard.writeText(text);
      return true;
    } catch (fallbackError) {
      console.error('纯文本写入也失败:', fallbackError);
      throw fallbackError;
    }
  }
});

// 图片上传相关
ipcMain.handle('upload-image', async (event, imageData) => {
  try {
    // 这里可以添加图片上传到PicGo的逻辑
    // 目前只是返回一个占位符
    console.log('图片上传请求:', imageData.substring(0, 100) + '...');
    return 'https://example.com/uploaded-image.jpg';
  } catch (error) {
    console.error('图片上传失败:', error);
    throw error;
  }
});

// PicGo配置相关
ipcMain.handle('get-picgo-config', async () => {
  try {
    const configPath = path.join(app.getPath('userData'), 'picgo-config.json');
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configData);
    }
    // 返回默认配置
    return {
      server: 'http://127.0.0.1:36677',
      token: ''
    };
  } catch (error) {
    console.error('获取PicGo配置失败:', error);
    return {
      server: 'http://127.0.0.1:36677',
      token: ''
    };
  }
});

ipcMain.handle('set-picgo-config', async (event, config) => {
  try {
    const configPath = path.join(app.getPath('userData'), 'picgo-config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('保存PicGo配置失败:', error);
    throw error;
  }
}); 