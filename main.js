const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('./crypto');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 700,
    height: 620,             
    minWidth: 700,
    minHeight: 620,
    maxWidth: 700,
    maxHeight: 620,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    backgroundColor: '#111418',
    useContentSize: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

ipcMain.handle('pick-file', async (_, filters) => {
  const res = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: filters || [{ name: 'Все файлы', extensions: ['*'] }],
  });
  return res.canceled ? null : res.filePaths[0];
});

ipcMain.handle('pick-save', async (_, defaultName) => {
  const res = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName || 'output',
  });
  return res.canceled ? null : res.filePath;
});

ipcMain.handle('encrypt-file', async (_, { inputPath, outputPath, password }) => {
  try {
    if (!fs.existsSync(inputPath)) throw new Error('Исходный файл не найден');
    if (path.resolve(inputPath) === path.resolve(outputPath))
      throw new Error('Нельзя перезаписывать исходный файл');

    const data = fs.readFileSync(inputPath);
    const encrypted = crypto.encryptBuffer(data, password);
    fs.writeFileSync(outputPath, encrypted);
    return { ok: true, size: encrypted.length };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

ipcMain.handle('decrypt-file', async (_, { inputPath, outputPath, password }) => {
  try {
    if (!fs.existsSync(inputPath)) throw new Error('Зашифрованный файл не найден');
    if (path.resolve(inputPath) === path.resolve(outputPath))
      throw new Error('Нельзя перезаписывать исходный файл');

    const data = fs.readFileSync(inputPath);
    const decrypted = crypto.decryptBuffer(data, password);
    fs.writeFileSync(outputPath, decrypted);
    return { ok: true, size: decrypted.length };
  } catch (e) {
    return { ok: false, error: e.message.includes('bad decrypt')
      ? 'Неверный пароль или повреждённые данные'
      : e.message };
  }
});

ipcMain.handle('encrypt-text', (_, { text, password }) => {
  try { return { ok: true, result: crypto.encryptText(text, password) }; }
  catch (e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('decrypt-text', (_, { text, password }) => {
  try { return { ok: true, result: crypto.decryptText(text, password) }; }
  catch (e) { return { ok: false, error: e.message.includes('bad decrypt')
      ? 'Неверный пароль или повреждённые данные'
      : e.message }; }
});