import { Tab } from '@/utils/types';

interface GlobalContextType {
  explorerWidth: [number, Function];
  isVisibleExplorer: [boolean, Function];
  isVisibleResizer: [boolean, Function];
  selectedExplorer: [string, Function];
  loadedTabs: Tab[];
  selectedTab: [Tab | null, Function];
}

const globalContext = {
  explorerWidth: [250, setExplorerWidth],
  isVisibleExplorer: [true, setIsVisibleExplorer],
  isVisibleResizer: [false, setIsVisibleResizer],
  selectedExplorer: ['file-explorer', setSelectedExplorer],
  loadedTabs: [],
  selectedTab: [null, setSelectedTab],
} as GlobalContextType;

function setExplorerWidth(width: number): void {
  globalContext.explorerWidth[0] = width;
}

function setIsVisibleExplorer(b: boolean): void {
  globalContext.isVisibleExplorer[0] = b;
}

function setIsVisibleResizer(b: boolean): void {
  globalContext.isVisibleResizer[0] = b;
}

function setSelectedExplorer(explorer: string): void {
  globalContext.selectedExplorer[0] = explorer;
}

function setSelectedTab(tab: Tab): void {
  globalContext.selectedTab[0] = tab;
}

export { globalContext };
