import '@/local/local.ko';
import '@/index.scss';
import '@vscode/codicons/dist/codicon.css';
import { menubarEl } from '@/components/menubar';
import { titlebarEl } from '@/components/titlebar';
import { viewportEl } from '@/components/viewport';
import { openFile } from '@/explorers/file-explorer';

window.onload = function () {
  // document.body.append(titlebarEl);
  document.body.append(menubarEl);
  document.body.append(viewportEl);

  setTimeout(() => {
    openFile('/Sample.erd.json');
  }, 1);
};
