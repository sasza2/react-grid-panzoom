import { GridElement, MeasureElementHeight } from 'types';

export const loopInMap = (
  element: GridElement,
  offsetX: number,
  offsetY: number,
  callback: (x: number, y: number, startX: number, startY: number) => void,
  measureElementHeight: MeasureElementHeight,
) => {
  const startX = element.x + offsetX;
  const startY = element.y + offsetY;
  for (let x = startX; x < element.x + element.w + offsetX; x++) {
    for (let y = startY; y < element.y + measureElementHeight(element) + offsetY; y++) {
      callback(x, y, startX, startY);
    }
  }
};
