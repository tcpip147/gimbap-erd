import { closest, createElement, hasClass, removeClass, removeElement, setClass } from '@/utils/element-utils';
import '@/canvas/table.scss';

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
  ctx: CanvasRenderingContext2D;
  selected: boolean = false;

  x = 50;
  y = 50;
  width = 0;
  height = 200;
  name = 'Table Name';
  comment = 'Comment';
  columns: Column[] = [];
  colWidth: number[] = [];

  private font = '12px "Malgun Gothic"';
  private colNames = ['PK', 'FK', 'Name', 'Type', 'Nullable', 'Default', 'Comment'];

  constructor(canvasContainerEl: HTMLElement, canvasEl: HTMLCanvasElement) {
    this.canvasContainerEl = canvasContainerEl;

    this.element = createElement({
      tag: 'div',
      class: 'table',
      css: {
        width: this.width + 'px',
        top: this.y + 'px',
        left: this.x + 'px',
      },
    });

    this.ctx = canvasEl.getContext('2d')!;
    this.ctx.font = this.font;

    this.columns.push({
      isPrimary: false,
      isForeign: false,
      name: '',
      type: '',
      isNullable: false,
      defaultValue: '',
      comment: '',
    });

    this.columns.push({
      isPrimary: false,
      isForeign: false,
      name: '',
      type: '',
      isNullable: false,
      defaultValue: '',
      comment: '',
    });

    this.columns.push({
      isPrimary: false,
      isForeign: false,
      name: '',
      type: '',
      isNullable: false,
      defaultValue: '',
      comment: '',
    });

    this.columns.push({
      isPrimary: false,
      isForeign: false,
      name: '',
      type: '',
      isNullable: false,
      defaultValue: '',
      comment: '',
    });

    this.columns.push({
      isPrimary: false,
      isForeign: false,
      name: '',
      type: '',
      isNullable: false,
      defaultValue: '',
      comment: '',
    });

    this.columns.push({
      isPrimary: false,
      isForeign: false,
      name: '',
      type: '',
      isNullable: false,
      defaultValue: '',
      comment: '',
    });

    this.columns.push({
      isPrimary: false,
      isForeign: false,
      name: '',
      type: '',
      isNullable: false,
      defaultValue: '',
      comment: '',
    });

    this.columns.push({
      isPrimary: false,
      isForeign: false,
      name: '',
      type: '',
      isNullable: false,
      defaultValue: '',
      comment: '',
    });

    this.columns.push({
      isPrimary: false,
      isForeign: false,
      name: '',
      type: '',
      isNullable: false,
      defaultValue: '',
      comment: '',
    });

    this.columns.push({
      isPrimary: false,
      isForeign: false,
      name: '',
      type: '',
      isNullable: false,
      defaultValue: '',
      comment: '',
    });

    this.calculateWidth();

    this.element.innerHTML = `
      <div class='title'>
        <div class='name'>${this.name}</div>
        <div class='comment'>${this.comment}</div>
      </div>
      <div class='row header-row' data-index='0'>
        ${this.colNames.reduce((acc, name, i) => {
          const value = this.inputText(name, name);
          return acc + `<div class='cell header-cell' data-column='${name}' data-index='${i}' style='width: ${this.colWidth[i] + 'px'}'>${value}</div>`;
        }, '')}
      </div>
      ${this.columns.reduce((acc, column, i) => {
        let html = `
          <div class='row data-row' data-index='${i + 1}'>
            ${this.colNames.reduce((acc, name, j) => {
              let value;
              if (name == 'PK') {
                value = `<div class='codicon codicon-key pk'></div>`;
              } else if (name == 'FK') {
                value = `<div class='codicon codicon-key fk'></div>`;
              } else if (name == 'Name') {
                value = this.inputText(name, column.name);
              } else if (name == 'Type') {
                value = this.inputText(name, column.type);
              } else if (name == 'Nullable') {
                value = `<div class='null'></div>`;
              } else if (name == 'Default') {
                value = this.inputText(name, column.defaultValue);
              } else if (name == 'Comment') {
                value = this.inputText(name, column.comment);
              }
              let html = `
                <div class='cell data-cell' data-index='${j}' style='width: ${this.colWidth[j] + 'px'}'>${value}</div>
              `;
              return acc + html;
            }, '')}
          </div>
        `;
        return acc + html;
      }, '')}
    `;

    this.element.style.font = this.font;

    this.element.addEventListener('mousedown', (e) => {
      const cell = closest(e.target as HTMLDivElement, 'data-cell');
      if (cell) {
        const c = Number(cell.dataset.index);
        const name = this.colNames[c];
        if (name == 'PK') {
          const icon = cell.querySelector('.codicon') as HTMLDivElement;
          if (hasClass(icon, 'on')) {
            removeClass(icon, 'on');
          } else {
            setClass(icon, 'on');
          }
        } else if (name == 'Nullable') {
          const na = cell.querySelector('.null') as HTMLDivElement;
          if (hasClass(na, 'on')) {
            removeClass(na, 'on');
          } else {
            setClass(na, 'on');
          }
        } else if (name == 'Name' || name == 'Type' || name == 'Default' || name == 'Comment') {
          const input = cell.querySelector('input');
          if (input) {
            input.removeAttribute('readonly');
            if (!input.dataset.loaded) {
              input.dataset.loaded = 'on';
              input.addEventListener('blur', (e) => {
                input.setAttribute('readonly', 'readonly');
              });
              input.addEventListener('keydown', (e) => {
                setTimeout(() => {
                  this.resizeWidth(c);
                }, 1);
              });
            }
          }
        }
      }
    });
  }

  private inputText(name: string, value: string) {
    return `<input type='text' data-column='${name}' value='${value}' spellcheck='false' autocomplete='off' readonly />`;
  }

  private resizeWidth(c: number) {
    this.ctx.font = this.font;

    //
    const headerInput = this.element.querySelector(`.header-cell[data-index='${c}'] input`)! as HTMLInputElement;
    this.colWidth[c] = this.ctx.measureText((headerInput as HTMLInputElement).value).width + 10;

    //
    const inputs = this.element.querySelectorAll(`.data-cell[data-index='${c}'] input`);
    inputs.forEach((input) => {
      this.colWidth[c] = Math.max(this.colWidth[c], this.ctx.measureText((input as HTMLInputElement).value).width + 10);
    });

    //
    const header = this.element.querySelector(`.header-cell[data-index='${c}']`)! as HTMLDivElement;
    header.style.width = this.colWidth[c] + 'px';
    const cells = this.element.querySelectorAll(`.data-cell[data-index='${c}']`);
    cells.forEach((cell) => {
      (cell as HTMLDivElement).style.width = this.colWidth[c] + 'px';
    });

    //
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
        if (name == 'PK') {
          width = 24;
        } else if (name == 'FK') {
          width = 24;
        } else if (name == 'Name') {
          width = this.ctx.measureText(column.name).width + 10;
        } else if (name == 'Type') {
          width = this.ctx.measureText(column.type).width + 10;
        } else if (name == 'Nullable') {
          width = 72;
        } else if (name == 'Default') {
          width = this.ctx.measureText(column.defaultValue).width + 10;
        } else if (name == 'Comment') {
          width = this.ctx.measureText(column.comment).width + 10;
        }
        this.colWidth[i] = Math.max(this.colWidth[i], width);
      });
    });

    this.width = this.colWidth.reduce((acc, width) => acc + width, 0);
    this.element.style.width = this.width + 4 + 'px';
  }
}

export default Table;
