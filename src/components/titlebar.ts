import { createElement } from '@/utils/element-utils';
import '@/components/titlebar.scss';

let titlebarEl: HTMLElement;

const init = () => {
  titlebarEl = createElement({
    tag: 'div',
    class: 'titlebar',
  });
  const html = `
    <div class='title'>Gimbap ERD</div>
  `;
  titlebarEl.innerHTML = html;
};

init();

export { titlebarEl };
