import Grid from '@/canvas/grid';

export enum ShapeType {
  TABLE,
  ROLLER,
  INPUT,
}

class Shape {
  static DEBUG_MODE = false;

  type: ShapeType;
  grid: Grid;
  x = 0;
  y = 0;
  zIndex: number = 0;
  isRelative: boolean = false;
  isVisible: boolean = false;
  children: Shape[] = [];

  constructor(grid: Grid, type: ShapeType) {
    this.grid = grid;
    this.type = type;
  }

  paint() {}

  setIsRelative(isRelative: boolean) {
    if (!this.isRelative && isRelative) {
      // x,y 는 고유해야 한다
      const [x, y] = this.toRelative(this.x, this.y);
      this.x = x;
      this.y = y;
    }
    this.isRelative = isRelative;
  }

  toRelative(x: number, y: number) {
    return [x + this.grid.roller.originX - this.grid.roller.width, y + this.grid.roller.originY - this.grid.roller.height];
  }

  toAbsolute(x: number, y: number) {
    return [x - this.grid.roller.originX + this.grid.roller.width, y - this.grid.roller.originY + this.grid.roller.height];
  }

  addChild(child: Shape) {
    this.children.push(child);
  }

  //

  crisp(pixel: number) {
    const halfThickness = this.grid.ctx.lineWidth / 2;
    return this.grid.ctx.lineWidth % 2 ? (Number.isInteger(pixel) ? pixel : Math.round(pixel + halfThickness)) - halfThickness : Math.round(pixel);
  }

  clearRect(x: number, y: number, width: number, height: number, isRelative?: boolean) {
    this.grid.ctx.fillRect(
      this.crisp(x) - (isRelative ? this.grid.roller.originX - this.grid.roller.width : 0),
      this.crisp(y) - (isRelative ? this.grid.roller.originY - this.grid.roller.height : 0),
      width,
      height,
    );
  }

  fillRect(x: number, y: number, width: number, height: number, isRelative?: boolean) {
    this.grid.ctx.fillRect(
      this.crisp(x) - (isRelative ? this.grid.roller.originX - this.grid.roller.width : 0),
      this.crisp(y) - (isRelative ? this.grid.roller.originY - this.grid.roller.height : 0),
      width,
      height,
    );
  }

  strokeRect(x: number, y: number, width: number, height: number, isRelative?: boolean) {
    this.grid.ctx.strokeRect(
      this.crisp(x) - (isRelative ? this.grid.roller.originX - this.grid.roller.width : 0),
      this.crisp(y) - (isRelative ? this.grid.roller.originY - this.grid.roller.height : 0),
      width,
      height,
    );
  }

  strokeLine(x1: number, y1: number, x2: number, y2: number, isRelative?: boolean) {
    this.grid.ctx.beginPath();
    this.moveTo(x1, y1, isRelative);
    this.lineTo(x2, y2, isRelative);
    this.grid.ctx.stroke();
  }

  moveTo(x: number, y: number, isRelative?: boolean) {
    this.grid.ctx.moveTo(this.crisp(x) - (isRelative ? this.grid.roller.originX - this.grid.roller.width : 0), this.crisp(y) - (isRelative ? this.grid.roller.originY - this.grid.roller.height : 0));
  }

  lineTo(x: number, y: number, isRelative?: boolean) {
    this.grid.ctx.lineTo(this.crisp(x) - (isRelative ? this.grid.roller.originX - this.grid.roller.width : 0), this.crisp(y) - (isRelative ? this.grid.roller.originY - this.grid.roller.height : 0));
  }

  fillText(text: string, x: number, y: number, options: { color?: string; align?: CanvasTextAlign; font?: string }, isRelative?: boolean) {
    const temp = this.grid.ctx.fillStyle;
    if (options.color) {
      this.grid.ctx.fillStyle = options.color;
    }
    if (options.align) {
      this.grid.ctx.textAlign = options.align;
    }
    if (options.font) {
      this.grid.ctx.font = options.font;
    }
    this.grid.ctx.fillText(
      text,
      this.crisp(x) - (isRelative ? this.grid.roller.originX - this.grid.roller.width : 0),
      this.crisp(y) - (isRelative ? this.grid.roller.originY - this.grid.roller.height : 0),
    );
    this.grid.ctx.fillStyle = temp;
  }
}

export default Shape;
