import { closest, createElement, hasClass, removeClass, removeElement, setClass } from '@/utils/element-utils';
import '@/canvas/table.scss';

interface Column {
  pk: HTMLDivElement;
  fk: HTMLDivElement;
  name: HTMLInputElement;
  type: HTMLInputElement;
  nullable: HTMLInputElement;
  defaultValue: HTMLInputElement;
  comment: HTMLInputElement;
}

class Table {
  canvasContainerEl: HTMLElement;
  element: HTMLElement;
  ctx: CanvasRenderingContext2D;

  name: HTMLInputElement;
  comment: HTMLInputElement;
  headers: HTMLDivElement[] = [];
  columns: Column[] = [];

  private font = '12px "Malgun Gothic"';
  private headerWidth: number[] = [];

  constructor(canvasContainerEl: HTMLElement, canvasEl: HTMLCanvasElement) {
    this.canvasContainerEl = canvasContainerEl;
    this.element = createElement({
      tag: 'div',
      class: 'table',
      css: {
        top: '50px',
        left: '50px',
      },
    });

    this.name = createElement({
      tag: 'input',
      class: 'input name',
      attr: {
        type: 'text',
        spellcheck: 'false',
        autocomplete: 'off',
        readonly: 'readonly',
      },
      dataset: {
        name: 'name',
      },
    }) as HTMLInputElement;

    this.comment = createElement({
      tag: 'input',
      class: 'input comment',
      attr: {
        type: 'text',
        spellcheck: 'false',
        autocomplete: 'off',
        readonly: 'readonly',
      },
      dataset: {
        name: 'comment',
      },
    }) as HTMLInputElement;

    this.createHeaders();
    this.addColumn();
    this.addColumn();

    this.ctx = canvasEl.getContext('2d')!;
    this.ctx.font = this.font;

    this.element.innerHTML = `
      <div class='title'>
        ${this.name.outerHTML}
        <div class='separator'></div>
        ${this.comment.outerHTML}
      </div>
      <div class='row header-row'>${this.headers.reduce((acc, header) => acc + header.outerHTML, '')}</div>
      ${this.columns.reduce((acc, column, i) => {
        let html = '';
        html += column.pk.outerHTML;
        html += column.fk.outerHTML;
        html += column.name.outerHTML;
        html += column.type.outerHTML;
        html += column.nullable.outerHTML;
        html += column.defaultValue.outerHTML;
        html += column.comment.outerHTML;
        return acc + `<div class='row data-row'>${html}</div>`;
      }, '')}
    `;
    this.element.style.font = this.font;

    this.element.addEventListener('mousedown', (e) => {
      if (hasClass(e.target as HTMLDivElement, 'input')) {
        const input = e.target as HTMLInputElement;
        input.removeAttribute('readonly');
        if (!input.dataset.loaded) {
          input.dataset.loaded = 'on';
          input.addEventListener('blur', (e) => {
            input.setAttribute('readonly', 'readonly');
          });
          input.addEventListener('keydown', (e) => {
            setTimeout(() => {
              this.resizeWidth(Number(input.dataset.index));
            }, 1);
          });
        }
      } else if (hasClass(e.target as HTMLDivElement, 'pk')) {
        const icon = e.target as HTMLDivElement;
        if (hasClass(icon, 'on')) {
          removeClass(icon, 'on');
        } else {
          setClass(icon, 'on');
        }
      }
    });
  }

  private createHeaders() {
    const colNames = ['PK', 'FK', 'Name', 'Type', 'Nullable', 'Default', 'Comment'];
    this.headerWidth = [30, 30, 54, 54, 54, 54, 64];
    colNames.forEach((colName, i) => {
      const header = createElement({
        tag: 'input',
        class: 'input',
        css: {
          width: this.headerWidth[i] + 'px',
        },
        attr: {
          type: 'text',
          spellcheck: 'false',
          autocomplete: 'off',
          readonly: 'readonly',
          value: colName,
        },
        dataset: {
          index: i + '',
        },
      }) as HTMLInputElement;
      this.headers.push(header);
    });
  }

  private addColumn() {
    this.columns.push({
      pk: createElement({
        tag: 'div',
        class: 'codicon codicon-key pk',
        css: {
          width: this.headerWidth[0] + 'px',
        },
        dataset: {
          index: '0',
        },
      }) as HTMLDivElement,
      fk: createElement({
        tag: 'div',
        class: 'codicon codicon-key fk',
        css: {
          width: this.headerWidth[1] + 'px',
        },
        dataset: {
          index: '1',
        },
      }) as HTMLDivElement,
      name: createElement({
        tag: 'input',
        class: 'input',
        css: {
          width: this.headerWidth[2] + 'px',
        },
        attr: {
          type: 'text',
          spellcheck: 'false',
          autocomplete: 'off',
          readonly: 'readonly',
        },
        dataset: {
          index: '2',
        },
      }) as HTMLInputElement,
      type: createElement({
        tag: 'input',
        class: 'input',
        css: {
          width: this.headerWidth[3] + 'px',
        },
        attr: {
          type: 'text',
          spellcheck: 'false',
          autocomplete: 'off',
          readonly: 'readonly',
        },
        dataset: {
          index: '3',
        },
      }) as HTMLInputElement,
      nullable: createElement({
        tag: 'input',
        class: 'input',
        css: {
          width: this.headerWidth[4] + 'px',
        },
        attr: {
          type: 'text',
          spellcheck: 'false',
          autocomplete: 'off',
          readonly: 'readonly',
        },
        dataset: {
          index: '4',
        },
      }) as HTMLInputElement,
      defaultValue: createElement({
        tag: 'input',
        class: 'input',
        css: {
          width: this.headerWidth[5] + 'px',
        },
        attr: {
          type: 'text',
          spellcheck: 'false',
          autocomplete: 'off',
          readonly: 'readonly',
        },
        dataset: {
          index: '5',
        },
      }) as HTMLInputElement,
      comment: createElement({
        tag: 'input',
        class: 'input',
        css: {
          width: this.headerWidth[6] + 'px',
        },
        attr: {
          type: 'text',
          spellcheck: 'false',
          autocomplete: 'off',
          readonly: 'readonly',
        },
        dataset: {
          index: '6',
        },
      }) as HTMLInputElement,
    });
  }

  private resizeWidth(c: number) {
    this.ctx.font = this.font;

    const cells = this.element.querySelectorAll(`.input[data-index='${c}']`);
    let maxWidth = this.headerWidth[c];
    cells.forEach((cell) => {
      maxWidth = Math.max(maxWidth, this.ctx.measureText((cell as HTMLInputElement).value).width + 7);
    });

    cells.forEach((cell) => {
      const input = cell as HTMLInputElement;
      input.style.width = maxWidth + 'px';
    });
  }
}

export default Table;
