import { GridElement } from 'types';

export const sortElements = (elements: GridElement[]): GridElement[] => {
  const comparator = (a: GridElement, b: GridElement) => {
    if (!a.id && !b.id) {
      const diffY = a.y - b.y;
      if (diffY !== 0) return diffY;
      return a.x - b.x;
    }

    if (!a.id) return 1;
    if (!b.id) return -1;

    return `${a.id}`.localeCompare(`${b.id}`);
  };

  return [...elements].sort(comparator);
};
