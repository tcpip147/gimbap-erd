import Grid from '@/canvas/grid';

class Shape {
  static HIDDEN_POSITION = -99999;

  grid: Grid;
  zIndex: number = 0;
  children: Shape[] = [];

  constructor(grid: Grid) {
    this.grid = grid;
    this.init();
  }

  init() {}

  paint() {}
}

export default Shape;
