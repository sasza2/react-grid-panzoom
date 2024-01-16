import { useCallback } from 'react';

import { GridElement } from 'types';
import { ElementProps } from '@/Element';
import calculatePixelsByCellPosition from '@/helpers/calculatePixelsByCellPosition';
import { isLengthAuto } from '@/helpers/isLengthAuto';
import useMeasureElementHeight from './useMeasureElementHeight';
import useCalculateCellPositionByPixels from './useCalculateCellPositionByPixels';
import { useGrid } from './useGrid';

const getElementById = (elements: GridElement[], id: string | number) => (
  elements.find((element) => element.id === id)
);

const useOnAfterResize = () => {
  const {
    cols,
    colWidth,
    elements,
    elementsHeightRef,
    gapHorizontal,
    gapVertical,
    organizeGridElements,
    panZoomRef,
    paddingLeft,
    rows,
    rowHeight,
    setElements,
    setSelectedElements,
  } = useGrid();

  const calculateCellPositionByPixels = useCalculateCellPositionByPixels();
  const measureElementHeight = useMeasureElementHeight();

  const onAfterResize: ElementProps['onAfterResize'] = useCallback(({ id }) => {
    const panZoomElementsRef = panZoomRef.current.getElements();
    const zoom = panZoomRef.current.getZoom();
    const { node: elementNode } = panZoomElementsRef[id];

    const startingElements = elements.map((originalElement) => {
      if (originalElement.id !== id) return originalElement;

      const element = { ...originalElement };

      const { node, position } = panZoomElementsRef[id];

      const start = calculateCellPositionByPixels(position.x, position.y);

      element.x = start.x;
      element.y = start.y;

      const { width } = node.current.getBoundingClientRect();

      const end = calculateCellPositionByPixels(position.x + width / zoom, position.y);

      element.w = end.x - start.x;
      if (element.w < 1) element.w = 1;

      return { ...element };
    });

    const originalElement = getElementById(elements, id);
    const selectedElement = getElementById(startingElements, id);

    const updateElement = (element: GridElement) => {
      elementNode.current.style.transition = '0.3s all';
      elementNode.current.style.width = isLengthAuto(colWidth)
        ? undefined
        : `${colWidth * element.w + gapHorizontal * (element.w - 1)}px`;

      panZoomRef.current.updateElementPositionSilent(id, calculatePixelsByCellPosition(element, {
        gapHorizontal, gapVertical, paddingLeft, colWidth, rowHeight,
      }));
    };

    elementNode.current.style.transition = 'none';
    elementsHeightRef.current = {};

    const nextElements = organizeGridElements({
      startingElements,
      cols,
      rows,
      measureElementHeight,
      selectedElements: [selectedElement],
    });

    if (nextElements.length !== elements.length) {
      updateElement(originalElement);
      elementsHeightRef.current = {};
      return;
    }

    updateElement(selectedElement);
    setElements(nextElements, { type: 'user' });
    setSelectedElements([]);
    elementsHeightRef.current = {};
  }, [cols, colWidth, elements, gapHorizontal, gapVertical, paddingLeft, rows, rowHeight]);

  return onAfterResize;
};

export default useOnAfterResize;
