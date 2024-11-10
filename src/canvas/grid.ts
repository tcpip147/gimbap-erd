import Table from '@/canvas/table';

class Grid {
  toolbarEl: HTMLElement;

  constructor(toolbarEl: HTMLElement, canvasContainerEl: HTMLElement, canvasEl: HTMLCanvasElement) {
    this.toolbarEl = toolbarEl;
    const table = new Table(canvasContainerEl, canvasEl);
    canvasContainerEl.append(table.element);

    this.addToolbarEvent();
  }

  addToolbarEvent() {
    
  }
}

export default Grid;
