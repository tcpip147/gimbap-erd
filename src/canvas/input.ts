import Grid, { GridState } from '@/canvas/grid';
import Shape, { ShapeType } from '@/canvas/shape';

interface Selection {
  selectionStart: number;
  selectionEnd: number;
}

class CanvasInput extends Shape {
  static inputText: HTMLInputElement = document.createElement('input');
  static compositionEvents: CompositionEvent[] = [];
  static clipboard: string;
  static selected: CanvasInput | null;
  static {
    CanvasInput.inputText.style.cssText = `
        width: 0;
        height: 0;
        opacity: 0;
        position: absolute;
    `;
    CanvasInput.inputText.addEventListener('compositionstart', (e: CompositionEvent) => {
      CanvasInput.compositionEvents.push(e);
    });
    CanvasInput.inputText.addEventListener('compositionupdate', (e: CompositionEvent) => {
      CanvasInput.compositionEvents.push(e);
    });
    CanvasInput.inputText.addEventListener('compositionend', (e: CompositionEvent) => {
      CanvasInput.compositionEvents.push(e);
    });
    CanvasInput.inputText.addEventListener('paste', (e) => {
      CanvasInput.clipboard = e.clipboardData!.getData('text');
    });
    CanvasInput.inputText.addEventListener('copy', (e) => {
      const min = Math.min(CanvasInput.selected!.selection.selectionStart, CanvasInput.selected!.selection.selectionEnd);
      const max = Math.max(CanvasInput.selected!.selection.selectionStart, CanvasInput.selected!.selection.selectionEnd);
      if (min != max) {
        e.clipboardData?.setData('text', CanvasInput.selected!.value.substring(min, max));
      }
      e.preventDefault();
    });
    CanvasInput.inputText.addEventListener('cut', (e) => {
      const min = Math.min(CanvasInput.selected!.selection.selectionStart, CanvasInput.selected!.selection.selectionEnd);
      const max = Math.max(CanvasInput.selected!.selection.selectionStart, CanvasInput.selected!.selection.selectionEnd);
      if (min != max) {
        e.clipboardData?.setData('text', CanvasInput.selected!.value.substring(min, max));
        CanvasInput.selected!.typeString('');
      }
      e.preventDefault();
    });
    document.body.append(CanvasInput.inputText);
  }

  grid: Grid;
  ctx: CanvasRenderingContext2D;
  width: number = 100;
  minWidth: number = 100;
  height: number = 14;
  font: string = '12px "Malgun Gothic"';
  border: string | null = null;
  value: string = '';
  paddingTop: number = 2;
  paddingRight: number = 5;
  paddingBottom: number = 2;
  paddingLeft: number = 5;
  align: CanvasTextAlign = 'left';

  private isFocused: boolean = false;
  private isShowCursor: boolean = false;
  private selection: Selection;
  private isVisibleUnderCursor: boolean = false;
  private cursorInterval;
  private cursorIntervalRef;
  private onMouseDownHandlerRef;
  private onMouseMoveHandlerRef;
  private onMouseUpHandlerRef;
  private onKeyDownHandlerRef;
  private isMouseDown: boolean = false;
  private prevValue: string = '';

  constructor(grid: Grid) {
    super(grid, ShapeType.INPUT);
    this.grid = grid;
    this.ctx = grid.ctx;
    this.selection = {
      selectionStart: 0,
      selectionEnd: 0,
    };

    this.cursorInterval = () => {
      if (this.isFocused) {
        this.isShowCursor = !this.isShowCursor;
        this.grid.redraw();
      }
    };
    this.cursorIntervalRef = setInterval(this.cursorInterval, 600);

    this.onMouseDownHandlerRef = this.onMouseDownHandler.bind(this);
    window.addEventListener('mousedown', this.onMouseDownHandlerRef);
    this.onMouseMoveHandlerRef = this.onMouseMoveHandler.bind(this);
    window.addEventListener('mousemove', this.onMouseMoveHandlerRef);
    this.onMouseUpHandlerRef = this.onMouseUpHandler.bind(this);
    window.addEventListener('mouseup', this.onMouseUpHandlerRef);
    this.onKeyDownHandlerRef = this.onKeyDownHandler.bind(this);
    window.addEventListener('keydown', this.onKeyDownHandlerRef);
  }

