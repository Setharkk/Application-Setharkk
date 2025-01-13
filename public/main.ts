import { app, BrowserWindow, ipcMain } from 'electron';
import Store from 'electron-store';
import path from 'path';
import seoAnalyzer from './services/seoAnalyzer';
import crypto from 'crypto';

// Types
interface AnalysisHistoryItem {
  url: string;
  results: any; // Type from seoAnalyzer
  timestamp: number;
}

interface StoreSchema {
  analysisHistory: AnalysisHistoryItem[];
}

const isDev = process.env.NODE_ENV === 'development';

// Génération sécurisée de la clé de chiffrement
const encryptionKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

// Configuration du stockage avec une clé sécurisée
Store.initRenderer();
const store = new Store<StoreSchema>({
  encryptionKey,
  clearInvalidConfig: true,
  schema: {
    analysisHistory: {
      type: 'array',
      default: []
    }
  }
});

// Validation d'URL sécurisée
const isValidUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch (e) {
    return false;
  }
};

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:8080');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  // Sécurité supplémentaire
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) {
      return { action: 'allow' };
    }
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();

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

// IPC handlers sécurisés
ipcMain.handle('getData', (event, key: keyof StoreSchema) => {
  try {
    return store.get(key);
  } catch (error) {
    console.error('Error getting data:', error);
    return null;
  }
});

ipcMain.handle('setData', (event, key: keyof StoreSchema, value: any) => {
  try {
    store.set(key, value);
    return true;
  } catch (error) {
    console.error('Error setting data:', error);
    return false;
  }
});

ipcMain.handle('deleteData', (event, key: keyof StoreSchema) => {
  try {
    store.delete(key);
    return true;
  } catch (error) {
    console.error('Error deleting data:', error);
    return false;
  }
});

// Gestionnaire d'analyse SEO sécurisé
ipcMain.handle('analyzeSeo', async (event, url: string) => {
  try {
    if (!isValidUrl(url)) {
      throw new Error('URL invalide ou non sécurisée');
    }
    const results = await seoAnalyzer.analyzePage(url);
    const analysisHistory = store.get('analysisHistory', []);
    store.set('analysisHistory', [
      {
        url,
        results,
        timestamp: Date.now()
      },
      ...analysisHistory.slice(0, 49) // Garde les 50 dernières analyses
    ]);
    return results;
  } catch (error) {
    console.error('Error analyzing SEO:', error);
    throw error;
  }
}); 