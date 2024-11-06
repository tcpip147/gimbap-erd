import '@/components/explorer.scss';
import { redrawTab, tabFolderEl } from '@/components/tab-folder';
import { globalContext } from '@/utils/global-context';
import { fileExplorerEl } from '@/explorers/file-explorer';
import { searchExplorerEl } from '@/explorers/search-explorer';
import { createElement, removeClass, setClass } from '@/utils/element-utils';

let explorerEl: HTMLElement;
let explorerResizerEl: HTMLElement;
let raf = false;

const init = () => {
  explorerEl = createElement({
    tag: 'div',
    class: 'explorer',
  });

  explorerEl.append(fileExplorerEl);
  explorerEl.append(searchExplorerEl);

  initResizer();
};

const initResizer = () => {
  explorerResizerEl = createElement({
    tag: 'div',
    class: 'explorer-resizer',
  });

  redrawExplorer();

  let anchorX: number;
  let anchorWidth: number;
  let isResizingExplorer: boolean;
  window.addEventListener('mousedown', (e) => {
    const [isVisibleExplorer, setIsVisibleExplorer] = globalContext.isVisibleExplorer;
    const [explorerWidth, setExplorerWidth] = globalContext.explorerWidth;
    if (isVisibleExplorer && e.target == explorerResizerEl) {
      isResizingExplorer = true;
      anchorX = e.clientX;
      anchorWidth = explorerWidth;
    }
  });
  window.addEventListener('mousemove', (e) => {
    if (isResizingExplorer) {
      const [explorerWidth, setExplorerWidth] = globalContext.explorerWidth;
      document.body.style.cursor = 'w-resize';
      let width = anchorWidth + e.clientX - anchorX;
      if (width < 100) {
        width = 100;
      } else if (width > 1000) {
        width = 1000;
      }
      setExplorerWidth(width);
      redrawExplorer();
    }
  });
  window.addEventListener('mouseup', (e) => {
    if (isResizingExplorer) {
      if (e.target != explorerResizerEl) {
        document.body.style.cursor = 'default';
        removeClass(explorerResizerEl, 'on');
      }
      isResizingExplorer = false;
      anchorX = 0;
      anchorWidth = 0;
      redrawExplorer();
    }
  });
  window.addEventListener('resize', () => {
    redrawExplorer();
  });
  explorerResizerEl.addEventListener('mouseenter', (e) => {
    const [isVisibleExplorer, setIsVisibleExplorer] = globalContext.isVisibleExplorer;
    if (isVisibleExplorer) {
      setClass(explorerResizerEl, 'on');
      document.body.style.cursor = 'w-resize';
    }
  });
  explorerResizerEl.addEventListener('mouseleave', (e) => {
    if (!isResizingExplorer) {
      document.body.style.cursor = 'default';
      removeClass(explorerResizerEl, 'on');
    }
  });
};

const redrawExplorer = () => {
  if (!raf) {
    raf = true;
    window.requestAnimationFrame(() => {
      const [explorerWidth] = globalContext.explorerWidth;
      const [isVisibleExplorer] = globalContext.isVisibleExplorer;
      const [selectedTab] = globalContext.selectedTab;
      explorerEl.style.width = explorerWidth + 'px';
      explorerEl.style.display = isVisibleExplorer ? 'display' : 'none';
      tabFolderEl.style.width = window.innerWidth - 40 - (isVisibleExplorer ? explorerWidth : 0) + 'px';
      explorerResizerEl.style.left = 38 + explorerWidth + 'px';
      if (selectedTab) {
        redrawTab(selectedTab);
      }
      raf = false;
    });
  }
};

init();

export { explorerEl, explorerResizerEl, redrawExplorer };
