import { useCallback, useRef } from 'react';

import { ElementProps } from '@/Element';
import { useGrid } from './useGrid';
import useGrabElement from './useGrabElement';

const useOnClick = () => {
  const { elements, onElementClick } = useGrid();
  const grabElement = useGrabElement();

  const onElementClickRef = useRef<typeof onElementClick>();
  onElementClickRef.current = onElementClick;

  const onClick: ElementProps['onClick'] = useCallback(({ e, id, family }) => {
    e.preventDefault();
    e.stopPropagation();

    grabElement(id, family);

    if (onElementClickRef.current) {
      onElementClickRef.current(elements.find((element) => element.id === id));
    }
  }, [grabElement]);

  return onClick;
};

export default useOnClick;
