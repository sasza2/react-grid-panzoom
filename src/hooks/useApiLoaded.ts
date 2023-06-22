import { useEffect, useState } from 'react';

import { useGrid } from './useGrid';

const useApiLoaded = () => {
  const { panZoomRef } = useGrid();
  const [apiLoaded, setApiLoaded] = useState(false);

  useEffect(() => {
    if (apiLoaded || !panZoomRef.current) return;

    setApiLoaded(true);
  }, [apiLoaded, panZoomRef.current]);

  return apiLoaded;
};

export default useApiLoaded;
