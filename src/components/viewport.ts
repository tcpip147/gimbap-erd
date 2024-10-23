import Grid from '@/canvas/grid';
import '@/components/viewport.scss';
import { fileExplorerEl, FileType } from '@/explorers/file-explorer';
import { searchExplorerEl } from '@/explorers/search-explorer';
import { closest, createElement, hasClass, removeClass, removeElement, setClass } from '@/utils/element-utils';

export interface TabInfo {
  tab: HTMLElement;
  toolbar: HTMLElement;
  canvasContainer: HTMLElement;
  grid: Grid;
  file: FileType;
}

let viewportEl: HTMLElement;
let sidebarEl: HTMLElement;
let explorerEl: HTMLElement;
let resizerEl: HTMLElement;
let tabFolderEl: HTMLElement;
let tabFolderHeaderEl: HTMLElement;
let tabFolderContentEl: HTMLElement;
let explorerWidth = 250;
let isVisibleExplorer = false;
let isResizingExplorer = false;
let isVisibleResizer = false;
let selectedTabInfo: TabInfo;
const loadedTabInfo: { [key: string]: TabInfo } = {};

const init = () => {
  viewportEl = createElement({
    tag: 'div',
    class: 'viewport',
  });
  const html = `
  `;
  viewportEl.innerHTML = html;
  document.body.append(viewportEl);

  initSidebar();
  initExplorer();
  initTabFolder();
  initResizer();

  let isMousedown = false;
  let mouseInfo = {
    originX: 0,
    originY: 0,
    x: 0,
    y: 0,
  };
  window.addEventListener('mousedown', (e) => {
    if (hasClass(e.target as HTMLElement, 'canvas')) {
      isMousedown = true;
      mouseInfo.originX = selectedTabInfo.grid.origin[0];
      mouseInfo.originY = selectedTabInfo.grid.origin[1];
      mouseInfo.x = e.clientX;
      mouseInfo.y = e.clientY;
      selectedTabInfo.canvasContainer.style.cursor = 'grab';
    }
  });
  window.addEventListener('mousemove', (e) => {
    if (isMousedown) {
      const diffX = mouseInfo.x - e.clientX;
      const diffY = mouseInfo.y - e.clientY;
      let originX = mouseInfo.originX + diffX;
      if (originX < 0) {
        originX = 0;
      }
      let originY = mouseInfo.originY + diffY;
      if (originY < 0) {
        originY = 0;
      }
      selectedTabInfo.grid.origin = [originX, originY];
      selectedTabInfo.grid.redraw();
    }
  });
  window.addEventListener('mouseup', (e) => {
    isMousedown = false;
    mouseInfo.originX = 0;
    mouseInfo.originY = 0;
    mouseInfo.x = 0;
    mouseInfo.y = 0;
    selectedTabInfo.canvasContainer.style.cursor = 'default';
  });
  window.addEventListener(
    'wheel',
    (e) => {
      if (e.ctrlKey) {
        if (e.deltaY > 0) {
          selectedTabInfo.grid.origin = [selectedTabInfo.grid.origin[0] + 100, selectedTabInfo.grid.origin[1]];
        } else {
          let originX = selectedTabInfo.grid.origin[0] - 100;
          if (originX < 0) {
            originX = 0;
          }
          selectedTabInfo.grid.origin = [originX, selectedTabInfo.grid.origin[1]];
        }
      } else {
        if (e.deltaY > 0) {
          selectedTabInfo.grid.origin = [selectedTabInfo.grid.origin[0], selectedTabInfo.grid.origin[1] + 100];
        } else {
          let originY = selectedTabInfo.grid.origin[1] - 100;
          if (originY < 0) {
            originY = 0;
          }
          selectedTabInfo.grid.origin = [selectedTabInfo.grid.origin[0], originY];
        }
      }
      selectedTabInfo.grid.redraw();
      e.preventDefault();
    },
    { passive: false },
  );
};

