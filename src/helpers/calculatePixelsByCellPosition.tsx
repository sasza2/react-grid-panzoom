import { GridElement, Pixels } from 'types';
import { isLengthAuto } from './isLengthAuto';

type Position = {
  x: Pixels,
  y: Pixels,
}

const cellPositionWhenStillLoadingWith = (y: number): Position => ({ x: 0, y });

const calculatePixelsByCellPosition = (
  element: GridElement,
  {
    gapHorizontal = 0,
    gapVertical = 0,
    paddingLeft = 0,
    paddingTop = 0,
    rowHeight,
    colWidth,
  }: {
    gapHorizontal?: Pixels,
    gapVertical?: Pixels,
    paddingLeft?: Pixels,
    paddingTop?: Pixels,
    rowHeight: Pixels,
    colWidth: Pixels | 'auto'
},
): Position => {
  const y = element.y * rowHeight + element.y * gapVertical + paddingTop;
  if (isLengthAuto(colWidth)) return cellPositionWhenStillLoadingWith(y);
  return {
    y,
    x: element.x * colWidth + element.x * gapHorizontal + paddingLeft,
  };
};

export default calculatePixelsByCellPosition;