  draw(x: number, y: number, isRelative: boolean) {
    this.x = x;
    this.y = y;
    this.isRelative = isRelative;
    this.render();
  }

  hasFocus() {
    return this.isFocused;
  }

  dispose() {
    window.removeEventListener('mousedown', this.onMouseDownHandlerRef);
    window.removeEventListener('mousemove', this.onMouseMoveHandlerRef);
    window.removeEventListener('mouseup', this.onMouseUpHandlerRef);
    window.removeEventListener('keydown', this.onKeyDownHandlerRef);
    clearInterval(this.cursorIntervalRef);
  }

  setFocus() {
    CanvasInput.selected = this;
    CanvasInput.inputText.focus();
    CanvasInput.inputText.value = '';
    this.isFocused = true;
    this.isVisibleUnderCursor = false;
    this.grid.state = GridState.TEXT_EDITING;
    this.resetCursorInterval();
  }

  setPadding(padding: number[]) {
    this.paddingTop = padding[0];
    this.paddingRight = padding[1];
    this.paddingBottom = padding[2];
    this.paddingLeft = padding[3];
  }

  setAlign(align: CanvasTextAlign) {
    this.align = align;
  }

  //

  private render() {
    this.ctx.font = this.font;
    if (this.value != this.prevValue) {
      this.prevValue = this.value;
      this.grid.redraw();
      return;
    }
    this.calculateWidth();
    if (this.isFocused) {
      this.ctx.strokeStyle = '#000000';
      this.ctx.fillStyle = '#ffffff';

      let x = this.x;
      let tx = this.x + this.paddingLeft;
      if (this.align == 'right') {
        x = this.x - this.width - this.paddingLeft - this.paddingRight;
        tx = this.x - this.paddingRight;
      }
      this.fillRect(x, this.y, this.paddingLeft + this.width + this.paddingRight, this.paddingTop + this.height + this.paddingBottom, this.isRelative);
      this.strokeRect(x, this.y, this.paddingLeft + this.width + this.paddingRight, this.paddingTop + this.height + this.paddingBottom, this.isRelative);
      this.fillText(this.value, tx, this.y + this.paddingTop + 10, { color: '#000000', align: this.align }, this.isRelative);
      if (this.isShowCursor && this.selection.selectionStart == this.selection.selectionEnd) {
        this.drawCursor();
      }
      if (this.selection.selectionStart != this.selection.selectionEnd) {
        this.drawSelection();
      }
      if (this.isVisibleUnderCursor) {
        this.drawUnderCursor();
      }
    } else {
      let tx = this.x + this.paddingLeft;
      if (this.align == 'right') {
        tx = this.x - this.paddingRight;
      }
      this.fillText(this.value, tx, this.y + this.paddingTop + 10, { color: '#ffffff', align: this.align }, this.isRelative);
    }
  }

  //

  private calculateWidth() {
    let width = 0;
    for (let i = 0; i < this.value.length; i++) {
      const ch = this.value[i];
      width += this.ctx.measureText(ch).width;
    }
    this.width = Math.round(Math.max(this.minWidth, width));
  }

  private getOffset(s: number) {
    let offset = 0;
    if (this.align == 'left') {
      const substr = this.value.substring(0, s);
      for (let i = 0; i < substr.length; i++) {
        const ch = substr[i];
        offset += this.ctx.measureText(ch).width;
      }
    } else if (this.align == 'right') {
      const substr = this.value.substring(s);
      for (let i = 0; i < substr.length; i++) {
        const ch = substr[i];
        offset += this.ctx.measureText(ch).width;
      }
    }
    return offset;
  }

