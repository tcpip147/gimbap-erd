import { createElement } from '@/utils/element-utils';
import '@/explorers/search-explorer.scss';

let searchExplorerEl: HTMLElement;

const init = () => {
  searchExplorerEl = createElement({
    tag: 'div',
    class: 'search-explorer',
  });
  const html = `
    search
  `;
  searchExplorerEl.innerHTML = html;
};

init();

export { searchExplorerEl };
