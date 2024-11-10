import Grid from '@/canvas/grid';
import '@/components/tab-folder.scss';
import { createElement, hasClass, removeClass, setClass } from '@/utils/element-utils';
import { globalContext } from '@/utils/global-context';
import { File, Tab } from '@/utils/types';

let tabFolderEl: HTMLElement;
let tabFolderHeaderEl: HTMLElement;
let tabFolderContentEl: HTMLElement;

const init = () => {
  tabFolderEl = createElement({
    tag: 'div',
    class: 'tab-folder',
  });
  tabFolderHeaderEl = createElement({
    tag: 'div',
    class: 'tab-folder-header',
  });
  tabFolderContentEl = createElement({
    tag: 'div',
    class: 'tab-folder-content',
  });
  tabFolderEl.append(tabFolderHeaderEl);
  tabFolderEl.append(tabFolderContentEl);
};

const addTab = (file: File) => {
  let tab = getTab(file.filepath);
  if (tab == null) {
    const loadedTabs = globalContext.loadedTabs;
    const tabEl = createElement({
      tag: 'div',
      class: 'tab',
    });
    let html = `
      <div class='icon codicon codicon-table'></div>
      <div class='title'>${file.name}</div>
      <div class='close codicon codicon-chrome-close'></div>
    `;
    tabEl.innerHTML = html;
    tabEl.addEventListener('click', (e) => {
      if (hasClass(e.target as HTMLElement, 'close')) {
        closeTab(tab);
      } else {
        selectTab(tab);
      }
    });

    tabFolderHeaderEl.append(tabEl);

    const toolbarEl = createElement({
      tag: 'div',
      class: 'toolbar',
    });
    html = `
      <div class='message'>READY</div>
      <div class='button' data-command='add-table'>1</div>
    `;
    toolbarEl.innerHTML = html;
    toolbarEl.addEventListener('mousedown', (e) => {
      if (hasClass(e.target as HTMLDivElement, 'button')) {
        const button = e.target as HTMLDivElement;
        if (button.dataset.command == 'add-table') {
          
        }
      }
    });
    tabFolderContentEl.append(toolbarEl);

    const canvasContainerEl = createElement({
      tag: 'div',
      class: 'canvas-container',
    });

    const canvasEl = createElement({
      tag: 'canvas',
      class: 'canvas',
      attr: {
        tabIndex: '0',
      },
    }) as HTMLCanvasElement;
    canvasContainerEl.append(canvasEl);
    tabFolderContentEl.append(canvasContainerEl);

    tab = {
      file: file,
      tabEl: tabEl,
      toolbarEl: toolbarEl,
      canvasContainerEl: canvasContainerEl,
      canvasEl: canvasEl,
      grid: new Grid(toolbarEl, canvasContainerEl, canvasEl),
    };
    loadedTabs.push(tab);
  }
  selectTab(tab);
};

const closeTab = (tab: Tab) => {
  const [selectedTab, setSelectedTab] = globalContext.selectedTab;
  const loadedTabs = globalContext.loadedTabs;
  loadedTabs.forEach((t, i) => {
    if (t == tab) {
      loadedTabs.splice(i, 1);
      return true;
    }
  });
  if (selectedTab == tab) {
    selectTab(loadedTabs[loadedTabs.length - 1]);
  }
  tab.tabEl.remove();
  tab.toolbarEl.remove();
  tab.canvasContainerEl.remove();
};

const selectTab = (tab: Tab) => {
  const [selectedTab, setSelectedTab] = globalContext.selectedTab;
  if (selectedTab) {
    removeClass(selectedTab.tabEl, 'on');
    removeClass(selectedTab.toolbarEl, 'on');
    removeClass(selectedTab.canvasContainerEl, 'on');
  }
  if (tab) {
    setClass(tab.tabEl, 'on');
    setClass(tab.toolbarEl, 'on');
    setClass(tab.canvasContainerEl, 'on');
    redrawTab(tab);
  }
  setSelectedTab(tab);
};

const getTab = (filepath: string) => {
  const loadedTabs = globalContext.loadedTabs;
  const tabs = loadedTabs.filter((tab) => {
    return tab.file.filepath == filepath;
  });
  return tabs[0];
};

const redrawTab = (tab: Tab) => {
  const rect = tab.canvasContainerEl.getBoundingClientRect();
  tab.canvasEl.style.width = rect.width + 'px';
  tab.canvasEl.style.height = rect.height + 'px';
  tab.canvasEl.width = rect.width * window.devicePixelRatio;
  tab.canvasEl.height = rect.height * window.devicePixelRatio;
  const ctx = tab.canvasEl.getContext('2d')!;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
};

init();

export { tabFolderEl, addTab, redrawTab };
