import { useEffect } from 'react';

import { WATCH_ELEMENTS_HEIGHT_DELAY } from '@/consts';
import { isLengthAuto } from '@/helpers/isLengthAuto';
import { useGrid } from './useGrid';
import useMeasureElementHeight from './useMeasureElementHeight';

const useWatchElementsHeight = () => {
  const {
    elements,
    elementsHeightRef,
    elementsNodes,
    gapVertical,
    onElementsMeasureUpdateRef,
    rowHeight,
    panZoomRef,
  } = useGrid();

  const measureElementHeight = useMeasureElementHeight();

  useEffect(() => {
    let lastElementsHeightSum = '';

    const timer = setInterval(() => {
      elementsHeightRef.current = {};

      elements.forEach((element) => {
        if (!isLengthAuto(element.h)) return;

        const elementNode = elementsNodes.current[element.id];
        if (!elementNode) return;

        const parentNode = elementNode.parentNode as HTMLDivElement;
        if (!parentNode) return;

        const height = (rowHeight + gapVertical) * measureElementHeight(element) - gapVertical;
        parentNode.style.height = `${height}px`;
      });

      if (!onElementsMeasureUpdateRef.current) return;

      const currentElementsHeightSum = JSON.stringify(elementsHeightRef.current);
      if (lastElementsHeightSum === currentElementsHeightSum) return;

      lastElementsHeightSum = currentElementsHeightSum;
      onElementsMeasureUpdateRef.current(elementsHeightRef.current);
    }, WATCH_ELEMENTS_HEIGHT_DELAY);

    return () => {
      clearInterval(timer);
    };
  }, [elements, gapVertical, rowHeight, panZoomRef]);
};

export default useWatchElementsHeight;
