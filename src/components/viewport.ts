import { explorerEl, explorerResizerEl } from '@/components/explorer';
import { sidebarEl } from '@/components/sidebar';
import { tabFolderEl } from '@/components/tab-folder';
import '@/components/viewport.scss';
import { createElement } from '@/utils/element-utils';

let viewportEl: HTMLElement;

const init = () => {
  viewportEl = createElement({
    tag: 'div',
    class: 'viewport',
  });
  
  viewportEl.append(sidebarEl);
  viewportEl.append(explorerEl);
  viewportEl.append(tabFolderEl);
  viewportEl.append(explorerResizerEl);
};

init();

export { viewportEl };
