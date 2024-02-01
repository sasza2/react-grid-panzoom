import { useCallback } from 'react';

import copyElements from '../helpers/copyElements';
import getSelectedElements from '../helpers/getSelectedElements';
import { useGrid } from './useGrid';

const useGrabElement = () => {
  const {
    currentElements, elementRef, elements, gridRef, setSelectedElements,
  } = useGrid();

  const grabElement = useCallback((id: string | number, family?: string) => {
    const target: HTMLDivElement = gridRef.current?.querySelector(`.react-panzoom-element--id-${id}`);
    if (!target) return;

    currentElements.current = copyElements(elements);
    setSelectedElements(getSelectedElements(currentElements.current, id, family));

    elementRef.current = target;
    target.style.transition = 'none';

    const onPointerMove = (e: PointerEvent) => {
      if (e.buttons) return;

      setSelectedElements([]);

      window.removeEventListener('pointermove', onPointerMove, true);

      target.style.transition = '0.3s all';
    };

    window.addEventListener('pointermove', onPointerMove, true);
  }, [elements]);

  return grabElement;
};

export default useGrabElement;
