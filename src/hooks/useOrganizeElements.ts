import { useCallback, useRef } from 'react';

import { GridElement, OrganizeElementsOptions } from 'types';
import calculatePixelsByCellPosition from '@/helpers/calculatePixelsByCellPosition';
import useMeasureElementHeight from './useMeasureElementHeight';
import useCalculateCellPositionByPixels from './useCalculateCellPositionByPixels';
import { useGrid } from './useGrid';

const useOrganizeElements = () => {
  const {
    cols,
    colWidth,
    elements,
    elementsHeightRef,
    gapHorizontal,
    gapVertical,
    hasCollision,
    organizeGridElements,
    panZoomRef,
    paddingLeft,
    rows,
    rowHeight,
    setElements,
  } = useGrid();

  const calculateCellPositionByPixels = useCalculateCellPositionByPixels();
  const measureElementHeight = useMeasureElementHeight();
  const elementsRef = useRef<typeof elements>();
  elementsRef.current = elements;

  const onOrganizeElements = useCallback((
    selectedElements: GridElement[] = [],
    options: OrganizeElementsOptions = {},
  ): GridElement[] => {
    elementsHeightRef.current = {};
    const panZoomElementsRef = panZoomRef.current.getElements();

    elementsRef.current.forEach((element) => {
      if (!panZoomElementsRef[element.id]) return;

      const { position } = panZoomElementsRef[element.id];

      const start = calculateCellPositionByPixels(position.x, position.y);

      element.x = start.x;
      element.y = start.y;

      panZoomRef.current.updateElementPositionSilent(
        element.id,
        calculatePixelsByCellPosition(element, {
          gapHorizontal, gapVertical, paddingLeft, colWidth, rowHeight,
        }),
      );
    });

    const internalMeasureElementHeight = (element: GridElement) => {
      let height = measureElementHeight(element);

      if (options && options.marginBottomAtElements && options.marginBottomAtElements[element.id]) {
        height += options.marginBottomAtElements[element.id];
      }

      return height;
    };

    const nextElements = organizeGridElements({
      startingElements: elementsRef.current,
      cols,
      rows,
      measureElementHeight: internalMeasureElementHeight,
      selectedElements,
    });

    if (nextElements.length !== elementsRef.current.length) {
      hasCollision.current = true;
      return elementsRef.current;
    }

    setElements(nextElements, { type: 'programmatic' });

    hasCollision.current = false;

    return nextElements;
  }, [cols, colWidth, elements, gapHorizontal, gapVertical, paddingLeft, rows, rowHeight]);

  return onOrganizeElements;
};

export default useOrganizeElements;
