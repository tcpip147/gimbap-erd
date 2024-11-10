import { closest, createElement, removeElement } from '@/utils/element-utils';
import '@/canvas/table.scss';
import { globalContext } from '@/utils/global-context';

interface Column {
  isPrimary: boolean;
  isForeign: boolean;
  name: string;
  type: string;
  isNullable: boolean;
  defaultValue: string;
  comment: string;
}

class Table {
  canvasContainerEl: HTMLElement;
  element: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  x = 50;
  y = 50;
  width = 0;
  height = 200;
  name = 'Table Name';
  comment = 'Comment';
  columns: Column[] = [];
  colWidth: number[] = [];

  private font = '12px "Malgun Gothic"';
  private colNames = ['Key', 'Name', 'Type', 'Null', 'Default', 'Comment'];

  constructor(canvasContainerEl: HTMLElement) {
    this.canvasContainerEl = canvasContainerEl;
    this.canvas = createElement({
      tag: 'canvas',
      class: 'table-canvas',
      css: {
        width: this.width + 8 + 'px',
        height: this.height + 8 + 'px',
      },
    }) as HTMLCanvasElement;

    this.element = createElement({
      tag: 'div',
      class: 'table',
      css: {
        width: this.width + 'px',
        height: this.height + 'px',
        top: this.y + 'px',
        left: this.x + 'px',
      },
    });

    this.ctx = this.canvas.getContext('2d')!;
    this.canvas.height = (this.height + 8) * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.ctx.font = this.font;

    this.columns.push({
      isPrimary: false,
      isForeign: false,
      name: ' ',
      type: ' ',
      isNullable: false,
      defaultValue: ' ',
      comment: ' ',
    });

    this.calculateWidth();

    this.element.innerHTML = `
      <div class='title'>
        <div class='name'>${this.name}</div>
        <div class='comment'>${this.comment}</div>
      </div>
      <div class='row header-row' data-index='0'>
        ${this.colNames.reduce((acc, name, i) => {
          return acc + `<div class='cell header-cell' data-index='${i}' style='width: ${this.colWidth[i] + 'px'}'>${name}</div>`;
        }, '')}
      </div>
      ${this.columns.reduce((acc, column, i) => {
        let html = `
        <div class='row data-row' data-index='${i + 1}'>
          ${this.colNames.reduce((acc, name, i) => {
            let value;
            if (name == 'Key') {
              value = ' ';
            } else if (name == 'Name') {
              value = column.name;
            } else if (name == 'Type') {
              value = column.type;
            } else if (name == 'Null') {
              value = ' ';
            } else if (name == 'Default') {
              value = column.defaultValue;
            } else if (name == 'Comment') {
              value = column.comment;
            }
            return acc + `<div class='cell data-cell' data-index='${i}' style='width: ${this.colWidth[i] + 'px'}'>${value == ' ' ? '&nbsp;' : value}</div>`;
          }, '')}
        </div>
        `;
        return acc + html;
      }, '')}
    `;

    this.element.style.font = this.font;
    this.element.style.width = this.width + 4 + 'px';
    this.element.append(this.canvas);

    this.canvas.style.width = this.width + 8 + 'px';
    this.canvas.width = (this.width + 8) * window.devicePixelRatio;

    this.element.addEventListener('mousedown', (e) => {
      const cell = closest(e.target as HTMLDivElement, 'data-cell');
      if (cell) {
        const canvasContainerRect = canvasContainerEl.getBoundingClientRect();
        const rect = cell.getBoundingClientRect();
        const c = Number(cell.dataset.index);
        const name = this.colNames[c];
        if (name == 'Key') {
        } else if (name == 'Name' || name == 'Type' || name == 'Default' || name == 'Comment') {
          const inputText = canvasContainerEl.querySelector('.input-text') as HTMLInputElement;
          inputText.style.cssText = `
            display: inline;
            top: ${rect.top - canvasContainerRect.top}px;
            left: ${rect.left - canvasContainerRect.left - 1}px;
            width: ${cell.style.width};
            font: ${this.font}
          `;
          inputText.value = cell.innerText;
          setTimeout(() => {
            inputText.focus();
          }, 1);
          inputText.addEventListener('keydown', (e) => {
            setTimeout(() => {
              cell.innerText = inputText.value;
              this.resizeWidth(inputText, c);
            }, 1);
          });
        } else if (name == 'Null') {
        }
      }
    });
  }

  private resizeWidth(inputText: HTMLInputElement, c: number) {
    const cells = this.element.querySelectorAll(`.cell[data-index='${c}']`);
    this.colWidth[c] = 0;
    this.ctx.font = this.font;
    cells.forEach((cell) => {
      this.colWidth[c] = Math.max(this.colWidth[c], this.ctx.measureText((cell as HTMLDivElement).innerText).width + 10);
    });
    cells.forEach((cell) => {
      (cell as HTMLDivElement).style.width = this.colWidth[c] + 'px';
    });
    inputText.style.width = this.colWidth[c] + 'px';
    this.width = this.colWidth.reduce((acc, width) => acc + width, 0);
    this.element.style.width = this.width + 4 + 'px';
  }

  private calculateWidth() {
    this.colNames.forEach((name) => {
      const width = this.ctx.measureText(name).width + 10;
      this.colWidth.push(width);
    });

    this.columns.forEach((column) => {
      this.colNames.forEach((name, i) => {
        let width = 0;
        if (name == 'Key') {
          width = 44;
        } else if (name == 'Name') {
          width = this.ctx.measureText(column.name).width + 10;
        } else if (name == 'Type') {
          width = this.ctx.measureText(column.type).width + 10;
        } else if (name == 'Null') {
          width = 22;
        } else if (name == 'Default') {
          width = this.ctx.measureText(column.defaultValue).width + 10;
        } else if (name == 'Comment') {
          width = this.ctx.measureText(column.comment).width + 10;
        }
        this.colWidth[i] = Math.max(this.colWidth[i], width);
      });
    });

    this.width = this.colWidth.reduce((acc, width) => acc + width, 0);
  }
}

export default Table;