  private drawSelection() {
    let x1 = this.x + this.paddingLeft + this.getOffset(this.selection.selectionStart);
    let x2 = this.x + this.paddingLeft + this.getOffset(this.selection.selectionEnd);
    let min = Math.min(x1, x2);
    let max = Math.max(x1, x2);
    if (this.align == 'right') {
      x1 = this.x - this.paddingRight - this.getOffset(this.selection.selectionStart);
      x2 = this.x - this.paddingRight - this.getOffset(this.selection.selectionEnd);
      min = Math.max(x1, x2);
      max = Math.min(x1, x2);
    }
    this.ctx.fillStyle = '#254a8d';
    this.fillRect(min, this.y + this.paddingTop, max - min, this.height, this.isRelative);
    const start = Math.min(this.selection.selectionStart, this.selection.selectionEnd);
    const end = Math.max(this.selection.selectionStart, this.selection.selectionEnd);
    this.ctx.font = this.font;
    this.fillText(this.value.substring(start, end), min, this.y + 10 + this.paddingTop, { color: '#ffffff' }, this.isRelative);
  }

  private drawUnderCursor() {
    let x1 = this.x + this.paddingLeft + this.getOffset(this.selection.selectionEnd - 1);
    let x2 = this.x + this.paddingLeft + this.getOffset(this.selection.selectionEnd);
    if (this.align == 'right') {
      x1 = this.x - this.paddingRight - this.getOffset(this.selection.selectionEnd - 1);
      x2 = this.x - this.paddingRight - this.getOffset(this.selection.selectionEnd);
    }
    this.ctx.strokeStyle = '#000000';
    this.strokeLine(x1 + 1, this.y + this.paddingTop + this.height, x2 - 1, this.y + this.paddingTop + this.height, this.isRelative);
  }

  private drawCursor() {
    let x = this.x + this.paddingLeft + this.getOffset(this.selection.selectionEnd);
    this.ctx.strokeStyle = '#000000';
    if (this.align == 'right') {
      x = this.x - this.paddingRight - this.getOffset(this.selection.selectionEnd);
    }
    this.strokeLine(x, this.y + this.paddingTop, x, this.y + this.paddingTop + this.height, this.isRelative);
  }

  private inBounded(x: number, y: number): boolean {
    [x, y] = this.toRelative(x, y);
    let inBounded = x > this.x && x < this.x + this.paddingLeft + this.width + this.paddingRight && y > this.y && y < this.y + this.paddingTop + this.height + this.paddingBottom;
    if (this.align == 'right') {
      inBounded = x > this.x - this.width - this.paddingLeft - this.paddingRight && x < this.x && y > this.y && y < this.y + this.paddingTop + this.height + this.paddingBottom;
    }
    return inBounded;
  }

  private resetCursorInterval() {
    clearInterval(this.cursorIntervalRef);
    this.isShowCursor = true;
    this.cursorIntervalRef = setInterval(this.cursorInterval, 600);
    this.grid.redraw();
  }

  private setSelectionByMouse(e: MouseEvent) {
    let offsets = [0];
    let current = 0;
    let twidth = 0;
    if (this.align == 'right') {
      twidth = this.ctx.measureText(this.value).width;
    }
    for (let i = 0; i < this.value.length; i++) {
      const ch = this.value[i];
      this.ctx.font = this.font;
      const width = this.ctx.measureText(ch).width;
      offsets.push(current + width / 2 - twidth);
      current += width;
    }

    const [offsetX] = this.toRelative(e.offsetX, e.offsetY);
    let x = offsetX - this.x - this.paddingLeft;
    let result = -1;
    for (let i = 1; i < offsets.length; i++) {
      if (x >= offsets[i - 1] && x < offsets[i]) {
        result = i - 1;
      }
    }
    if (result == -1) {
      result = this.value.length;
    }
    if (!this.isMouseDown) {
      this.selection.selectionStart = result;
    }
    if (!e.shiftKey || this.isMouseDown) {
      this.selection.selectionEnd = result;
    }
  }

