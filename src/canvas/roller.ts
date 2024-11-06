import Grid, { GridState } from '@/canvas/grid';
import Shape, { ShapeType } from '@/canvas/shape';

class Roller extends Shape {
  zIndex: number = 100;
  originX = 0;
  originY = 0;
  gridSize;
  thickness = 20;
  paddingLeft = 0;
  width = 0;
  height = 0;

  constructor(grid: Grid) {
    super(grid, ShapeType.ROLLER);
    this.gridSize = grid.gridSize;

    let isMousedown = false;
    let mouseInfo = {
      originX: 0,
      originY: 0,
      x: 0,
      y: 0,
    };

    window.addEventListener('mousedown', (e) => {
      if (e.target == grid.canvasEl) {
        if (grid.state == GridState.IDLE) {
          isMousedown = true;
          mouseInfo.originX = grid.roller.originX;
          mouseInfo.originY = grid.roller.originY;
          mouseInfo.x = e.clientX;
          mouseInfo.y = e.clientY;
        }
      }
    });
    window.addEventListener('mousemove', (e) => {
      if (isMousedown) {
        const diffX = mouseInfo.x - e.clientX;
        const diffY = mouseInfo.y - e.clientY;
        let originX = mouseInfo.originX + diffX;
        if (originX < 0) {
          originX = 0;
        }
        let originY = mouseInfo.originY + diffY;
        if (originY < 0) {
          originY = 0;
        }
        grid.roller.originX = originX;
        grid.roller.originY = originY;
        grid.redraw();
      }
    });
    window.addEventListener('mouseup', (e) => {
      if (isMousedown) {
        isMousedown = false;
        mouseInfo.originX = 0;
        mouseInfo.originY = 0;
        mouseInfo.x = 0;
        mouseInfo.y = 0;
      }
    });
    window.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.target == grid.canvasEl) {
          if (grid.state == GridState.IDLE) {
            if (e.ctrlKey) {
              let x;
              if (e.deltaY > 0) {
                x = grid.roller.originX + 100;
              } else {
                x = grid.roller.originX - 100;
                if (x < 0) {
                  x = 0;
                }
              }
              grid.roller.originX = x;
            } else {
              let y;
              if (e.deltaY > 0) {
                y = grid.roller.originY + 100;
              } else {
                y = grid.roller.originY - 100;
                if (y < 0) {
                  y = 0;
                }
              }
              grid.roller.originY = y;
            }
            grid.redraw();
          }
        }
      },
      { passive: false },
    );
  }

  paint(): void {
    if (this.isVisible) {
      const ctx = this.grid.ctx;

      ctx.fillStyle = '#212122';
      ctx.strokeStyle = '#404040';
      ctx.font = 'normal 11px "Malgun Gothic"';

      const maximumY = Math.round((ctx.canvas.height + this.originY) / this.gridSize).toString().length;
      this.paddingLeft = 5 + maximumY * 5;
      this.width = this.thickness + this.paddingLeft;
      this.height = this.thickness;

      this.fillRect(0, 0, ctx.canvas.width, this.thickness);
      this.fillRect(0, 0, this.thickness + this.paddingLeft, ctx.canvas.height);

      ctx.beginPath();
      const longMeter = this.thickness - 10;
      const shortMeter = this.thickness - 5;
      for (let i = 1; i < (ctx.canvas.width + this.originX) / this.gridSize; i++) {
        if (i % 5 == 0) {
          this.moveTo(i * this.gridSize + this.paddingLeft - this.originX + this.thickness, shortMeter);
          this.fillText(i.toString(), i * this.gridSize + this.paddingLeft - this.originX + this.thickness, this.thickness - 8, { color: '#999', align: 'center' });
        } else {
          this.moveTo(i * this.gridSize + this.paddingLeft - this.originX + this.thickness, longMeter);
        }
        this.lineTo(i * this.gridSize + this.paddingLeft - this.originX + this.thickness, this.thickness);
      }
      for (let i = 1; i < (ctx.canvas.height + this.originY) / this.gridSize; i++) {
        if (i % 5 == 0) {
          this.fillText(i.toString(), longMeter + this.paddingLeft, i * this.gridSize + 3 - this.originY + this.thickness, { color: '#999', align: 'right' });
          this.moveTo(shortMeter + this.paddingLeft, i * this.gridSize - this.originY + this.thickness);
        } else {
          this.moveTo(longMeter + this.paddingLeft, i * this.gridSize - this.originY + this.thickness);
        }
        this.lineTo(this.thickness + this.paddingLeft, i * this.gridSize - this.originY + this.thickness);
      }
      this.moveTo(this.thickness + this.paddingLeft, 0);
      this.lineTo(this.thickness + this.paddingLeft, ctx.canvas.height);
      this.moveTo(0, this.thickness);
      this.lineTo(ctx.canvas.width, this.thickness);
      ctx.stroke();
      this.fillRect(0, 0, this.thickness + this.paddingLeft, this.thickness);
    }
  }
}

export default Roller;
