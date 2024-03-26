import { useCallback, useRef } from 'react';

import { ElementProps } from '@/Element';
import { useGrid } from './useGrid';
import useGrabElement from './useGrabElement';

const useOnClick = () => {
  const { elements, onElementClick } = useGrid();
  const grabElement = useGrabElement();

  const onElementClickRef = useRef<typeof onElementClick>();
  onElementClickRef.current = onElementClick;

  const onClick: ElementProps['onClick'] = useCallback(({
    e, id, family, stop,
  }) => {
    const element = elements.find((item) => item.id === id);
    if (!element || element.disabled) return;

    e.preventDefault();
    e.stopPropagation();

    let isStopped = false;

    const onGridStop = () => {
      isStopped = true;
      stop();
    };

    if (onElementClickRef.current) {
      onElementClickRef.current(
        element,
        {
          e,
          stop: onGridStop,
        },
      );
    }

    if (isStopped) return;

    grabElement(id, family);
  }, [grabElement]);

  return onClick;
};

export default useOnClick;
