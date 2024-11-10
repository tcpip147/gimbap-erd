import Grid from "@/canvas/grid";

declare global {
  interface Window {
    local: any;
  }
}

export interface File {
  filepath: string;
  name: string;
}

export interface FileExplorerTree {
  file: File;
  isDirectory?: boolean;
  isOpen?: boolean;
  children?: FileExplorerTree[];
}

export interface Tab {
  file: File;
  tabEl: HTMLElement;
  toolbarEl: HTMLElement;
  canvasContainerEl: HTMLElement;
  canvasEl: HTMLCanvasElement;
  grid: Grid;
}
