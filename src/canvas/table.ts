import { CanvasInput } from '@/canvas/input';
import Grid from '@/canvas/grid';
import Shape, { ShapeType } from '@/canvas/shape';

class Table extends Shape {
  static KEY = 'Key';
  static NAME = 'Name';
  static TYPE = 'Type';
  static DEFAULT_VALUE = 'Default';
  static NULLABLE = 'Null';
  static COMMENT = 'Comment';

  static TITLE_HEIGHT = 22;
  static ROW_HEIGHT = 19;

  zIndex: number = 10;
  width = 0;
  height = 0;
  name = 'Table Name';
  comment = 'Comment';
  columns: Column[] = [];
  headers: string[];
  yOffset: number = 0;
  xOffsets: number[] = [];
  font = '9pt "Malgun Gothic"';
  paddingLeft = 5;
  paddingRight = 5;
  editables: Editable[] = [];
  onKeyDownEditable: EventListener | null = null;
  titleNameInput: CanvasInput;
  titleCommentInput: CanvasInput;
  bindedEditable: [HTMLInputElement, Editable] | null = null;
  titleBackground = 'rgb(129, 129, 190)';
  rowBackground = 'rgb(33, 33, 34)';

  constructor(grid: Grid) {
    super(grid, ShapeType.TABLE);
    this.headers = [Table.KEY, Table.NAME, Table.TYPE, Table.DEFAULT_VALUE, Table.NULLABLE, Table.COMMENT];

    let column = new Column();
    column.isPK = true;
    column.name = 'ERG_MSR_DT_ID_ID';
    column.nullable = false;
    column.type = 'VARCHAR(45)';
    column.defValue = 'P000000';
    column.comment = '시스템식별ID';
    this.columns.push(column);

    column = new Column();
    column.isPK = true;
    column.name = 'ERG_MSR_DT';
    column.nullable = false;
    column.type = 'VARCHAR';
    column.defValue = 'P000';
    column.comment = '시스템식별ddddddddd';
    this.columns.push(column);

    column = new Column();
    column.isPK = true;
    column.name = 'ERG_MSR_DT';
    column.nullable = false;
    column.type = 'VARCHAR';
    column.defValue = 'P000';
    column.comment = '시스템식별ddddddddd';
    this.columns.push(column);

    this.titleNameInput = new CanvasInput(this.grid);
    this.titleNameInput.setPadding([2, 1, 2, 5]);
    this.titleCommentInput = new CanvasInput(this.grid);
    this.titleCommentInput.setPadding([2, 1, 2, 5]);
    this.titleCommentInput.setAlign("right");
  }

  paint(): void {
    if (this.isVisible) {
      this.calcXOffsets();
      this.calcHeight();
      this.grid.ctx.strokeStyle = this.titleBackground;
      this.grid.ctx.fillStyle = this.titleBackground;
      this.grid.ctx.font = this.font;
      this.yOffset = 0;
      this.drawTitle();
      this.drawHeader();
      this.drawColumns();
      this.strokeRect(this.x, this.y, this.width, this.height, this.isRelative);
      this.debug();
    }
  }

  calcXOffsets() {
    this.grid.ctx.font = this.font;
    let sum = 0;
    this.headers.forEach((header, i) => {
      sum += this.paddingLeft + this.grid.ctx.measureText(header).width + this.paddingRight;
      this.xOffsets[i] = sum;
    });
    this.columns.forEach((column) => {
      this.headers.forEach((header, i) => {
        let value;
        if (header == Table.NAME) {
          value = column.name;
        } else if (header == Table.TYPE) {
          value = column.type;
        } else if (header == Table.DEFAULT_VALUE) {
          value = column.defValue;
        } else if (header == Table.COMMENT) {
          value = column.comment;
        } else {
          value = this.headers[i];
        }
        this.calcXoffsetOfColumn(i, value);
      });
    });
    this.width = this.xOffsets[this.xOffsets.length - 1] + 0.5;
  }

  calcXoffsetOfColumn(i: number, value: string) {
    this.xOffsets[i] = Math.max(this.xOffsets[i], (i == 0 ? 0 : this.xOffsets[i - 1]) + this.paddingLeft + this.grid.ctx.measureText(value).width + this.paddingRight);
  }

