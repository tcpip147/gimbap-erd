import '@vscode/codicons/dist/codicon.css';
import '@/index.scss';
import { titlebarEl } from '@/components/titlebar';
import { menubarEl } from '@/components/menubar';
import { viewportEl } from '@/components/viewport';

window.onload = function () {
  document.body.append(titlebarEl);
  document.body.append(menubarEl);
  document.body.append(viewportEl);
};
