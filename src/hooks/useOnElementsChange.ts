import { useRef } from 'react';

import { Position } from 'types';
import useMeasureElementHeight from './useMeasureElementHeight';
import useUpdateWithPanZoomApi from './useUpdateWithPanZoomApi';
import useCalculateCellPositionByPixels from './useCalculateCellPositionByPixels';
import { useGrid } from './useGrid';

const useOnElementsChange = () => {
  const {
    currentElements,
    cols,
    dragActiveRef,
    elements,
    flushElementsChangeRef,
    hasCollision,
    organizeGridElements,
    panZoomRef,
    rows,
    selectedElements,
  } = useGrid();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const lastRef = useRef<() => void>();

  const calculateCellPositionByPixels = useCalculateCellPositionByPixels();
  const measureElementHeight = useMeasureElementHeight();
  const updateWithPanZoomApi = useUpdateWithPanZoomApi();

  const onElementsUpdate = (elementsPositions: Record<string, Position> = {}) => {
    // a drag is in progress; the safety net will revert it if no commit follows
    dragActiveRef.current = true;

    const nextElements = organizeGridElements({
      startingElements: elements,
      cols,
      rows,
      measureElementHeight,
      selectedElements,
    });

    hasCollision.current = nextElements.length !== elements.length;

    nextElements.forEach((element) => {
      if (!elementsPositions[element.id]) updateWithPanZoomApi(element);
    });

    if (!hasCollision.current) currentElements.current = nextElements;
  };

  const onElementsChange = (elementsPositions: Record<string, Position>) => {
    currentElements.current.forEach((element) => {
      const position = elementsPositions[element.id];
      if (!position) return;

      const { x, y } = calculateCellPositionByPixels(position.x, position.y);
      element.x = x;
      element.y = y;
    });

    onElementsUpdate(elementsPositions);
  };

  const onElementsChangeThrottle = (elementsPositions: Record<string, Position>) => {
    // mark the drag as active immediately (even while throttled) so the safety
    // net can revert it if react-panzoom cancels the drag without a mouseup
    dragActiveRef.current = true;

    if (timerRef.current) {
      lastRef.current = () => onElementsChange(elementsPositions);
      return;
    }

    lastRef.current = () => onElementsChange(elementsPositions);

    timerRef.current = setTimeout(() => {
      if (lastRef.current) lastRef.current();
      lastRef.current = null;
      timerRef.current = null;
    }, 250);
  };

  // let the mouse-up handler process the final position immediately, so a very
  // fast drag+release commits its exact drop spot instead of a throttled/stale
  // one. We read the live positions straight from panzoom (not the last
  // throttled snapshot) so nothing lags behind the cursor.
  flushElementsChangeRef.current = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    lastRef.current = null;

    const live = panZoomRef.current && panZoomRef.current.getElements();
    if (!live) return;

    const positions: Record<string, Position> = {};
    Object.keys(live).forEach((id) => { positions[id] = live[id].position; });
    onElementsChange(positions);
  };

  return onElementsChangeThrottle;
};

export default useOnElementsChange;
