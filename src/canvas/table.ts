import Shape from '@/canvas/shape';

class Table extends Shape {
  init(): void {
    console.log('AA');
  }

  paint(): void {
    this.grid?.strokeRect(40, 40, 100, 100);
  }
}

export default Table;
