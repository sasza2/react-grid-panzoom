import { useCallback } from 'react';

import { ElementProps } from '@/Element';
import { useGrid } from './useGrid';
import useUpdateWithPanZoomApi from './useUpdateWithPanZoomApi';

const useOnElementMouseUp = () => {
  const {
    currentElements,
    elements,
    elementsHeightRef,
    elementRef,
    hasCollision,
    setElements,
    setSelectedElements,
    selectedElements,
  } = useGrid();

  const updateWithPanZoomApi = useUpdateWithPanZoomApi();

  const onMouseUp: ElementProps['onMouseUp'] = useCallback(({ e }) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasCollision.current) {
      elements.forEach((element) => {
        updateWithPanZoomApi(element);
      });
    } else {
      selectedElements.forEach((element) => updateWithPanZoomApi(element));
      setElements(currentElements.current, { type: 'user' });
    }

    elementsHeightRef.current = {};

    const target = elementRef.current;
    target.style.transition = 'all 0.3s';

    currentElements.current = [];
    setSelectedElements([]);

    hasCollision.current = false;
  }, [elements, selectedElements]);

  return onMouseUp;
};

export default useOnElementMouseUp;
