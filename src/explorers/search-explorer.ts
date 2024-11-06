import '@/explorers/search-explorer.scss';
import { createElement } from '@/utils/element-utils';

let searchExplorerEl: HTMLElement;

const init = () => {
  searchExplorerEl = createElement({
    tag: 'div',
    class: 'search-explorer',
  });
  const html = `
  `;
  searchExplorerEl.innerHTML = html;
};

init();

export { searchExplorerEl };
