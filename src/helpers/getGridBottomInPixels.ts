import { GridElement, MeasureElementHeight } from 'types';
import { GRID_HEIGHT_MULTIPLIER_WHEN_AUTO, GRID_MIN_HEIGHT_WHEN_AUTO } from '@/consts';
import getElementBottomInPixels from './getElementBottomInPixels';
import { isLengthAuto } from './isLengthAuto';

type GetGridBottomInPixels = (props: {
  elements: GridElement[],
  gapVertical: number,
  measureElementHeight: MeasureElementHeight,
  rows: 'auto' | number,
  rowHeight: number,
}) => number

const getGridBottomInPixels: GetGridBottomInPixels = ({
  elements,
  gapVertical,
  measureElementHeight,
  rows,
  rowHeight,
}) => {
  if (!isLengthAuto(rows)) return rows * (rowHeight + gapVertical) - gapVertical;

  let maxBottom = GRID_MIN_HEIGHT_WHEN_AUTO;

  elements.forEach((element) => {
    const currentBottom = getElementBottomInPixels({
      element,
      measureElementHeight,
      rowHeight,
      gapVertical,
    }) * GRID_HEIGHT_MULTIPLIER_WHEN_AUTO;

    if (currentBottom > maxBottom) {
      maxBottom = currentBottom;
    }
  });

  return maxBottom;
};

export default getGridBottomInPixels;
