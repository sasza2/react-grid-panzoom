import { useMemo } from 'react';

import { sortElements } from '@/helpers/sortElements';
import { useGrid } from './useGrid';
import useMeasureElementHeight from './useMeasureElementHeight';
import useMemoRef from './useMemoRef';

export const useElementsChecksum = () => {
  const { elements } = useGrid();
  const measureElementHeight = useMeasureElementHeight();
  const measureElementHeightMemo = useMemoRef(measureElementHeight);

  return useMemo(() => {
    const sortedElements = sortElements(elements);
    return sortedElements.reduce((checksum, element) => `${checksum}--${element.id}-${measureElementHeightMemo(element)}`, '');
  }, [elements]);
};
