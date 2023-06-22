import { GridElement, MeasureElementHeight } from 'types';
import { ROWS_MIN_COUNT_WHEN_AUTO } from '@/consts';
import { isLengthAuto } from './isLengthAuto';

type GetInternalRows = (props: {
  elements: GridElement[],
  measureElementHeight: MeasureElementHeight,
  rows: 'auto' | number,
}) => number

const getInternalRows: GetInternalRows = ({
  elements,
  measureElementHeight,
  rows,
}) => {
  if (!isLengthAuto(rows)) return rows;

  let lastY = 1;
  elements.forEach((element) => {
    const currentMaxY = element.y + measureElementHeight(element);
    if (currentMaxY > lastY) lastY = currentMaxY;
  });

  lastY *= 2;

  return Math.max(lastY, ROWS_MIN_COUNT_WHEN_AUTO);
};

export default getInternalRows;
