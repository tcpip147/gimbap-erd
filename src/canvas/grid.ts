import { CanvasInput } from '@/canvas/input';
import Roller from '@/canvas/roller';
import Shape, { ShapeType } from '@/canvas/shape';
import Table, { Editable } from '@/canvas/table';

export enum GridState {
  IDLE,
  ADDING_TABLE,
  UNTOUCHABLE,
  TEXT_EDITING,
}

class Grid {
  toolbarEl: HTMLElement;
  canvasContainerEl: HTMLElement;
  canvasEl: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  gridSize: number = 20;
  gridHalfSize: number = this.gridSize / 2;
  shapeList: Shape[];
  state: GridState = GridState.IDLE;
  context: any = {};
  roller: Roller = new Roller(this);

  constructor(toolbarEl: HTMLElement, canvasContainerEl: HTMLElement, canvasEl: HTMLCanvasElement) {
    this.toolbarEl = toolbarEl;
    this.canvasContainerEl = canvasContainerEl;
    this.canvasEl = canvasEl;
    this.ctx = canvasEl.getContext('2d')!;
    this.shapeList = [];
    this.roller.isVisible = true;

    toolbarEl.addEventListener('click', (e) => {
      const button = e.target as HTMLElement;
      switch (button.dataset.command) {
        case 'add-table':
          this.addTable();
          break;
      }
    });

    canvasEl.addEventListener('mousedown', (e) => {
      if (this.state == GridState.UNTOUCHABLE) {
        this.shapeList.forEach((shape) => {
          if (shape.type == ShapeType.TABLE) {
            const table = shape as Table;
            table.unbind();
            this.state = GridState.IDLE;
          }
        });
        this.redraw();
      }
    });

    canvasEl.addEventListener('mousemove', (e) => {
      if (this.state == GridState.ADDING_TABLE) {
        this.context.table.x = this.grapX(e.offsetX - this.context.table.width / 2);
        this.context.table.y = this.grapY(e.offsetY);
        this.redraw();
      }
    });

    canvasEl.addEventListener('mouseup', (e) => {
      if (this.state == GridState.IDLE) {
        const editable = this.getSelectedClickEditable(e.offsetX, e.offsetY);
        if (editable) {
          const inputText = canvasContainerEl.querySelector('#inputText') as HTMLInputElement;
          this.state = GridState.UNTOUCHABLE;
          editable.table.bind(inputText, editable);
        }
      } else if (this.state == GridState.ADDING_TABLE) {
        this.state = GridState.IDLE;
        this.context.table.zIndex = 0;
        this.context.table.setIsRelative(true);
      } else if (this.state == GridState.TEXT_EDITING) {
        if (CanvasInput.selected == null) {
          this.state = GridState.IDLE;
        }
      }
      this.redraw();
    });

    canvasEl.addEventListener('mouseenter', (e) => {
      if (this.state == GridState.ADDING_TABLE) {
        this.context.table.isVisible = true;
        this.redraw();
      }
    });

    canvasEl.addEventListener('mouseleave', (e) => {
      if (this.state == GridState.ADDING_TABLE) {
        this.context.table.isVisible = false;
        this.redraw();
      }
    });

    canvasEl.addEventListener('dblclick', (e) => {
      if (this.state == GridState.IDLE) {
        const editable = this.getSelectedDblClickEditable(e.offsetX, e.offsetY);
        if (editable) {
          const inputText = canvasContainerEl.querySelector('#inputText') as HTMLInputElement;
          this.state = GridState.UNTOUCHABLE;
          editable.table.bind(inputText, editable);
        }
        this.redraw();
      }
    });
  }

  getSelectedClickEditable(x: number, y: number): Editable | null {
    let selected = null;
    this.shapeList.forEach((shape) => {
      if (shape.type == ShapeType.TABLE) {
        const table = shape as Table;
        const editable = table.inBoundedEditable(x, y);
        if (editable) {
          selected = editable;
          return true;
        }
      }
    });
    return selected;
  }

  getSelectedDblClickEditable(x: number, y: number): Editable | null {
    let selected = null;
    this.shapeList.forEach((shape) => {
      if (shape.type == ShapeType.TABLE) {
        const table = shape as Table;
        const editable = table.inBoundedDblEditable(x, y);
        if (editable) {
          selected = editable;
          return true;
        }
      }
    });
    return selected;
  }

  //

  redraw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    const plainShapeList = this.shapeList.map((v) => v);
    plainShapeList.sort((a, b) => {
      return a.zIndex - b.zIndex;
    });
    plainShapeList.forEach((shape) => {
      shape.paint();
    });
    this.roller.paint();
  }

  grapX(x: number) {
    return x - (x % this.gridSize) + this.roller.paddingLeft;
  }

  grapY(y: number) {
    return y - (y % this.gridSize);
  }

  //

  addTable() {
    if (this.state == GridState.IDLE) {
      this.state = GridState.ADDING_TABLE;
      const table = new Table(this);
      this.context = {
        table: table,
        x: 0,
        y: 0,
      };
      this.shapeList.push(table);
      this.redraw();
    }
  }
}

export default Grid;
