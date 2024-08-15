import { GridElement, MeasureElementHeight } from 'types';

type GetBottomInPixels = (props: {
  element: GridElement,
  measureElementHeight: MeasureElementHeight,
  rowHeight: number,
  gapVertical: number,
}) => number

const getElementBottomInPixels: GetBottomInPixels = ({
  element,
  measureElementHeight,
  rowHeight,
  gapVertical,
}): number => {
  const topInPixels = element.y * (rowHeight + gapVertical);
  const heightInPixels = Math.ceil(measureElementHeight(element) * (rowHeight + gapVertical));
  return Math.ceil(topInPixels + heightInPixels) - gapVertical;
};

export default getElementBottomInPixels;
