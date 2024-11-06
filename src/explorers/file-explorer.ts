import { addTab } from '@/components/tab-folder';
import '@/explorers/file-explorer.scss';
import { closest, createElement, hasClass, removeClass, removeClassRecursivly, setClass } from '@/utils/element-utils';
import { FileExplorerTree } from '@/utils/types';

let fileExplorerEl: HTMLElement;
let fileTree: FileExplorerTree[];

const init = () => {
  fileExplorerEl = createElement({
    tag: 'div',
    class: 'file-explorer',
  });

  fileExplorerEl.addEventListener('click', (e) => {
    const ele = closest(e.target as HTMLElement, 'ref');
    if (ele) {
      removeClass(fileExplorerEl.querySelectorAll('.ref') as NodeListOf<HTMLElement>, 'on');
      setClass(ele as HTMLElement, 'on');
      if (hasClass(ele, 'directory')) {
        if (hasClass(ele, 'open')) {
          removeClass(ele, 'open');
        } else {
          setClass(ele, 'open');
        }
      }
    }
  });

  fileExplorerEl.addEventListener('dblclick', (e) => {
    const ele = closest(e.target as HTMLElement, 'file');
    if (ele) {
      const node = searchNode(fileTree, ele.dataset.filepath!);
      if (node != null) {
        addTab(node.file);
      }
    }
  });

  load();
};

const searchNode = (tree: FileExplorerTree[] | null | undefined, filepath: string): FileExplorerTree | null | undefined => {
  let result;
  tree?.forEach((node) => {
    if (node.file.filepath == filepath) {
      result = node;
      return true;
    }
    const n = searchNode(node.children, filepath);
    if (n != null) {
      result = n;
      return true;
    }
  });
  return result;
};

const load = () => {
  setTimeout(() => {
    fileTree = [
      {
        file: {
          filepath: '/ERD Files',
          name: 'ERD Files',
        },
        isDirectory: true,
        isOpen: true,
        children: [
          {
            file: {
              filepath: '/ERD Files/Sample.erd.json',
              name: 'Sample.erd.json',
            },
          },
          {
            file: {
              filepath: '/ERD Files/Sample2.erd.json',
              name: 'Sample2.erd.json',
            },
          },
        ],
      },
      {
        file: {
          filepath: '/Sample.erd.json',
          name: 'Sample.erd.json',
        },
      },
    ];
    fileExplorerEl.innerHTML = renderFiles(fileTree, 0);
  }, 1);
};

const renderFiles = (fileTree: FileExplorerTree[], indent: number) => {
  let html = '';
  fileTree.forEach((node) => {
    if (node.isDirectory) {
      html += `
        <div class='ref directory ${node.isOpen ? 'open' : ''}' data-filepath='${node.file.filepath}'>
          <div class='title' style='padding-left: ${indent}px'>
            <div class='codicon'></div>
            <span>${node.file.name}</span>
          </div>
          ${node.children ? renderFiles(node.children, indent + 10) : ''}
        </div>
      `;
    } else {
      html += `
        <div class='ref file' data-filepath='${node.file.filepath}'>
          <div class='title' style='padding-left: ${indent}px'>
            <div class='codicon codicon-table'></div>
            <span>${node.file.name}</span>
          </div>
        </div>
      `;
    }
  });
  return html;
};

const openFile = (filepath: string) => {
  const node = searchNode(fileTree, filepath);
  if (node != null) {
    addTab(node.file);
  }
};

init();

export { fileExplorerEl, openFile };
