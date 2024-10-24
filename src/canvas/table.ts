import Shape from '@/canvas/shape';

class Table extends Shape {
  isGhost: boolean = false;
  x: number = Shape.HIDDEN_POSITION;
  y: number = Shape.HIDDEN_POSITION;
  width: number = 0;
  height: number = 0;

  init(): void {}

  paint(): void {
    if (this.isGhost) {

    }
  }
}

export default Table;
