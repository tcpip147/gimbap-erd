export const createElement = (options: {
  tag: string;
  class?: string | string[];
  attr?: { [key: string]: string };
  css?: Partial<CSSStyleDeclaration>;
  dataset?: { [key: string]: string };
}): HTMLElement => {
  const el = document.createElement(options.tag);
  if (options.class) {
    if (typeof options.class == 'string') {
      el.className = options.class;
    } else {
      options.class.forEach((c) => {
        el.classList.add(c);
      });
    }
  }
  if (options.attr) {
    for (let key in options.attr) {
      el.setAttribute(key, options.attr[key]);
    }
  }
  if (options.css) {
    for (let key in options.css) {
      el.style[key] = options.css[key]!;
    }
  }
  if (options.dataset) {
    for (let key in options.dataset) {
      el.dataset[key] = options.dataset[key]!;
    }
  }
  return el;
};

export const removeElement = (el: HTMLElement) => {
  el.remove();
};

export const closest = (el: HTMLElement, className: string) => {
  let tmp: HTMLElement | null = el;
  while (tmp != null) {
    if (tmp.classList.contains(className)) {
      return tmp;
    }
    tmp = tmp.parentElement;
  }
  return tmp;
};

export const hasClass = (el: HTMLElement, className: string) => {
  return el.classList.contains(className);
};

export const setClass = (el: HTMLElement, className: string) => {
  if (!el.classList.contains(className)) {
    el.classList.add(className);
  }
};

export const removeClass = (el: HTMLElement | NodeListOf<HTMLElement>, className: string) => {
  if (el instanceof HTMLElement) {
    if (el.classList.contains(className)) {
      el.classList.remove(className);
    }
  } else {
    el.forEach((ele) => {
      if (ele.classList.contains(className)) {
        ele.classList.remove(className);
      }
    });
  }
};

export const removeClassRecursivly = (root: HTMLElement, className: string) => {
  if (root.classList.contains(className)) {
    root.classList.remove(className);
  }
  const targets = root.querySelectorAll('.' + className);
  targets.forEach((target) => {
    if (target.classList.contains(className)) {
      target.classList.remove(className);
    }
  });
};

export const threshold = (lock: boolean[], callback: Function) => {
  if (!lock[0]) {
    lock[0] = true;
    requestAnimationFrame(() => {
      callback();
      lock[0] = false;
    });
  }
};
