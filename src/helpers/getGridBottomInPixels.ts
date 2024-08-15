import { GridElement, MeasureElementHeight } from 'types';
import { GRID_HEIGHT_MULTIPLIER_WHEN_AUTO, GRID_MIN_HEIGHT_WHEN_AUTO } from '@/consts';
import { isLengthAuto } from './isLengthAuto';
import getLowestElementBottomInPixels from './getLowestElementBottomInPixels';

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

  const lowestElementBottomInPixels = getLowestElementBottomInPixels({
    elements,
    gapVertical,
    measureElementHeight,
    rowHeight,
  }) * GRID_HEIGHT_MULTIPLIER_WHEN_AUTO;

  return Math.max(GRID_MIN_HEIGHT_WHEN_AUTO, lowestElementBottomInPixels);
};

export default getGridBottomInPixels;
