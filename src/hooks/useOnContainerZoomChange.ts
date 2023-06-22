import { useCallback } from 'react';

import { useGrid } from './useGrid';

const useOnContainerZoomChange = () => {
  const { elementsHeightRef } = useGrid();

  const onContainerZoomChange = useCallback(() => {
    elementsHeightRef.current = {};
  }, []);

  return onContainerZoomChange;
};

export default useOnContainerZoomChange;
