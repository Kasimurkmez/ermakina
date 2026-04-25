
const { app, BrowserWindow } = require('electron');
const path = require('path');

// Geliştirme ortamı mı yoksa Üretim (EXE) ortamı mı kontrolü
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  // Tarayıcı penceresini oluştur
  const win = new BrowserWindow({
    width: 1366,
    height: 768,
    title: "Er Makina Fikstür Takip Sistemi",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // Yerel dosya erişimi için (Dikkatli kullanılmalı)
    },
    autoHideMenuBar: true, // Üstteki File/Edit menüsünü gizle
    icon: path.join(__dirname, '../public/icon.png') // Eğer ikon varsa
  });

  // Uygulamayı yükle
  if (isDev) {
    // Geliştirme modunda Vite sunucusuna bağlan
    win.loadURL('http://localhost:5173');
    // Geliştirici araçlarını aç
    win.webContents.openDevTools();
  } else {
    // EXE modunda derlenmiş HTML dosyasını yükle
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// Electron hazır olduğunda pencereyi aç
app.whenReady().then(createWindow);

// Tüm pencereler kapandığında uygulamadan çık (Mac hariç)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