  private onMouseDownHandler(e: MouseEvent) {
    if (!this.isFocused) {
      this.selection.selectionStart = 0;
      this.selection.selectionEnd = 0;
    }
    CanvasInput.selected = null;
    this.isFocused = false;
    if (e.target == this.ctx.canvas) {
      if (this.inBounded(e.offsetX, e.offsetY)) {
        setTimeout(() => {
          this.setSelectionByMouse(e);
          this.setFocus();
          this.isMouseDown = true;
          this.grid.redraw();
        }, 1);
      }
    }
  }

  private onMouseMoveHandler(e: MouseEvent) {
    if (e.target == this.ctx.canvas) {
      if (this.isMouseDown) {
        this.setSelectionByMouse(e);
        this.setFocus();
      }
    }
  }

  private onMouseUpHandler(e: MouseEvent) {
    if (e.target == this.ctx.canvas) {
      this.isMouseDown = false;
    }
  }

  private onKeyDownHandler(e: KeyboardEvent) {
    if (this.isFocused) {
      CanvasInput.inputText.focus();
      CanvasInput.compositionEvents.length = 0;
      setTimeout(() => {
        if (CanvasInput.compositionEvents.length == 0) {
          this.handleNoCompositionEvent(e);
          this.isVisibleUnderCursor = false;
        } else {
          CanvasInput.compositionEvents.forEach((e) => {
            if (e.type == 'compositionstart') {
              this.typeString(' ');
            } else if (e.type == 'compositionupdate') {
              this.value = this.value.substring(0, this.selection.selectionStart - 1) + e.data + this.value.substring(this.selection.selectionEnd);
              if (e.data == '') {
                this.selection.selectionStart--;
                this.selection.selectionEnd--;
              }
              this.isVisibleUnderCursor = true;
              this.render();
            } else {
              this.isVisibleUnderCursor = false;
              this.render();
            }
          });
        }
      }, 1);
    }
  }

  private typeString(str: string) {
    if (this.selection.selectionStart == this.selection.selectionEnd) {
      this.value = this.value.substring(0, this.selection.selectionStart) + str + this.value.substring(this.selection.selectionEnd);
      this.selection.selectionStart += str.length;
      this.selection.selectionEnd += str.length;
    } else if (this.selection.selectionStart < this.selection.selectionEnd) {
      this.value = this.value.substring(0, this.selection.selectionStart) + str + this.value.substring(this.selection.selectionEnd);
      this.selection.selectionStart += str.length;
      this.selection.selectionEnd = this.selection.selectionStart;
    } else {
      this.value = this.value.substring(0, this.selection.selectionEnd) + str + this.value.substring(this.selection.selectionStart);
      this.selection.selectionEnd += str.length;
      this.selection.selectionStart = this.selection.selectionEnd;
    }
  }

