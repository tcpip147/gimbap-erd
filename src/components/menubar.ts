import '@/components/menubar.scss';
import { closest, createElement, removeClass, setClass } from '@/utils/element-utils';

let menubarEl: HTMLElement;
let menuEl: HTMLElement;
let menuItemEls: HTMLElement[] = [];
let isFocused = false;
let selectedMenuItems: HTMLElement[] = [];

const init = () => {
  menubarEl = createElement({
    tag: 'div',
    class: 'menubar',
  });

  menuEl = createElement({
    tag: 'div',
    class: 'menu',
    attr: {
      tabIndex: '0',
    },
  });
  const html = `
    <div class='menu-item'>
      <div class='title'>${window.local.MENUBAR_FILE}</div>
      <div class='menu-item'><div class='title'>${window.local.MENUBAR_FILE_HISTORY}</div></div>
    </div>
    <div class='menu-item'>
      <div class='title'>${window.local.MENUBAR_DATABASE}</div>
      <div class='menu-item'><div class='title'>${window.local.MENUBAR_DATABASE_GEN_SQL}</div></div>
      <div class='menu-item'><div class='title'>${window.local.MENUBAR_DATABASE_STANDARD_WORD}</div></div>
    </div>
    <div class='menu-item'>
      <div class='title'>${window.local.MENUBAR_HELP}</div>
      <div class='menu-item'><div class='title'>${window.local.MENUBAR_HELP_WELCOME}</div></div>
    </div>
  `;
  menuEl.innerHTML = html;
  menuEl.addEventListener('focus', (e) => {
    isFocused = true;
    revalidate();
  });
  menuEl.addEventListener('blur', (e) => {
    isFocused = false;
    selectedMenuItems = [];
    revalidate();
  });
  menubarEl.append(menuEl);

  menuEl.querySelectorAll('.menu-item').forEach((menuItem: Element) => {
    const children = menuItem.querySelectorAll<HTMLElement>(':scope > .menu-item');
    if (children.length > 0) {
      const childrenEl = createElement({
        tag: 'div',
        class: 'children',
      });
      children.forEach((child) => {
        childrenEl.insertBefore(child, null);
      });
      menuItem.append(childrenEl);
      if (getLevel(menuItem as HTMLElement) > 0) {
        const codicon = createElement({
          tag: 'div',
          class: 'codicon codicon-chevron-right',
        });
        menuItem.querySelector('.title')!.append(codicon);
      }
    }
    menuItemEls.push(menuItem as HTMLElement);
    menuItem.addEventListener('mouseenter', handleOnMouseEnterMenuItem);
  });
};

const revalidate = () => {
  menuItemEls.forEach((m) => {
    const level = getLevel(m);
    if (isFocused && m == selectedMenuItems[level]) {
      setClass(m, 'on');
      const children = m.querySelectorAll<HTMLElement>(':scope > .children');
      if (children) {
        const rect = m.getBoundingClientRect();
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (level == 0) {
            child.style.left = '0px';
          } else {
            child.style.top = '-3px';
            child.style.left = 3 + rect.width + 'px';
          }
        }
      }
    } else {
      removeClass(m, 'on');
    }
  });
};

const handleOnMouseEnterMenuItem = (e: Event) => {
  const menuItem = closest(e.target as HTMLElement, 'menu-item');
  if (menuItem) {
    const level = getLevel(menuItem);
    selectedMenuItems[level] = menuItem;
    selectedMenuItems = selectedMenuItems.filter((m, i) => i <= level);
    revalidate();
  }
};

const getLevel = (menuItem: HTMLElement): number => {
  if (menuItem.dataset.level) {
    return Number(menuItem.dataset.level);
  }
  let parent = closest(menuItem.parentElement as HTMLElement, 'menu-item');
  let level = 0;
  while (parent != null) {
    level++;
    parent = closest(parent.parentElement as HTMLElement, 'menu-item');
  }
  menuItem.dataset.level = level.toString();
  return level;
};

init();

export { menubarEl };
