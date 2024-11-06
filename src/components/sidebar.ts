import { explorerEl, explorerResizerEl, redrawExplorer } from '@/components/explorer';
import '@/components/sidebar.scss';
import { globalContext } from '@/utils/global-context';
import { closest, createElement, removeClassRecursivly, setClass } from '@/utils/element-utils';

let sidebarEl: HTMLElement;

const init = () => {
  sidebarEl = createElement({
    tag: 'div',
    class: 'sidebar',
  });
  const html = `
    <div class='icon-button' title="${window.local.SIDEBAR_FILE_EXPLORER}" data-explorer="file-explorer">
      <div class='codicon codicon-files'></div>
    </div>
    <div class='icon-button' title="${window.local.SIDEBAR_FILE_SEARCH}" data-explorer="search-explorer">
      <div class='codicon codicon-search'></div>
    </div>
  `;
  sidebarEl.innerHTML = html;
  sidebarEl.addEventListener('click', (e) => {
    const button = closest(e.target as HTMLElement, 'icon-button');
    if (button) {
      const [selectedExplorer, setSelectedExplorer] = globalContext.selectedExplorer;
      const [isVisibleExplorer, setIsVisibleExplorer] = globalContext.isVisibleExplorer;
      if (selectedExplorer == button.dataset.explorer) {
        setIsVisibleExplorer(false);
        setSelectedExplorer('');
      } else {
        setIsVisibleExplorer(true);
        setSelectedExplorer(button.dataset.explorer);
      }
      redrawSidebar();
    }
  });

  redrawSidebar();
};

const redrawSidebar = () => {
  const [selectedExplorer, setSelectedExplorer] = globalContext.selectedExplorer;
  const [isVisibleExplorer, setIsVisibleExplorer] = globalContext.isVisibleExplorer;

  removeClassRecursivly(sidebarEl, 'on');
  removeClassRecursivly(explorerEl, 'on');
  if (selectedExplorer != '') {
    setClass(sidebarEl.querySelector(`div[data-explorer='${selectedExplorer}']`) as HTMLElement, 'on');
    setClass(explorerEl.querySelector('.' + selectedExplorer) as HTMLElement, 'on');
  }

  if (isVisibleExplorer) {
    explorerEl.style.display = 'block';
    explorerResizerEl.style.display = 'block';
  } else {
    explorerEl.style.display = 'none';
    explorerResizerEl.style.display = 'none';
  }

  redrawExplorer();
};

init();

export { sidebarEl };