  private handleNoCompositionEvent(e: KeyboardEvent) {
    let end;
    switch (e.key) {
      case 'ArrowRight':
        if (this.selection.selectionStart == this.selection.selectionEnd || e.shiftKey) {
          end = this.selection.selectionEnd + 1;
          if (end > this.value.length) {
            end = this.value.length;
          }
          this.selection.selectionEnd = end;
          if (!e.shiftKey) {
            this.selection.selectionStart = end;
          }
        } else {
          if (this.selection.selectionStart < this.selection.selectionEnd) {
            end = this.selection.selectionEnd;
          } else {
            end = this.selection.selectionStart;
          }
          this.selection.selectionStart = end;
          this.selection.selectionEnd = end;
        }
        this.resetCursorInterval();
        break;
      case 'ArrowLeft':
        if (this.selection.selectionStart == this.selection.selectionEnd || e.shiftKey) {
          end = this.selection.selectionEnd - 1;
          if (end < 0) {
            end = 0;
          }
          this.selection.selectionEnd = end;
          if (!e.shiftKey) {
            this.selection.selectionStart = end;
          }
        } else {
          if (this.selection.selectionStart < this.selection.selectionEnd) {
            end = this.selection.selectionStart;
          } else {
            end = this.selection.selectionEnd;
          }
          this.selection.selectionStart = end;
          this.selection.selectionEnd = end;
        }
        this.resetCursorInterval();
        break;
      case 'End':
        this.selection.selectionEnd = this.value.length;
        if (!e.shiftKey) {
          this.selection.selectionStart = this.value.length;
        }
        this.resetCursorInterval();
        break;
      case 'Home':
        this.selection.selectionEnd = 0;
        if (!e.shiftKey) {
          this.selection.selectionStart = 0;
        }
        this.resetCursorInterval();
        break;
      case 'Delete':
        if (this.selection.selectionStart == this.selection.selectionEnd) {
          this.value = this.value.substring(0, this.selection.selectionStart) + this.value.substring(this.selection.selectionEnd + 1);
        } else if (this.selection.selectionStart < this.selection.selectionEnd) {
          this.value = this.value.substring(0, this.selection.selectionStart) + this.value.substring(this.selection.selectionEnd);
          this.selection.selectionEnd = this.selection.selectionStart;
        } else {
          this.value = this.value.substring(0, this.selection.selectionEnd) + this.value.substring(this.selection.selectionStart);
          this.selection.selectionStart = this.selection.selectionEnd;
        }
        break;
      case 'Backspace':
        if (this.selection.selectionStart == this.selection.selectionEnd) {
          this.value = this.value.substring(0, this.selection.selectionStart - 1) + this.value.substring(this.selection.selectionEnd);
          if (this.selection.selectionEnd > 0) {
            this.selection.selectionEnd--;
            this.selection.selectionStart--;
          }
        } else if (this.selection.selectionStart < this.selection.selectionEnd) {
          this.value = this.value.substring(0, this.selection.selectionStart) + this.value.substring(this.selection.selectionEnd);
          this.selection.selectionEnd = this.selection.selectionStart;
        } else {
          this.value = this.value.substring(0, this.selection.selectionEnd) + this.value.substring(this.selection.selectionStart);
          this.selection.selectionStart = this.selection.selectionEnd;
        }
        break;
      case 'Tab':
        e.preventDefault();
        break;
      case '`':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
      case '0':
      case '-':
      case '=':
      case '~':
      case '!':
      case '@':
      case '#':
      case '$':
      case '%':
      case '^':
      case '&':
      case '*':
      case '(':
      case ')':
      case '_':
      case '+':
      case 'q':
      case 'w':
      case 'e':
      case 'r':
      case 't':
      case 'y':
      case 'u':
      case 'i':
      case 'o':
      case 'p':
      case '[':
      case ']':
      case '\\':
      case 'Q':
      case 'W':
      case 'E':
      case 'R':
      case 'T':
      case 'Y':
      case 'U':
      case 'I':
      case 'O':
      case 'P':
      case '{':
      case '}':
      case '|':
      case 's':
      case 'd':
      case 'f':
      case 'g':
      case 'h':
      case 'j':
      case 'k':
      case 'l':
      case ';':
      case "'":
      case 'S':
      case 'D':
      case 'F':
      case 'G':
      case 'H':
      case 'J':
      case 'K':
      case 'L':
      case ':':
      case '"':
      case 'z':
      case 'b':
      case 'n':
      case 'm':
      case ',':
      case '.':
      case '/':
      case 'Z':
      case 'B':
      case 'N':
      case 'M':
      case '<':
      case '>':
      case '?':
      case ' ':
        this.typeString(e.key);
        break;
      case 'a':
      case 'A':
        if (e.ctrlKey) {
          this.selection.selectionStart = 0;
          this.selection.selectionEnd = this.value.length;
        } else {
          this.typeString(e.key);
        }
        break;
      case 'v':
      case 'V':
        if (e.ctrlKey) {
          this.typeString(CanvasInput.clipboard);
        } else {
          this.typeString(e.key);
        }
        break;
      case 'c':
      case 'C':
        if (!e.ctrlKey) {
          this.typeString(e.key);
        }
        break;
      case 'x':
      case 'X':
        if (!e.ctrlKey) {
          this.typeString(e.key);
        }
        break;
      default:
    }
    this.render();
  }
}

export { CanvasInput };
