import { useImperativeHandle } from 'react';

import { Position } from 'types';
import { useGrid } from './useGrid';
import useGrabElement from './useGrabElement';
import useMeasureElementHeight from './useMeasureElementHeight';
import useCalculateCellPositionByPixels from './useCalculateCellPositionByPixels';
import useOrganizeElements from './useOrganizeElements';

const useApi = () => {
  const {
    elements, elementsNodes, forwardRef, panZoomRef,
  } = useGrid();

  const calculateCellPositionByPixels = useCalculateCellPositionByPixels();
  const grabElement = useGrabElement();
  const measureElementHeight = useMeasureElementHeight();
  const organizeElements = useOrganizeElements();

  useImperativeHandle(
    forwardRef,
    () => ({
      calculateCellPositionByPixels,
      getPanZoom: () => panZoomRef.current,
      grabElement: (id: string, position?: Position) => {
        panZoomRef.current.grabElement(id, position);
        setTimeout(() => grabElement(id), 0);
      },
      measureElementHeight: (id: string | number): number | null => {
        const element = elements.find((item) => item.id === id);
        if (!element) return null;
        return measureElementHeight(element);
      },
      organizeElements,
      getElementsPaddingBottom: () => {
        const zoom = panZoomRef.current.getZoom();
        const elementsPadding: Record<string | number, number> = {};

        Object.entries(elementsNodes.current).forEach(([id, elementNode]) => {
          const childRect = elementNode.getBoundingClientRect();
          const parentRect = (elementNode.parentNode as HTMLDivElement).getBoundingClientRect();
          const diff = Math.max(parentRect.height - childRect.height, 0);
          elementsPadding[id] = diff / zoom;
        });

        return elementsPadding;
      },
    }),
  );
};

export default useApi;
