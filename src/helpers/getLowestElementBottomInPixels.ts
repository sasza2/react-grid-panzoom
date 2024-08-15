import { GridElement, MeasureElementHeight } from 'types';
import getElementBottomInPixels from './getElementBottomInPixels';

type GetLowestElementBottomInPixels = (props: {
  elements: GridElement[],
  gapVertical: number,
  measureElementHeight: MeasureElementHeight,
  rowHeight: number,
}) => number

const getLowestElementBottomInPixels: GetLowestElementBottomInPixels = ({
  elements,
  gapVertical,
  measureElementHeight,
  rowHeight,
}) => {
  let maxBottom = 0;

  elements.forEach((element) => {
    const currentBottom = getElementBottomInPixels({
      element,
      measureElementHeight,
      rowHeight,
      gapVertical,
    });

    if (currentBottom > maxBottom) {
      maxBottom = currentBottom;
    }
  });

  return maxBottom;
};

export default getLowestElementBottomInPixels;
