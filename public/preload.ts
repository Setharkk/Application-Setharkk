import { contextBridge, ipcRenderer } from 'electron';

// Types pour l'API exposée
interface ElectronAPI {
  getData: (key: string) => Promise<any>;
  setData: (key: string, value: any) => Promise<boolean>;
  deleteData: (key: string) => Promise<boolean>;
  analyzeSeo: (url: string) => Promise<any>;
}

// Déclaration globale pour TypeScript
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// Exposition de l'API sécurisée
contextBridge.exposeInMainWorld('electronAPI', {
  getData: (key: string) => ipcRenderer.invoke('getData', key),
  setData: (key: string, value: any) => ipcRenderer.invoke('setData', key, value),
  deleteData: (key: string) => ipcRenderer.invoke('deleteData', key),
  analyzeSeo: (url: string) => ipcRenderer.invoke('analyzeSeo', url)
}); 