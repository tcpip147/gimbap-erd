import { closest, createElement, hasClass, removeClass, setClass } from '@/utils/element-utils';
import '@/explorers/file-explorer.scss';
import { addTab } from '@/components/viewport';

export interface FileType {
  isDirectory?: boolean;
  children?: FileType[];
  isOpen?: boolean;
  path: string;
  name: string;
  data?: any;
}

let fileExplorerEl: HTMLElement;
let files: FileType[];
let fileMap: { [key: string]: FileType } = {};
let prev: HTMLElement | null;

const init = () => {
  fileExplorerEl = createElement({
    tag: 'div',
    class: 'file-explorer',
  });

  fileExplorerEl.addEventListener('click', (e) => {
    const file = closest(e.target as HTMLElement, 'ref');
    if (file) {
      if (prev != file) {
        if (prev) {
          removeClass(prev, 'on');
        }
        setClass(file as HTMLElement, 'on');
        prev = file;
      }

      if (hasClass(file, 'directory')) {
        if (hasClass(file, 'open')) {
          removeClass(file, 'open');
        } else {
          setClass(file, 'open');
        }
      }
    }
  });

  fileExplorerEl.addEventListener('dblclick', (e) => {
    const file = closest(e.target as HTMLElement, 'file');
    if (file) {
      addTab(fileMap[file.dataset.path!]);
    }
  });

  load();
};

const load = () => {
  setTimeout(() => {
    files = [
      {
        isDirectory: true,
        isOpen: true,
        path: '/',
        name: 'ERD Files',
        children: [
          {
            path: '/ERD Files/Sample.erd.json',
            name: 'Sample.erd.json',
          },
          {
            path: '/ERD Files/Sample2.erd.json',
            name: 'Sample2.erd.json',
          },
        ],
      },
      {
        path: '/Sample.erd.json',
        name: 'Sample.erd.json',
      },
    ];
    const html = renderFiles(files, 0);
    fileExplorerEl.innerHTML = html;

    addTab(fileMap['/Sample.erd.json']);
  }, 1);
};

const renderFiles = (files: FileType[], indent: number) => {
  let html = '';
  files.forEach((file) => {
    if (file.isDirectory) {
      html += `
        <div class='ref directory ${file.isOpen ? 'open' : ''}' data-path='${file.path}'>
          <div class='title' style='padding-left: ${indent}px'>
            <div class='codicon'></div>
            <span>${file.name}</span>
          </div>
          ${file.children ? renderFiles(file.children, indent + 10) : ''}
        </div>
      `;
    } else {
      fileMap[file.path] = file;
      html += `
        <div class='ref file' data-path='${file.path}'>
          <div class='title' style='padding-left: ${indent}px'>
            <div class='codicon codicon-table'></div>
            <span>${file.name}</span>
          </div>
        </div>
      `;
    }
  });
  return html;
};

init();

export { fileExplorerEl };
