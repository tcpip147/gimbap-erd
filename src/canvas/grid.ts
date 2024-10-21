import { FileType } from '@/explorers/file-explorer';

class Grid {
  canvasContainer: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  file: FileType;
  scale: number;

  constructor(canvasContainerEl: HTMLElement, file: FileType) {
    this.canvasContainer = canvasContainerEl;
    this.canvas = canvasContainerEl.querySelector('.canvas')!;
    this.ctx = this.canvas.getContext('2d')!;
    this.file = file;
    this.scale = file.data?.scale ? file.data.scale : 1.0;
  }

  fitToSize() {
    const rect = this.canvasContainer.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  redraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawHorizontalRoller();
  }

  drawHorizontalRoller() {
    this.ctx.fillStyle = '#cccccc';
    this.ctx.strokeStyle = '#000000';
    this.fillRect(0, 0, this.canvas.width, 30);
    this.ctx.beginPath();
    for (let i = 0; i < 100; i++) {
      this.moveTo(i * 10, 0);
      this.lineTo(i * 10, 30);
    }
    this.ctx.stroke();
  }

  //

  fillRect(x: number, y: number, width: number, height: number) {
    this.ctx.fillRect(x + 0.5, y + 0.5, width * this.scale, height * this.scale);
  }

  moveTo(x: number, y: number) {
    this.ctx.moveTo(x + 0.5, y + 0.5);
  }

  lineTo(x: number, y: number) {
    this.ctx.lineTo(x + 0.5, y + 0.5);
  }
}

export default Grid;
