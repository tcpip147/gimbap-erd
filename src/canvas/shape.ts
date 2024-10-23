import Grid from '@/canvas/grid';

class Shape {
  zIndex: number;
  grid: Grid;

  constructor(grid: Grid) {
    this.grid = grid;
    this.zIndex = 0;
    this.init();
  }

  init() {}

  paint() {}
}

export default Shape;
