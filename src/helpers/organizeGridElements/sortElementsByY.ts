import { GridElement } from 'types';

export const sortElementsByY = (elements: GridElement[]) => elements.sort((a, b) => {
  if (b.y === a.y) return a.x - b.x;
  return a.y - b.y;
});
