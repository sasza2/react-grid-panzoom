import { useMemo } from 'react';

import { sortElements } from '@/helpers/sortElements';
import { useGrid } from './useGrid';

export const useSortedElements = () => {
  const { elements } = useGrid();

  const sortedElements = useMemo(() => sortElements(elements), [elements]);

  return sortedElements;
};
