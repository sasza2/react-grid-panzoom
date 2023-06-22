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
    elements,
    hasCollision,
    organizeGridElements,
    rows,
    selectedElements,
  } = useGrid();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const lastRef = useRef<() => void>();

  const calculateCellPositionByPixels = useCalculateCellPositionByPixels();
  const measureElementHeight = useMeasureElementHeight();
  const updateWithPanZoomApi = useUpdateWithPanZoomApi();

  const onElementsUpdate = (elementsPositions: Record<string, Position> = {}) => {
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

  return onElementsChangeThrottle;
};

export default useOnElementsChange;