  calcHeight() {
    this.height = Table.TITLE_HEIGHT + Table.ROW_HEIGHT + Table.ROW_HEIGHT * this.columns.length;
  }

  drawTitle() {
    this.fillRect(this.x, this.y, this.width, Table.TITLE_HEIGHT, this.isRelative);
    this.titleNameInput.draw(this.x + 2, this.y + this.yOffset + 1, this.isRelative);
    this.titleCommentInput.draw(this.x + this.width - 2, this.y + this.yOffset + 1, this.isRelative);
  }

  drawHeader() {
    this.yOffset += Table.TITLE_HEIGHT;
    this.grid.ctx.fillStyle = this.rowBackground;
    this.grid.ctx.strokeStyle = this.titleBackground;
    this.fillRect(this.x, this.y + this.yOffset - 1, this.width - 1, Table.TITLE_HEIGHT - 1, this.isRelative);
    for (let i = 0; i < this.headers.length; i++) {
      this.fillText(this.headers[i], this.x + (i == 0 ? this.paddingLeft : this.xOffsets[i - 1] + this.paddingLeft), this.y + this.yOffset + 13, { color: '#ffffff', align: 'left' }, this.isRelative);
      this.strokeLine(this.x + this.xOffsets[i], this.y + this.yOffset, this.x + this.xOffsets[i], this.y + this.yOffset + Table.ROW_HEIGHT, this.isRelative);
    }
    this.strokeLine(this.x, this.y + this.yOffset + Table.ROW_HEIGHT, this.x + this.width, this.y + this.yOffset + Table.ROW_HEIGHT, this.isRelative);
  }

  drawColumns() {
    this.columns.forEach((column) => {
      this.yOffset += Table.ROW_HEIGHT;
      this.grid.ctx.fillStyle = this.rowBackground;
      this.grid.ctx.strokeStyle = this.titleBackground;
      this.fillRect(this.x, this.y + this.yOffset, this.width - 1, Table.TITLE_HEIGHT - 2, this.isRelative);

      this.headers.forEach((header, i) => {
        let value;
        if (header == Table.KEY) {
          value = column.isPK + '';
          this.drawColumn(i, value);
        } else if (header == Table.NAME) {
          value = column.name;
          this.drawColumn(i, value);
        } else if (header == Table.TYPE) {
          value = column.type;
          this.drawColumn(i, value);
        } else if (header == Table.DEFAULT_VALUE) {
          value = column.defValue;
          this.drawColumn(i, value);
        } else if (header == Table.NULLABLE) {
          value = column.nullable + '';
          this.drawColumn(i, value);
        } else {
          value = column.comment;
          this.drawColumn(i, value);
        }
      });
      this.strokeLine(this.x, this.y + this.yOffset + Table.ROW_HEIGHT, this.x + this.width, this.y + this.yOffset + Table.ROW_HEIGHT, this.isRelative);
    });
  }

  drawEditable(editable: Editable, i: number, value: string) {
    const x = this.x + (i == 0 ? this.paddingLeft : this.xOffsets[i - 1] + this.paddingLeft) + 5;
    const y = this.y + this.yOffset + 14;
    editable.setValue({
      x: x,
      y: y,
      value: value,
    });
    editable.draw();
    this.strokeLine(this.x + this.xOffsets[i], this.y + this.yOffset, this.x + this.xOffsets[i], this.y + this.yOffset + Table.ROW_HEIGHT, this.isRelative);
  }

  drawColumn(i: number, value: string) {
    const x = this.x + (i == 0 ? this.paddingLeft : this.xOffsets[i - 1] + this.paddingLeft);
    const y = this.y + this.yOffset + 14;
    this.fillText(value, x, y, { color: '#ffffff', align: 'left' }, this.isRelative);
    this.strokeLine(this.x + this.xOffsets[i], this.y + this.yOffset, this.x + this.xOffsets[i], this.y + this.yOffset + Table.ROW_HEIGHT, this.isRelative);
  }

