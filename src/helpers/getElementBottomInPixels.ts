import { GridElement } from 'types';

type GetBottomInPixels = (props: {
  element: GridElement,
  measureElementHeight: (element: GridElement) => number,
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
  const heightInPixels = Math.ceil(
    measureElementHeight(element) / (rowHeight + gapVertical),
  ) * (rowHeight + gapVertical);
  return Math.ceil(topInPixels + heightInPixels) - gapVertical;
};

export default getElementBottomInPixels;
