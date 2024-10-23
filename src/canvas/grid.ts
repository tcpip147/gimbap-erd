import Shape from '@/canvas/shape';
import Table from '@/canvas/table';
import { TabInfo } from '@/components/viewport';
import { FileType } from '@/explorers/file-explorer';

class Grid {
  canvasContainer: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  file: FileType;
  scale: number;
  origin: [number, number];
  left: number;
  shapes: Shape[] = [];

  constructor(canvasContainerEl: HTMLElement, file: FileType) {
    this.canvasContainer = canvasContainerEl;
    this.canvas = canvasContainerEl.querySelector('.canvas')!;
    this.ctx = this.canvas.getContext('2d')!;
    this.file = file;
    this.scale = file.data?.scale ? file.data.scale : 1.0;
    this.origin = [0, 0];
    this.left = 5;
  }

  fitToSize() {
    const rect = this.canvasContainer.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  redraw() {
    this.ctx.clearRect(0, 0, this.fillWidth(), this.fillHeight());
    const shapes = this.shapes.sort((a: Shape, b: Shape) => {
      return a.zIndex - b.zIndex;
    });
    shapes.forEach((shape) => {
      shape.paint();
    });
    this.drawRoller();
  }

  drawRoller() {
    this.ctx.fillStyle = '#212122';
    this.ctx.strokeStyle = '#404040';
    this.ctx.font = 'normal 11px "Malgun Gothic"';

    const digits = Math.round((this.fillHeight() + this.origin[1]) / 20).toString().length;
    this.left = 5 + digits * 5;

    this.fillRect(0, 0, this.fillWidth(), 20, true);
    this.fillRect(0, 0, 20 + this.left, this.fillHeight(), true);

    this.ctx.beginPath();
    for (let i = 2; i < (this.fillWidth() + this.origin[0]) / 20; i++) {
      if ((i - 1) % 5 == 0) {
        this.moveTo(i * 20 + this.left - this.origin[0], 15, true);
        this.fillText((i - 1).toString(), i * 20 + this.left - this.origin[0], 10, { color: '#999', align: 'center' }, true);
      } else {
        this.moveTo(i * 20 + this.left - this.origin[0], 10, true);
      }
      this.lineTo(i * 20 + this.left - this.origin[0], 20, true);
    }
    for (let i = 2; i < (this.fillHeight() + this.origin[1]) / 20; i++) {
      if ((i - 1) % 5 == 0) {
        this.fillText((i - 1).toString(), 10 + this.left, i * 20 + 3 - this.origin[1], { color: '#999', align: 'right' }, true);
        this.moveTo(15 + this.left, i * 20 - this.origin[1], true);
      } else {
        this.moveTo(10 + this.left, i * 20 - this.origin[1], true);
      }
      this.lineTo(20 + this.left, i * 20 - this.origin[1], true);
    }
    this.moveTo(20 + this.left, 0, true);
    this.lineTo(20 + this.left, this.fillHeight(), true);
    this.moveTo(0, 20, true);
    this.lineTo(this.fillWidth(), 20, true);
    this.ctx.stroke();
    this.fillRect(0, 0, 20 + this.left, 20, true);
  }

  //

  addTable() {
    this.shapes.push(new Table(this));
  }

  //

  private fillWidth() {
    return this.canvas.width / this.scale;
  }

  private fillHeight() {
    return this.canvas.height / this.scale;
  }

  private crisp(pixel: number) {
    const halfThickness = this.ctx.lineWidth / 2;
    return this.ctx.lineWidth % 2 ? (Number.isInteger(pixel) ? pixel : Math.round(pixel + halfThickness)) - halfThickness : Math.round(pixel);
  }

  private getPixel(x: number, y: number): [number, number] {
    return [this.left + 20 + x - this.origin[0], 20 + y - this.origin[1]];
  }

  //

  fillRect(x: number, y: number, width: number, height: number, ignoreOrigin?: boolean) {
    if (!ignoreOrigin) {
      [x, y] = this.getPixel(x, y);
    }
    this.ctx.fillRect(this.crisp(x), this.crisp(y), width, height);
  }

  strokeRect(x: number, y: number, width: number, height: number, ignoreOrigin?: boolean) {
    if (!ignoreOrigin) {
      [x, y] = this.getPixel(x, y);
    }
    this.ctx.strokeRect(this.crisp(x), this.crisp(y), width, height);
  }

  moveTo(x: number, y: number, ignoreOrigin?: boolean) {
    if (!ignoreOrigin) {
      [x, y] = this.getPixel(x, y);
    }
    this.ctx.moveTo(this.crisp(x), this.crisp(y));
  }

  lineTo(x: number, y: number, ignoreOrigin?: boolean) {
    if (!ignoreOrigin) {
      [x, y] = this.getPixel(x, y);
    }
    this.ctx.lineTo(this.crisp(x), this.crisp(y));
  }

  fillText(text: string, x: number, y: number, options: { color: string; align: CanvasTextAlign }, ignoreOrigin?: boolean) {
    if (!ignoreOrigin) {
      [x, y] = this.getPixel(x, y);
    }
    const temp = this.ctx.fillStyle;
    if (options.color) {
      this.ctx.fillStyle = options.color;
    }
    if (options.align) {
      this.ctx.textAlign = options.align;
    }
    this.ctx.fillText(text, this.crisp(x), this.crisp(y));
    this.ctx.fillStyle = temp;
  }
}

export default Grid;