  inBoundedEditable(px: number, py: number) {
    const [x, y] = this.toRelative(px, py);
    for (let i = 0; i < this.editables.length; i++) {
      const editable = this.editables[i];
      if (x > editable.x1 && x < editable.x2 && y > editable.y1 && y < editable.y2) {
        return editable;
      }
    }
    return null;
  }

  inBoundedDblEditable(px: number, py: number) {
    const [x, y] = this.toRelative(px, py);
    const editables = [this.titleCommentInput];
    for (let i = 0; i < editables.length; i++) {
      const editable = editables[i];
    }
    return null;
  }

  bind(inputText: HTMLInputElement, editable: Editable) {
    this.bindedEditable = [inputText, editable];
    const [x1, y1] = this.toAbsolute(editable.x1, editable.y1);
    const [x2, y2] = this.toAbsolute(editable.x2, editable.y2);
    const data = editable.get();
    inputText.style.cssText = `
      display: block;
      left: ${x1 - 2}px;
      top: ${y1 - 2}px;
      width: ${x2 - x1 - (data.align == 'right' ? 2 : 0)}px;
      background: ${editable.background};
    `;

    inputText.value = editable.value;
    inputText.focus();
    inputText.selectionStart = inputText.value.length;
    inputText.selectionEnd = inputText.value.length;
    this.onKeyDownEditable = (e: Event) => {
      setTimeout(() => {
        const data = editable.get();
        editable.setValue({ value: inputText.value });
        this.grid.redraw();
        const [x1, y1] = this.toAbsolute(editable.x1, editable.y1);
        const [x2, y2] = this.toAbsolute(editable.x2, editable.y2);
        inputText.style.cssText = `
          display: block;
          left: ${x1 - 2}px;
          top: ${y1 - 2}px;
          width: ${x2 - x1 - (data.align == 'right' ? 2 : 0)}px;
          background: ${editable.background};
        `;
      }, 1);
    };
    inputText.addEventListener('keydown', this.onKeyDownEditable);
  }

  unbind() {
    if (this.bindedEditable) {
      this.bindedEditable[0].removeEventListener('keydown', this.onKeyDownEditable!);
      this.bindedEditable[0].style.display = 'none';
      this.onKeyDownEditable = null;
      this.bindedEditable = null;
    }
  }

  debug() {
    if (Shape.DEBUG_MODE) {
      this.editables.forEach((editable) => {
        const temp = this.grid.ctx.strokeStyle;
        this.grid.ctx.strokeStyle = 'red';
        this.strokeRect(editable.x1, editable.y1, editable.x2 - editable.x1, editable.y2 - editable.y1, this.isRelative);
        this.grid.ctx.strokeStyle = temp;
      });
    }
  }
}

class Column {
  isPK: boolean = false;
  name: string = '';
  comment: string = '';
  type: string = '';
  defValue: string = '';
  nullable: boolean = false;
  nameEditable: Editable | null = null;
}

class Editable {
  table: Table;
  x1: number = 0;
  y1: number = 0;
  x2: number = 0;
  y2: number = 0;
  value: string = '';
  background: string;
  get: Function;
  setValue: (value: any) => void;

  constructor(table: Table, get: Function, setValue: (value: any) => void) {
    this.table = table;
    this.get = get;
    this.setValue = setValue;
    this.background = table.rowBackground;
  }

  draw() {
    const data = this.get();
    if (data.background) {
      this.background = data.background;
    }
    this.y1 = data.y - 11;
    if (data.align == 'left') {
      this.x1 = data.x - 4;
      this.x2 = this.x1 + Math.max(this.table.grid.ctx.measureText(data.value).width, data.minWidth) + 1;
    } else if (data.align == 'right') {
      this.x2 = data.x + 2;
      this.x1 = this.x2 - Math.max(this.table.grid.ctx.measureText(data.value).width, data.minWidth) - 4;
    }
    this.y2 = this.y1 + 15;
    this.value = data.value;
    this.table.fillText(data.value, this.x1, data.y, { color: '#ffffff', align: 'left' }, this.table.isRelative);
  }
}

export { Editable };

export default Table;
