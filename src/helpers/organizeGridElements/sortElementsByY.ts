import { GridElement } from 'types';

export const sortElementsByY = (elements: GridElement[]) => elements.sort((a, b) => {
  const isADisabled = a.disabled || a.disabledMove;
  const isBDisabled = b.disabled || b.disabledMove;

  if (isADisabled !== isBDisabled) {
    if (isADisabled) return -1;
    return 1;
  }

  if (b.y === a.y) return a.x - b.x;
  return a.y - b.y;
});