const initSidebar = () => {
  let prev: HTMLElement | null;

  sidebarEl = createElement({
    tag: 'div',
    class: 'sidebar',
  });

  const activate = (button: HTMLElement) => {
    setClass(button, 'on');
    const explorer = explorerEl.querySelector('.' + button.dataset.explorer) as HTMLElement;
    setClass(explorer, 'on');
    prev = button;
    isVisibleExplorer = true;
  };

  const deactivatePrev = () => {
    if (prev) {
      removeClass(prev, 'on');
      const prevExplorer = explorerEl.querySelector(':scope > .on') as HTMLElement;
      if (prevExplorer) {
        removeClass(prevExplorer, 'on');
      }
      prev = null;
      isVisibleExplorer = false;
    }
  };

  sidebarEl.addEventListener('click', (e) => {
    const button = closest(e.target as HTMLElement, 'icon-button');
    if (button) {
      if (prev != button) {
        deactivatePrev();
        activate(button);
      } else {
        if (isVisibleExplorer) {
          deactivatePrev();
        } else {
          activate(button);
        }
      }
      revalidateExplorer();
    }
  });

  const html = `
    <div class='icon-button' title="파일탐색" data-explorer="file-explorer">
      <div class='codicon codicon-files'></div>
    </div>
    <div class='icon-button' title="파일찾기" data-explorer="search-explorer">
      <div class='codicon codicon-search'></div>
    </div>
  `;
  sidebarEl.innerHTML = html;
  viewportEl.append(sidebarEl);

  setTimeout(() => {
    activate(sidebarEl.querySelector('.icon-button') as HTMLElement);
    revalidateExplorer();
  }, 1);
};

const initTabFolder = () => {
  tabFolderEl = createElement({
    tag: 'div',
    class: 'tab-folder',
  });
  tabFolderHeaderEl = createElement({
    tag: 'div',
    class: 'tab-folder-header',
  });
  tabFolderHeaderEl.addEventListener('click', (e) => {
    const close = closest(e.target as HTMLElement, 'close');
    if (close) {
      const tab = closest(close, 'tab');
      if (tab) {
        closeTab(tab.dataset.path!);
      }
      return;
    }
    const tab = closest(e.target as HTMLElement, 'tab');
    if (tab) {
      selectTab(tab.dataset.path!);
    }
  });
  tabFolderContentEl = createElement({
    tag: 'div',
    class: 'tab-folder-content',
  });
  tabFolderEl.append(tabFolderHeaderEl);
  tabFolderEl.append(tabFolderContentEl);
  viewportEl.append(tabFolderEl);
};

const initExplorer = () => {
  explorerEl = createElement({
    tag: 'div',
    class: 'explorer',
  });
  explorerEl.append(fileExplorerEl);
  explorerEl.append(searchExplorerEl);
  viewportEl.append(explorerEl);
};

const initResizer = () => {
  resizerEl = createElement({
    tag: 'div',
    class: 'resizer',
  });
  let anchorX: number;
  let anchorWidth: number;
  window.addEventListener('mousedown', (e) => {
    if (isVisibleExplorer && e.target == resizerEl) {
      isResizingExplorer = true;
      anchorX = e.clientX;
      anchorWidth = explorerWidth;
    }
  });
  window.addEventListener('mousemove', (e) => {
    if (isVisibleExplorer && isResizingExplorer) {
      document.body.style.cursor = 'w-resize';
      explorerWidth = anchorWidth + e.clientX - anchorX;
      if (explorerWidth < 100) {
        explorerWidth = 100;
      } else if (explorerWidth > 1000) {
        explorerWidth = 1000;
      }
      revalidateExplorer();
    }
  });
  window.addEventListener('mouseup', (e) => {
    if (isResizingExplorer) {
      isResizingExplorer = false;
      anchorX = 0;
      anchorWidth = 0;
      revalidateExplorer();
    }
  });
  resizerEl.addEventListener('mouseenter', (e) => {
    if (isVisibleExplorer) {
      document.body.style.cursor = 'w-resize';
      isVisibleResizer = true;
      revalidateResizer();
    }
  });
  resizerEl.addEventListener('mouseleave', (e) => {
    document.body.style.cursor = 'default';
    isVisibleResizer = false;
    revalidateResizer();
  });
  window.addEventListener('resize', () => {
    revalidateExplorer();
  });

  revalidateExplorer();

  viewportEl.append(resizerEl);
};

