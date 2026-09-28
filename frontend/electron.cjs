const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

let win;

const defaultWorkspaceDir = path.join(os.homedir(), 'SnakeStudio_Projects');
if (!fs.existsSync(defaultWorkspaceDir)) {
  fs.mkdirSync(defaultWorkspaceDir, { recursive: true });
}

function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0b0d11',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(app.getAppPath(), 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  const port = process.env.VITE_PORT || 5173;
  win.loadURL(`http://localhost:${port}`);
}

ipcMain.handle('app:getDefaultWorkspace', () => {
  return defaultWorkspaceDir;
});

ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Genomik Dosya Seç',
    properties: ['openFile'],
    filters: [
      { name: 'Genomik Dosyalar', extensions: ['bed', 'gff', 'gtf', 'vcf', 'txt'] },
      { name: 'Tüm Dosyalar', extensions: ['*'] }
    ]
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

ipcMain.handle('dialog:openDirectory', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Çalışma Alanı Klasörü Seç',
    defaultPath: defaultWorkspaceDir,
    properties: ['openDirectory', 'createDirectory']
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

// Dosya Listesini Oku (results/ altındakiler dahil)
ipcMain.handle('fs:readDir', async (_, dirPath) => {
  try {
    const list = [];
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'results') {
          try {
            const subEntries = fs.readdirSync(fullPath, { withFileTypes: true });
            for (const sub of subEntries) {
              if (!sub.isDirectory()) {
                list.push({
                  name: `results/${sub.name}`,
                  path: path.join(fullPath, sub.name),
                  isDirectory: false,
                });
              }
            }
          } catch (e) {}
        }
      } else {
        list.push({
          name: entry.name,
          path: fullPath,
          isDirectory: false,
        });
      }
    }
    return list;
  } catch (err) {
    return [];
  }
});

// Dosya Oku
ipcMain.handle('fs:readFile', async (_, filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
    return null;
  } catch (err) {
    return null;
  }
});

// Dosya Yaz
ipcMain.handle('fs:writeFile', async (_, filePath, content) => {
  try {
    const parentDir = path.dirname(filePath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (err) {
    return false;
  }
});

// Dosya Sil
ipcMain.handle('fs:deleteFile', async (_, filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
});

// Pencere Kapatma Onayı
ipcMain.handle('dialog:confirmClose', async () => {
  const choice = await dialog.showMessageBox(win, {
    type: 'question',
    buttons: ['Kaydet ve Çık', 'Kaydetmeden Çık', 'İptal'],
    defaultId: 0,
    cancelId: 2,
    title: 'SnakeStudio',
    message: 'Kaydedilmemiş değişiklikleriniz var!',
    detail: 'Yaptığınız analiz ve sheet düzenlemelerini kaydetmek istiyor musunuz?'
  });
  return choice.response;
});

ipcMain.on('window:minimize', () => win?.minimize());
ipcMain.on('window:maximize', () => {
  if (win?.isMaximized()) {
    win.unmaximize();
  } else {
    win?.maximize();
  }
});
ipcMain.on('window:close', () => win?.close());

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});