import { GridElement } from 'types';

const getDisabledValue = (element: GridElement) => !!(element.disabled || element.disabledMove);

export const sortElementsByY = (elements: GridElement[]) => elements.sort((a, b) => {
  const isADisabled = getDisabledValue(a);
  const isBDisabled = getDisabledValue(b);

  if (isADisabled !== isBDisabled) {
    if (isADisabled) return -1;
    return 1;
  }

  if (b.y === a.y) return a.x - b.x;
  return a.y - b.y;
});
