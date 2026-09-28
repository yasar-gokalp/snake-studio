export interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
}

export interface IElectronAPI {
  getDefaultWorkspace: () => Promise<string>;
  selectFile: () => Promise<string | null>;
  selectDirectory: () => Promise<string | null>;
  readDir: (path: string) => Promise<FileItem[]>;
  readFile: (path: string) => Promise<string | null>;
  writeFile: (path: string, content: string) => Promise<boolean>;
  deleteFile: (path: string) => Promise<boolean>;
  confirmClose: () => Promise<number>;
  minimize: () => void;
  maximize: () => void;
  close: () => void;
}

declare global {
  interface Window {
    electronAPI?: IElectronAPI;
  }
}