const revalidateResizer = () => {
  if (isVisibleResizer || isResizingExplorer) {
    setClass(resizerEl, 'on');
  } else {
    removeClass(resizerEl, 'on');
  }
};

const revalidateExplorer = () => {
  resizerEl.style.left = explorerWidth + 38 + 'px';
  explorerEl.style.width = explorerWidth + 'px';
  tabFolderEl.style.width = window.innerWidth - 40 - (isVisibleExplorer ? explorerWidth : 0) + 'px';
  revalidateResizer();
  if (isVisibleExplorer) {
    explorerEl.style.display = 'block';
  } else {
    explorerEl.style.display = 'none';
  }
  resizeCanvas();
};

const resizeCanvas = () => {
  if (selectedTabInfo) {
    selectedTabInfo.grid.fitToSize();
    redrawCanvas();
  }
};

const redrawCanvas = () => {
  if (selectedTabInfo) {
    selectedTabInfo.grid.redraw();
  }
};

const addTab = (file: FileType) => {
  if (loadedTabInfo[file.path] == null) {
    const tabEl = createElement({
      tag: 'div',
      class: 'tab',
    });
    tabEl.dataset.path = file.path;
    let html = `
      <div class='icon codicon codicon-table'></div>
      <div class='title'>${file.name}</div>
      <div class='close codicon codicon-chrome-close'></div>
    `;
    tabEl.innerHTML = html;
    tabFolderHeaderEl.append(tabEl);

    const toolbarEl = createElement({
      tag: 'div',
      class: 'toolbar',
    });
    toolbarEl.dataset.path = file.path;
    toolbarEl.addEventListener('click', (e) => {
      if (hasClass(e.target as HTMLElement, 'btn-add-table')) {
        selectedTabInfo.grid.addTable();
        redrawCanvas();
      }
    });
    html = `
      <div class='message'>READY</div>
      <div class='button btn-add-table'>1</div>
      <div class='button'>2</div>
    `;
    toolbarEl.innerHTML = html;
    tabFolderContentEl.append(toolbarEl);

    const canvasContainerEl = createElement({
      tag: 'div',
      class: 'canvas-container',
    });
    canvasContainerEl.dataset.path = file.path;
    tabFolderContentEl.append(canvasContainerEl);

    const canvasEl = createElement({
      tag: 'canvas',
      class: 'canvas',
    }) as HTMLCanvasElement;

    canvasContainerEl.append(canvasEl);

    loadedTabInfo[file.path] = {
      tab: tabEl,
      toolbar: toolbarEl,
      canvasContainer: canvasContainerEl,
      grid: new Grid(canvasContainerEl, file),
      file: file,
    };
  }
  selectTab(file.path);
};

const selectTab = (path: string) => {
  let prev = tabFolderHeaderEl.querySelector(`.tab.on`);
  if (prev) {
    removeClass(prev as HTMLElement, 'on');
  }
  const tab = tabFolderHeaderEl.querySelector(`.tab[data-path='${path}']`);
  setClass(tab as HTMLElement, 'on');

  prev = tabFolderContentEl.querySelector(`.toolbar.on`);
  if (prev) {
    removeClass(prev as HTMLElement, 'on');
  }
  const toolbar = tabFolderContentEl.querySelector(`.toolbar[data-path='${path}']`);
  setClass(toolbar as HTMLElement, 'on');

  prev = tabFolderContentEl.querySelector(`.canvas-container.on`);
  if (prev) {
    removeClass(prev as HTMLElement, 'on');
  }
  const canvasContainer = tabFolderContentEl.querySelector(`.canvas-container[data-path='${path}']`);
  setClass(canvasContainer as HTMLElement, 'on');
  selectedTabInfo = loadedTabInfo[path];
  resizeCanvas();
};

const closeTab = (path: string) => {
  const info = loadedTabInfo[path];
  const isSelected = hasClass(info.tab, 'on');
  delete loadedTabInfo[path];
  removeElement(info.tab);
  removeElement(info.toolbar);
  removeElement(info.canvasContainer);
  if (isSelected) {
    const latestTab = tabFolderHeaderEl.querySelector('.tab:last-child') as HTMLElement;
    if (latestTab) {
      selectTab(latestTab.dataset.path!);
    }
  }
};

init();

export { addTab, viewportEl };

