import Table from '@/canvas/table';
import { hasClass } from '@/utils/element-utils';

class Grid {
  toolbarEl: HTMLElement;
  canvasContainerEl: HTMLElement;
  canvasEl: HTMLCanvasElement;

  constructor(toolbarEl: HTMLElement, canvasContainerEl: HTMLElement, canvasEl: HTMLCanvasElement) {
    this.toolbarEl = toolbarEl;
    this.canvasContainerEl = canvasContainerEl;
    this.canvasEl = canvasEl;

    this.addToolbarEvent();
  }

  addToolbarEvent() {
    this.toolbarEl.addEventListener('mousedown', (e) => {
      if (hasClass(e.target as HTMLDivElement, 'button')) {
        const button = e.target as HTMLDivElement;
        if (button.dataset.command == 'add-table') {
          this.addTable();
        }
      }
    });
  }

  addTable() {
    const table = new Table(this.canvasContainerEl, this.canvasEl);
    this.canvasContainerEl.append(table.element);
  }
}

export default Grid;
