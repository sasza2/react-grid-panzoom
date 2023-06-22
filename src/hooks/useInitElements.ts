import { useEffect, useRef } from 'react';

import { useGrid } from './useGrid';

let currentId = 0;

const useInitElements = () => {
  const { elements, setElements } = useGrid();
  const hasInit = useRef(false);

  useEffect(() => {
    if (hasInit.current) return;
    hasInit.current = true;

    let shouldUpdate = false;
    elements.forEach((element) => {
      if (!element.id || !element.w || !element.h) shouldUpdate = true;
    });

    if (!shouldUpdate) return;

    setElements(elements.map((element) => {
      if (!element.id) {
        return {
          id: ++currentId, ...element, w: element.w || 1, h: element.h || 1,
        };
      }
      return element;
    }), { type: 'programmatic' });
  }, [elements]);
};

export default useInitElements;
