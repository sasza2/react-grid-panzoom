import { useCallback } from 'react';

import { GridElement } from 'types';
import measureElementHeightInit from '../measureElementHeightInit';
import { useGrid } from './useGrid';

const useMeasureElementHeight = () => {
  const {
    elements, elementsHeightRef, elementsNodes, panZoomRef, rowHeight,
  } = useGrid();

  const measureElementHeight = useCallback(
    (element: GridElement) => {
      if (elementsHeightRef.current[element.id]) return elementsHeightRef.current[element.id];
      const height = measureElementHeightInit(
        panZoomRef,
        element,
        elementsNodes.current,
        rowHeight,
      );
      elementsHeightRef.current[element.id] = height;
      return height;
    },
    [elements, rowHeight, panZoomRef],
  );

  return measureElementHeight;
};

export default useMeasureElementHeight;
